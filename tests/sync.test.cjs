const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { webcrypto } = require('node:crypto');
const core = require('../sync-core.js');
const editing = require('../record-editing.js');
const clone = core.clone;
const day = '2026-09-09';
const stamp = '2026-09-09T10:00:00Z';
const book = (records = []) => ({
  records: { [day]: records }, profile: { name: 'Test puppy', updatedAt: stamp },
  activeSessions: {}, stoppedSessionIds: [], deletedRecordIds: [], bookmarks: {}, photos: [],
  sync: { code: 'test-fixture-only', firebaseConfig: '{"projectId":"fixture","apiKey":"test"}', lastSync: stamp },
  foodSettings: { snacks: [], snackAmounts: {}, updatedAt: stamp }
});
const record = (id) => ({ id, type: 'pee', time: '10:00', updatedAt: stamp });
function app(file = 'app.js', stored = book(), storage = new Map()) {
  if (!storage.has('puppy-record-book-state')) storage.set('puppy-record-book-state', JSON.stringify(stored));
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, { value: '', textContent: '', hidden: false, childNodes: [{nodeValue: ''}], classList: { add(){}, remove(){}, toggle(){} }, addEventListener(){}, setAttribute(){}, focus(){}, closest(){ return null; } });
    return nodes.get(id);
  };
  const context = vm.createContext({ PuppySync: core, PuppyEditing: editing, console, Date, Intl, URL, crypto: webcrypto,
    navigator: { onLine: true }, document: { hidden: false, activeElement: null, querySelector: node, querySelectorAll: () => [] },
    window: { setTimeout: () => 1, clearTimeout(){}, confirm: () => true },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }
  });
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8').replace('\ninit();', '\n');
  vm.runInContext(source, context);
  const main = file === 'app.js';
  vm.runInContext(main ? `
    createLocalBackup = () => {}; hydrateMainProfile = () => {}; hydrateProfileForm = () => {};
    refreshCurrentView = () => {}; renderReminderSections = () => {}; renderMain = () => {};
    elements.syncCode.value = state.sync.code; elements.firebaseConfig.value = state.sync.firebaseConfig;
  ` : 'render = () => {}; updateWidgetTitle = () => {};', context);
  return { context, storage, run: code => vm.runInContext(code, context), state: () => JSON.parse(vm.runInContext('JSON.stringify(state)', context)) };
}
function server(client, remote = book(), hooks = {}) {
  let current = { data: clone(remote) }, active = 0, maximum = 0;
  const services = {
    db: {}, doc: () => ({}),
    getDoc: async () => {
      if (hooks.read) await hooks.read();
      return { exists: () => true, data: () => ({ bookData: clone(current) }) };
    },
    runTransaction: async (_db, fn) => {
      maximum = Math.max(maximum, ++active);
      try {
        let staged;
        await fn({ get: async () => ({ exists: () => true, data: () => ({ bookData: clone(current) }) }), set: (_ref, data) => { staged = data.bookData; } });
        if (hooks.commit) await hooks.commit();
        current = clone(staged);
      } finally { active--; }
    }
  };
  client.context.fakeServices = services;
  client.run('getFirebaseServices = async () => fakeServices');
  return { data: () => clone(current.data), maximum: () => maximum };
}
test('record merge is convergent, preserves both books and honors deletions', () => {
  const a = { [day]: [record('a'), record('deleted')] }, b = { [day]: [record('b'), record('a')] };
  assert.deepEqual(core.mergeRecords(a, b, ['deleted']), core.mergeRecords(b, a, ['deleted']));
  assert.equal(core.mergeRecords(a, b, ['deleted'])[day].length, 2);
});
test('newer version of a record wins and moving dates cannot duplicate an ID', () => {
  const old = record('same'), latest = { ...old, time: '11:00', updatedAt: '2026-09-09T11:00:00Z' };
  const merged = core.mergeRecords({ [day]: [old] }, { '2026-09-10': [latest] });
  assert.deepEqual(merged, { '2026-09-10': [latest] });
});
test('stops defeat old active timers, double stops create one completed record', () => {
  const a = book([{ ...record('session-sleep1'), type: 'sleep' }]), b = clone(a);
  a.activeSessions.sleep = { id: 'sleep1', start: stamp, updatedAt: stamp };
  b.stoppedSessionIds = ['sleep1'];
  const merged = core.mergeBook(a, b);
  assert.deepEqual(merged.activeSessions, {});
  assert.equal(merged.records[day].length, 1);
});
test('bookmarks and snack defaults retain the newest updates including empty lists', () => {
  const a = book(), b = book();
  a.bookmarks[day] = { bookmarked: true, note: 'old', updatedAt: stamp };
  b.bookmarks[day] = { bookmarked: true, note: '', updatedAt: '2026-09-09T11:00:00Z' };
  a.foodSettings = { snacks: ['Old'], snackAmounts: { Old: '5g' }, snacksUpdatedAt: stamp };
  b.foodSettings.snacksUpdatedAt = '2026-09-09T11:00:00Z';
  const merged = core.mergeBook(a, b);
  assert.equal(merged.bookmarks[day].note, '');
  assert.deepEqual(merged.foodSettings.snacks, []);
});
test('verification accepts a later stop/deletion but rejects missing data', () => {
  const a = book([record('a')]), b = book();
  assert.throws(() => core.assertRecordsPresent(a, b));
  b.deletedRecordIds = ['a'];
  assert.doesNotThrow(() => core.assertRecordsPresent(a, b));
  assert.throws(() => core.remoteData({ wrong: true }));
});
for (const file of ['app.js', 'quick-widget.js']) {
  test(`${file}: edit during push remains pending, then retry merges both books`, async () => {
    const client = app(file, book([record('local')]));
    client.run(file === 'app.js' ? 'persist(); state._pendingSync = "first"; persist({skipAutoSync:true})' : 'setSyncPending(true); persist()');
    let changed = false;
    const cloud = server(client, book([record('remote')]), { read: async () => {
      if (changed) return;
      changed = true;
      client.run(`state.records['${day}'].push({id:'during',type:'poop',time:'11:00'}); ${file === 'app.js' ? 'persist()' : 'setSyncPending(true); persist()'}`);
    } });
    await client.run(file === 'app.js' ? 'pushFirebaseSync()' : 'syncNow()');
    assert.ok(client.state()._pendingSync);
    assert.equal(client.state().records[day].length, 3);
    assert.equal(cloud.data().records[day].length, 2);
    await client.run(file === 'app.js' ? 'pushFirebaseSync()' : 'syncNow()');
    assert.equal(cloud.data().records[day].length, 3);
    assert.equal(client.state()._pendingSync, undefined);
  });
  test(`${file}: failed transaction does not replace local state; pending survives reload`, async () => {
    const client = app(file, book([record('local')]));
    client.run(file === 'app.js' ? `state.records['${day}'].push({id:'new',type:'pee'});persist()` : 'setSyncPending(true); persist()');
    const before = client.state();
    server(client, book([record('remote')]), { commit: async () => { throw Error('Connection dropped'); } });
    await client.run(file === 'app.js' ? 'pushFirebaseSync()' : 'syncNow()');
    assert.deepEqual(client.state().records, before.records);
    assert.ok(client.state()._pendingSync);
    assert.ok(app(file, undefined, client.storage).state()._pendingSync);
  });
  test(`${file}: overlapping push and pull requests run one at a time`, async () => {
    const client = app(file);
    const cloud = server(client);
    await Promise.all([client.run(file === 'app.js' ? 'pushFirebaseSync()' : 'syncNow()'), client.run(file === 'app.js' ? 'pullFirebaseSync({confirmPending:false})' : 'pullQuietly()')]);
    assert.equal(cloud.maximum(), 1);
  });
  test(`${file}: saves incorporate an unseen change from another same-origin window`, () => {
    const client = app(file, book([record('local')]));
    client.storage.set('puppy-record-book-state', JSON.stringify(book([record('other-window')])));
    client.run('persist()');
    assert.equal(JSON.parse(client.storage.get('puppy-record-book-state')).records[day].length, 2);
  });
}
test('widget migration preserves profile fields, timestamps, and deliberately empty meals', () => {
  const fixture = book(); fixture.profile.breed = 'Golden retriever'; fixture.profile.notes = 'Keep';
  fixture.foodTimes = { morning: '', updatedAt: stamp }; fixture.foodSettings.amounts = { morning: '', evening: '' };
  const result = app('quick-widget.js', fixture).state();
  assert.equal(result.profile.breed, fixture.profile.breed);
  assert.equal(result.profile.updatedAt, stamp);
  assert.equal(result.foodTimes.updatedAt, stamp);
  assert.equal(result.foodSettings.amounts.morning, '');
});
test('retiring GPS removes only location settings, preserving records and running walks', () => {
  const fixture = book([record('walk-history')]);
  fixture.activeSessions.walk = { id: 'running-walk', type: 'walk', start: stamp, updatedAt: stamp };
  const client = app('app.js', fixture);
  client.storage.set('puppy-record-book-gps-walk', JSON.stringify({ enabled: true, base: { latitude: 52, longitude: 13 } }));
  const before = client.storage.get('puppy-record-book-state');
  client.run('clearRetiredGpsSettings()');
  assert.equal(client.storage.has('puppy-record-book-gps-walk'), false);
  assert.equal(client.storage.get('puppy-record-book-state'), before);
  assert.equal(client.state().activeSessions.walk.id, 'running-walk');
});

for (const file of ['app.js', 'quick-widget.js']) {
  test(`${file}: first connection adopts remote defaults without discarding local records`, async () => {
    const fixture = book([record('local')]); fixture.sync.lastSync = ''; fixture.profile = { name: 'Default' };
    const client = app(file, fixture);
    const remote = book([record('remote')]); remote.profile = { name: 'Shared puppy', breed: 'Golden retriever' };
    const cloud = server(client, remote);
    await client.run(file === 'app.js' ? 'pushFirebaseSync()' : 'syncNow()');
    assert.equal(client.state().profile.name, 'Shared puppy');
    assert.equal(cloud.data().records[day].length, 2);
  });
  test(`${file}: offline push keeps the pending marker and reports failure`, async () => {
    const client = app(file, book([record('local')]));
    client.run(file === 'app.js' ? `state.records['${day}'].push({id:'offline',type:'pee'}); persist()` : 'setSyncPending(true); persist()');
    client.context.navigator.onLine = false;
    let calls = 0;
    server(client, book(), { commit: async () => calls++ });
    await client.run(file === 'app.js' ? 'pushFirebaseSync()' : 'syncNow()');
    assert.equal(calls, 0);
    assert.ok(client.state()._pendingSync);
    assert.match(client.run(file === 'app.js' ? 'elements.syncStatus.textContent' : 'elements.statusText.textContent'), /failed/i);
  });
  test(`${file}: repeated push taps are combined into one transaction`, async () => {
    const client = app(file);
    let calls = 0;
    server(client, book(), { commit: async () => calls++ });
    await Promise.all(Array.from({length: 5}, () => client.run(file === 'app.js' ? 'pushFirebaseSync()' : 'syncNow()')));
    assert.equal(calls, 1);
  });
}
test('PWA does not overwrite profile inputs while merging', () => {
  const client = app();
  client.run('currentView = "profile"; hydrateProfileForm = () => { throw Error("overwrote form") };');
  client.context.payload = { data: book([record('from-phone')]) };
  assert.doesNotThrow(() => client.run('mergeSyncedPayload(payload)'));
});
test('verification rejects an incomplete record even when its ID still exists', () => {
  const expected = book([{ ...record('a'), amount: '35g' }]);
  assert.throws(() => core.assertRecordsPresent(expected, book([record('a')])));
});

const mixedFood = () => ({ id: 'meal', type: 'food', foodKind: 'food', time: '10:00', amount: '100g',
  foodComponents: [{name: 'Food A', amount: '70g'}, {name: 'Food B', amount: '30g'}], note: '70g Food A + 30g Food B - Morning' });

test('mixed food editing keeps both products, calculates decimal totals and updates generated notes', () => {
  const original = mixedFood(), before = clone(original);
  const result = editing.foodEdit(original, {...original}, ['80,5', '25g']);
  assert.equal(result.amount, '105.5g');
  assert.equal(result.note, '80.5g Food A + 25g Food B - Morning');
  assert.deepEqual(result.foodComponents.map(c => c.name), ['Food A','Food B']);
  assert.deepEqual(original, before);
});
test('food amount changes preserve personal notes and single-food breakdowns', () => {
  const original = {...mixedFood(), foodComponents: [{name:'Food A',amount:'100g'}],note:'Ate slowly'};
  const result = editing.foodEdit(original, {...original, amount:'90,25'});
  assert.equal(result.amount, '90.25g');
  assert.equal(result.foodComponents[0].amount, '90.25g');
  assert.equal(result.note, 'Ate slowly');
});
test('snack quantities may remain blank or descriptive and invalid meal quantities are rejected', () => {
  const snack = {...mixedFood(),foodKind:'snack',snackName:'Treat',amount:''};
  assert.equal(editing.foodEdit(snack, snack).amount, '');
  assert.equal(editing.foodEdit(snack, {...snack,amount:'1 piece'}).amount, '1 piece');
  for (const amount of ['-10', 'NaN', 'twenty', '12kg', '1000001g']) {
    assert.throws(() => editing.foodEdit(undefined, {type:'food',amount}));
  }
  assert.equal(editing.foodEdit(undefined,{type:'food',amount:'0'}).amount, '0g');
});
test('Enter submits once but Shift+Enter, key repeats, and IME confirmation do not', () => {
  assert.ok(editing.saveKey({key:'Enter'}));
  for (const flag of ['shiftKey','ctrlKey','altKey','metaKey','isComposing','repeat']) assert.equal(editing.saveKey({key:'Enter',[flag]:true}), false);
  assert.equal(editing.saveKey({key:'Escape'}), false);
});
test('calendar food edits move dates without losing the food mixture and sync the replacement', async () => {
  const client = app('app.js', book([mixedFood()]));
  client.run(`
    selectedDate = '${day}';
    startCalendarEditRecord(state.records[selectedDate][0]);
    selectedDate = '2026-09-10';
    elements.calendarEditorTime.value = '12:15';
    elements.calendarFoodComponentAmounts[0].value = '85';
    elements.calendarFoodComponentAmounts[1].value = '20,5';
    renderCalendarView = () => {}; renderCategory = () => {};
    updateCalendarEditedRecord();
  `);
  const replacement = client.state().records['2026-09-10'][0];
  assert.equal(replacement.amount, '105.5g');
  assert.equal(replacement.time, '12:15');
  assert.ok(replacement.updatedAt);
  assert.equal(client.state().records[day], undefined);
  assert.ok(client.state().deletedRecordIds.includes('meal'));
  assert.ok(client.state()._pendingSync);
  const cloud = server(client, book([mixedFood(), record('other-phone')]));
  await client.run('pushFirebaseSync()');
  assert.equal(cloud.data().records['2026-09-10'][0].amount, '105.5g');
  assert.deepEqual(cloud.data().records[day].map(r=>r.id), ['other-phone']);
});
test('daily food edits retain food components and do not navigate away', () => {
  const client = app('app.js',book([mixedFood()]));
  client.run(`selectedDate='${day}'; currentView='day';
    startEditRecord(state.records[selectedDate][0]);
    elements.foodComponentAmounts[0].value='90'; elements.foodComponentAmounts[1].value='10';
    renderDayView=()=>{}; updateEditedRecord();`);
  assert.equal(client.state().records[day][0].foodComponents[0].amount,'90g');
  assert.equal(client.run('currentView'),'day');
});
test('invalid food edit leaves stored record and draft intact', () => {
  const client=app('app.js',book([mixedFood()]));
  const before=client.state().records;
  client.run(`selectedDate='${day}'; startCalendarEditRecord(state.records[selectedDate][0]);
    elements.calendarFoodComponentAmounts[0].value='-50'; updateCalendarEditedRecord();`);
  assert.deepEqual(client.state().records,before);
  assert.equal(client.run('calendarEditingRecordId'),'meal');
});
test('background merge cannot replace a calendar draft or resurrect a remotely deleted edited log', () => {
  const client=app('app.js',book([mixedFood()]));
  client.run(`selectedDate='${day}'; currentView='calendar'; startCalendarEditRecord(state.records[selectedDate][0]);
    elements.calendarFoodComponentAmounts[0].value='125';
    refreshCurrentView=()=>{throw Error('draft was rerendered')};`);
  client.context.payload={data:{...book([record('remote')]),deletedRecordIds:['meal']}};
  client.run('mergeSyncedPayload(payload); updateCalendarEditedRecord()');
  assert.equal(client.run('elements.calendarFoodComponentAmounts[0].value'),'125');
  assert.deepEqual(client.state().records[day].map(r=>r.id),['remote']);
});
