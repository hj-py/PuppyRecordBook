const storageKey = "puppy-record-book-state";
const feedingPlanVisibilityKey = "puppy-record-book-feeding-plan-visible";
const timedTypes = ["walk", "play", "sleep", "train", "box"];
const defaultSnackList = ["Dental stick", "Training treat", "Carrot"];
const typeConfig = {
  pee: { label: "Pee", icon: "P", color: "#7fa6b8" },
  poop: { label: "Poop", icon: "P", color: "#7b5f45" },
  walk: { label: "Walk", icon: "W", color: "#617861" },
  play: { label: "Play", icon: "Pl", color: "#d68a6a" },
  sleep: { label: "Sleep", icon: "S", color: "#6f7896" },
  train: { label: "Train", icon: "T", color: "#817044" },
  food: { label: "Food", icon: "F", color: "#d69b41" },
  snack: { label: "Snack", icon: "Sn", color: "#d69b41" },
  water: { label: "Water", icon: "Wa", color: "#5799ad" },
  box: { label: "Box", icon: "B", color: "#8a7768" },
  tooth: { label: "Brush teeth", icon: "Bt", color: "#6f8fb4" },
};

let firebaseServices = null;
let syncTimer = null;
let syncInProgress = false;
let pullInProgress = false;
let syncRetryDelay = 5000;
const pendingSyncKey = "puppy-record-book-widget-sync-pending";
let syncPending = localStorage.getItem(pendingSyncKey) === "1";
const serializeFirebase = PuppySync.serialQueue();
let pushPromise = null;
let pullPromise = null;
let feedingPlanVisible = localStorage.getItem(feedingPlanVisibilityKey) !== "0";
let localStateUnreadable = false;
const state = loadState();
syncPending ||= Boolean(state._pendingSync);
let lastPersistedStateJson = JSON.stringify(state);
const elements = {
  widgetTitle: document.querySelector("#widgetTitle"),
  statusText: document.querySelector("#statusText"),
  todaySummary: document.querySelector("#todaySummary"),
  feedingPlanCard: document.querySelector("#feedingPlanCard"),
  feedingPlanText: document.querySelector("#feedingPlanText"),
  feedingPlanToggle: document.querySelector("#feedingPlanToggle"),
  snackChooser: document.querySelector("#snackChooser"),
  snackName: document.querySelector("#snackName"),
  cancelSnack: document.querySelector("#cancelSnack"),
  recordCount: document.querySelector("#recordCount"),
  recordList: document.querySelector("#recordList"),
  syncNow: document.querySelector("#syncNow"),
  syncCode: document.querySelector("#syncCode"),
  firebaseConfig: document.querySelector("#firebaseConfig"),
};

init();

function init() {
  updateWidgetTitle();
  elements.syncCode.value = state.sync?.code || "";
  elements.firebaseConfig.value = state.sync?.firebaseConfig || "";
  if (localStateUnreadable) {
    document.querySelectorAll("button, input, textarea, select").forEach(control => { control.disabled = true; });
    setStatus("Local data could not be read. It has not been overwritten. Keep it intact and seek help recovering a backup before logging or syncing.");
    return;
  }
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleQuickAction(button.dataset.action));
  });
  elements.syncNow.addEventListener("click", syncNow);
  elements.snackName.addEventListener("change", saveSnackRecord);
  elements.cancelSnack.addEventListener("click", closeSnackChooser);
  elements.feedingPlanToggle.addEventListener("change", () => {
    feedingPlanVisible = elements.feedingPlanToggle.checked;
    localStorage.setItem(feedingPlanVisibilityKey, feedingPlanVisible ? "1" : "0");
    render();
  });
  [elements.syncCode, elements.firebaseConfig].forEach((input) => input.addEventListener("input", saveSyncSettings));
  window.setInterval(render, 1000);
  window.addEventListener("focus", resumeSync);
  window.addEventListener("online", resumeSync);
  window.addEventListener("storage", (event) => {
    if (event.key !== storageKey || !event.newValue) return;
    const incoming = JSON.parse(event.newValue);
    Object.assign(state, PuppySync.mergeBook(state, migrateState(incoming)));
    if (incoming._pendingSync) {
      state._pendingSync = incoming._pendingSync;
      syncPending = true;
      pushSoon();
    }
    render();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      resumeSync();
    }
  });
  render();
  resumeSync();
}

async function handleQuickAction(type) {
  if (type === "snack") {
    openSnackChooser();
    return;
  }
  if (timedTypes.includes(type)) {
    toggleTimedType(type);
  } else if (type === "food") {
    recordFoodNow();
  } else if (type === "water") {
    addQuickRecord("water", "Water", "");
  } else {
    addQuickRecord(type, "", "");
  }
  setSyncPending(true);
  persist();
  render();
  pushSoon();
}

function openSnackChooser() {
  const snacks = getSnackOptions();
  if (!snacks.length) {
    setStatus("Add a snack and its default amount in the main app Settings first.");
    return;
  }
  elements.snackName.innerHTML = [
    '<option value="">Choose snack</option>',
    ...snacks.map((snack) => `<option value="${escapeHtml(snack)}">${escapeHtml(snack)}</option>`),
  ].join("");
  elements.snackName.value = "";
  elements.snackChooser.hidden = false;
  elements.snackName.focus();
}

function closeSnackChooser() {
  elements.snackChooser.hidden = true;
}

function saveSnackRecord() {
  const snackName = elements.snackName.value.trim();
  if (!snackName) {
    return;
  }
  addQuickRecord("food", getSnackDefaultAmount(snackName), "", { foodKind: "snack", snackName });
  closeSnackChooser();
  setStatus(`${snackName} saved.`);
  setSyncPending(true);
  persist();
  render();
  pushSoon();
}

function getSnackOptions() {
  return normalizeSnackList(state.foodSettings?.snacks);
}

function getSnackDefaultAmount(snackName) {
  const target = String(snackName || "").trim().toLowerCase();
  const amounts = state.foodSettings?.snackAmounts;
  if (!amounts || typeof amounts !== "object" || Array.isArray(amounts)) return "";
  const match = Object.entries(amounts).find(([name]) => name.toLowerCase() === target);
  return String(match?.[1] || "").trim();
}

function toggleTimedType(type) {
  const now = new Date();
  const existing = normalizeActiveSession(type, state.activeSessions?.[type]);
  if (!existing) {
    state.activeSessions[type] = { id: createId(), type, start: now.toISOString(), updatedAt: now.toISOString() };
    setStatus(`${typeConfig[type].label} started.`);
    return;
  }
  const start = new Date(existing.start);
  const minutes = Math.max(1, Math.round((now - start) / 60000));
  state.stoppedSessionIds = Array.from(new Set([...(state.stoppedSessionIds || []), existing.id]));
  delete state.activeSessions[type];
  addRecord(toKey(start), {
    id: `session-${existing.id}`,
    updatedAt: now.toISOString(),
    type,
    time: start.toTimeString().slice(0, 5),
    startTime: start.toTimeString().slice(0, 5),
    endTime: now.toTimeString().slice(0, 5),
    durationMinutes: minutes,
    amount: `${minutes} min`,
    note: "",
  });
  setStatus(`${typeConfig[type].label} stopped. ${formatDuration(minutes)} saved.`);
}

function recordFoodNow() {
  const meal = getCurrentMealSetting();
  const components = [
    { name: state.foodSettings?.type || "Food 1", amount: meal.amount || "" },
    { name: state.foodSettings?.type2 || "Food 2", amount: meal.amount2 || "" },
  ].filter((component) => component.amount);
  const totalGrams = components.reduce((total, component) => total + parseGrams(component.amount), 0);
  const amount = totalGrams > 0 ? `${totalGrams}g` : components.map((component) => component.amount).join(" + ") || "Food";
  const mixture = components.map((component) => `${component.amount} ${component.name}`.trim()).join(" + ");
  const note = [mixture, meal.label].filter(Boolean).join(" - ");
  addQuickRecord("food", amount, note, { foodKind: "food", foodComponents: components });
}

function getCurrentMealSetting() {
  const now = new Date();
  const foodTimes = state.foodTimes || {};
  const amounts = state.foodSettings?.amounts || {};
  const secondAmounts = state.foodSettings?.secondAmounts || {};
  const options = [
    { label: "Morning", time: foodTimes.morning, amount: amounts.morning, amount2: secondAmounts.morning },
    { label: "Afternoon", time: foodTimes.afternoon, amount: amounts.afternoon, amount2: secondAmounts.afternoon },
    { label: "Evening", time: foodTimes.evening, amount: amounts.evening, amount2: secondAmounts.evening },
  ].filter((item) => item.time);
  if (!options.length) {
    return { label: "Food", amount: "" };
  }
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return options
    .map((item) => ({ ...item, distance: Math.abs(minutesOfDay(item.time) - currentMinutes) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function addQuickRecord(type, amount, note, extra = {}) {
  const now = new Date();
  addRecord(toKey(now), {
    id: createId(),
    type,
    time: now.toTimeString().slice(0, 5),
    amount,
    note,
    ...extra,
  });
  setStatus(`${typeConfig[type].label} saved.`);
}

function parseGrams(value) {
  const match = String(value || "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Number(match[1].replace(",", ".")) : 0;
}

function addRecord(dateKey, record) {
  state.records[dateKey] = [...(state.records[dateKey] || []), record];
}

function render() {
  const todayKey = toKey(new Date());
  const records = [...(state.records[todayKey] || [])].sort((a, b) => (b.time || "").localeCompare(a.time || ""));
  const active = normalizeActiveSessions(state.activeSessions || {});
  document.querySelectorAll("[data-action]").forEach((button) => {
    const type = button.dataset.action;
    const session = active[type];
    button.classList.toggle("active", Boolean(session));
    button.textContent = session ? `Stop ${typeConfig[type].label} ${getElapsedText(session)}` : typeConfig[type].label;
  });
  elements.recordCount.textContent = records.length;
  elements.todaySummary.textContent = buildTodaySummary(records, active);
  const feedingPlan = getFeedingPlanText();
  elements.feedingPlanCard.hidden = !feedingPlan;
  elements.feedingPlanText.textContent = feedingPlan;
  elements.feedingPlanText.hidden = !feedingPlanVisible;
  elements.feedingPlanToggle.checked = feedingPlanVisible;
  elements.feedingPlanToggle.setAttribute("aria-expanded", String(feedingPlanVisible));
  elements.recordList.innerHTML = records.length
    ? records
        .slice(0, 10)
        .map((record) => {
          const isSnack = record.type === "food" && (record.foodKind === "snack" || record.snackName);
          const config = isSnack ? typeConfig.snack : typeConfig[record.type] || { label: record.type, icon: "?", color: "#6e6a5f" };
          const meta = timedTypes.includes(record.type)
            ? `${formatDuration(getRecordDuration(record))} - ${formatTime(record.startTime || record.time)} - ${formatTime(record.endTime)}`
            : isSnack
              ? [record.amount, record.snackName || "Snack"].filter(Boolean).join(" - ")
            : [record.type === "poop" && record.abnormalPoop ? "⚠️ Abnormal poop" : "", record.amount, record.note].filter(Boolean).join(" - ");
          return `
            <article class="record-item">
              <span class="record-icon" style="background:${config.color}">${config.icon}</span>
              <span>
                <strong>${config.label} - ${formatTime(record.time)}</strong>
                ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
              </span>
            </article>
          `;
        })
        .join("")
    : `<article class="record-item"><span class="record-icon">+</span><span><strong>No records yet</strong><small>Tap a quick button.</small></span></article>`;
}

function getFeedingPlanText() {
  const customNotice = String(state.foodSettings?.planNotice || "").trim();
  if (customNotice) {
    return customNotice;
  }
  const food1 = state.foodSettings?.type || "Food 1";
  const food2 = state.foodSettings?.type2 || "Food 2";
  const amounts = state.foodSettings?.amounts || {};
  const secondAmounts = state.foodSettings?.secondAmounts || {};
  const times = state.foodTimes || {};
  return [
    ["Morning", times.morning, amounts.morning, secondAmounts.morning],
    ["Afternoon", times.afternoon, amounts.afternoon, secondAmounts.afternoon],
    ["Evening", times.evening, amounts.evening, secondAmounts.evening],
  ]
    .map(([label, time, amount1, amount2]) => {
      const components = [amount1 ? `${amount1} ${food1}` : "", amount2 ? `${amount2} ${food2}` : ""].filter(Boolean);
      return components.length ? `${label}${time ? ` (${formatTime(time)})` : ""}: ${components.join(" + ")}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

function buildTodaySummary(records, active) {
  const activeText = Object.values(active)
    .map((session) => `${typeConfig[session.type]?.label || session.type} ${getElapsedText(session)}`)
    .join(", ");
  const pee = records.filter((record) => record.type === "pee").length;
  const poop = records.filter((record) => record.type === "poop").length;
  const food = records.filter((record) => record.type === "food").length;
  const summary = `${pee} pee, ${poop} poop, ${food} food`;
  return activeText ? `${summary}. Active: ${activeText}` : summary;
}

function saveSyncSettings() {
  state.sync = state.sync || {};
  state.sync.code = elements.syncCode.value.trim();
  state.sync.firebaseConfig = elements.firebaseConfig.value.trim();
  persist();
}

function pushSoon() {
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(syncNow, 1200);
}

function setSyncPending(pending) {
  syncPending = pending;
  if (pending) state._pendingSync = createId();
  localStorage.setItem(pendingSyncKey, pending ? "1" : "0");
}

function retrySyncSoon() {
  if (!syncPending) {
    return;
  }
  window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(syncNow, syncRetryDelay);
  syncRetryDelay = Math.min(syncRetryDelay * 2, 60000);
}

async function resumeSync() {
  if (syncPending) {
    await syncNow();
    return;
  }
  await pullQuietly();
}

async function syncNow() {
  if (!pushPromise) pushPromise = serializeFirebase(() => syncNowExclusive()).finally(() => { pushPromise = null; });
  return pushPromise;
}

async function syncNowExclusive() {
  if (localStateUnreadable) return;
  if (syncInProgress) {
    return;
  }
  const settings = getFirebaseSettings();
  if (!settings) {
    setStatus("Add sync code and Firebase config first.");
    return;
  }
  syncInProgress = true;
  const syncingToken = state._pendingSync;
  const localSnapshot = PuppySync.clone(state);
  const target = { code: state.sync.code, firebaseConfig: state.sync.firebaseConfig };
  const checkTarget = () => PuppySync.guardTarget(state.sync, target);
  try {
    if (navigator.onLine === false) throw new Error("Offline. Will retry when online");
    setStatus("Syncing...");
    const services = await getFirebaseServices(settings);
    checkTarget();
    const ref = services.doc(services.db, "puppy_books", target.code);
    let writtenPayload;
    await services.runTransaction(services.db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      checkTarget();
      const merged = snapshot.exists()
        ? PuppySync.mergeBook(localSnapshot, migrateState(PuppySync.remoteData(snapshot.data().bookData)), !localSnapshot.sync.lastSync)
        : localSnapshot;
      writtenPayload = getSyncPayload(merged);
      transaction.set(ref, { bookData: writtenPayload, updatedAt: new Date().toISOString() });
    });
    const confirmed = await services.getDoc(ref);
    checkTarget();
    if (!confirmed.exists()) throw new Error("Firebase did not confirm the puppy book");
    PuppySync.assertRecordsPresent(writtenPayload, confirmed.data().bookData);
    mergeRemote(writtenPayload);
    state.sync.lastSync = new Date().toLocaleString();
    const storedToken = JSON.parse(localStorage.getItem(storageKey) || "{}")._pendingSync;
    const fullySynced = state._pendingSync === syncingToken && storedToken === syncingToken;
    if (fullySynced) delete state._pendingSync;
    syncPending = !fullySynced;
    localStorage.setItem(pendingSyncKey, syncPending ? "1" : "0");
    syncRetryDelay = 5000;
    if (!persist()) {
      state._pendingSync = syncingToken || createId();
      syncPending = true;
      try { localStorage.setItem(pendingSyncKey, "1"); } catch {}
      retrySyncSoon();
      return;
    }
    updateWidgetTitle();
    render();
    setStatus(fullySynced ? [`Synced ${state.sync.lastSync}`, PuppySync.capacityWarning(writtenPayload)].filter(Boolean).join(" ") : "New changes saved locally; finishing sync...");
    if (!fullySynced) pushSoon();
  } catch (error) {
    syncPending = true;
    localStorage.setItem(pendingSyncKey, "1");
    setStatus(`Sync failed: ${getFirebaseErrorMessage(error)}. Changes remain on this device; retrying.`);
    retrySyncSoon();
  } finally {
    syncInProgress = false;
  }
}

async function pullQuietly() {
  if (!pullPromise) pullPromise = serializeFirebase(() => pullQuietlyExclusive()).finally(() => { pullPromise = null; });
  return pullPromise;
}

async function pullQuietlyExclusive() {
  if (localStateUnreadable) return;
  if (pullInProgress || syncInProgress) {
    return;
  }
  const settings = getFirebaseSettings(true);
  if (!settings) {
    return;
  }
  pullInProgress = true;
  try {
    const target = { code: state.sync.code, firebaseConfig: state.sync.firebaseConfig };
    const services = await getFirebaseServices(settings);
    PuppySync.guardTarget(state.sync, target);
    const snapshot = await services.getDoc(services.doc(services.db, "puppy_books", target.code));
    PuppySync.guardTarget(state.sync, target);
    if (snapshot.exists()) {
      mergeRemote(snapshot.data().bookData);
      state.sync.lastSync = new Date().toLocaleString();
      persist();
      updateWidgetTitle();
      render();
    }
  } catch {
    // Keep the widget quiet during background checks.
  } finally {
    pullInProgress = false;
    if (syncPending) pushSoon();
  }
}

function getFirebaseSettings(silent = false) {
  state.sync = state.sync || {};
  if (!state.sync.code || state.sync.code.length < 12 || !state.sync.firebaseConfig) {
    return null;
  }
  try {
    const config = parseFirebaseConfig(state.sync.firebaseConfig);
    if (!config.projectId) {
      throw new Error("Missing projectId");
    }
    return config;
  } catch {
    if (!silent) {
      setStatus("Firebase config must include projectId.");
    }
    return null;
  }
}

function getSyncPayload(source = state) {
  const payload = JSON.parse(
    JSON.stringify({
      version: 1,
      storageFormat: "compact-v1",
      exportedAt: new Date().toISOString(),
      data: {
        ...source,
        photos: [],
        records: compactSyncRecords(source.records || {}),
        sync: { code: state.sync?.code || "", lastSync: state.sync?.lastSync || "", firebaseConfig: "" },
      },
    })
  );
  delete payload.data._pendingSync;
  return payload;
}

function compactSyncRecords(records) {
  return Object.fromEntries(
    Object.entries(records)
      .map(([date, entries]) => [
        date,
        (entries || []).map((record) =>
          Object.fromEntries(
            Object.entries(record || {}).filter(([key, value]) => {
              const isEmpty = value === "" || value === null || value === undefined || value === false || (Array.isArray(value) && !value.length);
              return !isEmpty && !(key === "reminderMinutes" && record.type !== "vaccine" && Number(value) === 60);
            })
          )
        ),
      ])
      .filter(([, entries]) => entries.length)
  );
}

function mergeRemote(payload) {
  const rawRemote = PuppySync.remoteData(payload);
  const remote = migrateState(rawRemote);
  Object.assign(state, PuppySync.mergeBook(state, remote, !state.sync.lastSync));
}

function mergeRecords(localRecords, remoteRecords, deletedIds = []) {
  return PuppySync.mergeRecords(localRecords, remoteRecords, deletedIds);
}

function mergeActiveSessions(localSessions, remoteSessions, stoppedIds = []) {
  const stopped = new Set(stoppedIds);
  const merged = {};
  [...Object.entries(normalizeActiveSessions(remoteSessions)), ...Object.entries(normalizeActiveSessions(localSessions))].forEach(([type, session]) => {
    if (session && !stopped.has(session.id)) {
      const existing = merged[type];
      if (!existing || new Date(session.updatedAt) >= new Date(existing.updatedAt)) {
        merged[type] = session;
      }
    }
  });
  return merged;
}

function normalizeActiveSessions(sessions) {
  return Object.fromEntries(Object.entries(sessions || {}).map(([type, value]) => [type, normalizeActiveSession(type, value)]).filter(([, value]) => value));
}

function normalizeActiveSession(type, value) {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return { id: `${type}-${value}`, type, start: value, updatedAt: value };
  }
  return {
    id: value.id || `${type}-${value.start || Date.now()}`,
    type: value.type || type,
    start: value.start || value.startedAt || value.updatedAt,
    updatedAt: value.updatedAt || value.start || value.startedAt || new Date().toISOString(),
  };
}

async function getFirebaseServices(config) {
  if (firebaseServices?.projectId === config.projectId) {
    return firebaseServices;
  }
  const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
  const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
  const appName = `puppy-record-widget-${config.projectId}`;
  const existingApp = appModule.getApps().find((app) => app.name === appName);
  const app = existingApp || appModule.initializeApp(config, appName);
  const auth = authModule.getAuth(app);
  if (!auth.currentUser) {
    await authModule.signInAnonymously(auth);
  }
  firebaseServices = {
    projectId: config.projectId,
    db: firestoreModule.getFirestore(app),
    doc: firestoreModule.doc,
    getDoc: firestoreModule.getDocFromServer,
    runTransaction: firestoreModule.runTransaction,
  };
  return firebaseServices;
}

function parseFirebaseConfig(value) {
  let text = String(value || "").trim();
  text = text.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*export\s+/gm, "").trim();
  const assignmentMatch = text.match(/(?:const|let|var)?\s*(?:window\.)?firebaseConfig\s*=\s*({[\s\S]*?})\s*;?/);
  if (assignmentMatch) {
    text = assignmentMatch[1];
  }
  text = text
    .replace(/^(?:const|let|var)\s+firebaseConfig\s*=\s*/, "")
    .replace(/^window\.firebaseConfig\s*=\s*/, "")
    .replace(/^firebaseConfig\s*=\s*/, "")
    .replace(/;$/, "")
    .trim();
  if (!text.startsWith("{") && text.includes("{") && text.includes("}")) {
    text = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  }
  try {
    return JSON.parse(text.replace(/,\s*([}\]])/g, "$1"));
  } catch {
    return JSON.parse(text.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":').replace(/,\s*([}\]])/g, "$1").replace(/'/g, '"'));
  }
}

function loadState() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid local state");
    if (value.records !== undefined) PuppySync.remoteData(value);
    return migrateState(value);
  } catch {
    localStateUnreadable = true;
    return migrateState({});
  }
}

function migrateState(value) {
  const snacks = normalizeSnackList(value.foodSettings?.snacks || defaultSnackList);
  return {
    ...value,
    profile: { ...value.profile, name: value.profile?.name || "Leo", birthday: value.profile?.birthday || "2026-03-14", weightKg: Number(value.profile?.weightKg) || 5.1 },
    foodTimes: { ...value.foodTimes, morning: value.foodTimes?.morning ?? "07:30", afternoon: value.foodTimes?.afternoon ?? "", evening: value.foodTimes?.evening ?? "18:30" },
    foodSettings: {
      ...value.foodSettings,
      targetMode: value.foodSettings?.targetMode === "manual" || value.foodSettings?.autoTarget === false ? "manual" : "josera",
      type: value.foodSettings?.type || "Puppy food",
      type2: value.foodSettings?.type2 || "",
      planNotice: value.foodSettings?.planNotice || "",
      snacks,
      snackAmounts: normalizeSnackAmounts(value.foodSettings?.snackAmounts, snacks),
      reminderMinutes: Number(value.foodSettings?.reminderMinutes ?? 5),
      amounts: {
        morning: value.foodSettings?.amounts?.morning ?? "110g",
        afternoon: value.foodSettings?.amounts?.afternoon || "",
        evening: value.foodSettings?.amounts?.evening ?? "120g",
      },
      secondAmounts: {
        morning: value.foodSettings?.secondAmounts?.morning || "",
        afternoon: value.foodSettings?.secondAmounts?.afternoon || "",
        evening: value.foodSettings?.secondAmounts?.evening || "",
      },
    },
    sync: { code: value.sync?.code || "", firebaseConfig: value.sync?.firebaseConfig || "", lastSync: value.sync?.lastSync || "" },
    records: value.records || {},
    activeSessions: normalizeActiveSessions(value.activeSessions || {}),
    stoppedSessionIds: Array.isArray(value.stoppedSessionIds) ? value.stoppedSessionIds : [],
    deletedRecordIds: Array.isArray(value.deletedRecordIds) ? value.deletedRecordIds : [],
    bookmarks: value.bookmarks || {},
    photos: value.photos || [],
    owner: value.owner || { name: "" },
    school: value.school || {},
    schoolSchedule: value.schoolSchedule || {},
    vaccination: value.vaccination || {},
    settings: value.settings || {},
  };
}

function normalizeSnackList(value) {
  const seen = new Set();
  return (Array.isArray(value) ? value : [])
    .map((snack) => String(snack || "").trim())
    .filter(Boolean)
    .filter((snack) => {
      const key = snack.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 30);
}

function normalizeSnackAmounts(value, snacks) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const entries = Object.entries(source);
  return Object.fromEntries(
    normalizeSnackList(snacks)
      .map((snack) => {
        const match = entries.find(([name]) => name.toLowerCase() === snack.toLowerCase());
        const amount = String(match?.[1] || "").trim().slice(0, 40);
        return amount ? [snack, amount] : null;
      })
      .filter(Boolean)
  );
}

function persist() {
  if (localStateUnreadable) {
    setStatus("Local data could not be read. It has not been overwritten; keep it intact and seek recovery help.");
    return false;
  }
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored && stored !== lastPersistedStateJson) {
      Object.assign(state, PuppySync.mergeBook(state, migrateState(JSON.parse(stored))));
    }
    const serialized = JSON.stringify(state);
    localStorage.setItem(storageKey, serialized);
    lastPersistedStateJson = serialized;
    return true;
  } catch (error) {
    syncPending = true;
    setStatus("Local save failed. Keep this window open and export a backup from the main app.");
    return false;
  }
}

function setStatus(message) {
  elements.statusText.textContent = message;
}

function updateWidgetTitle() {
  elements.widgetTitle.textContent = state.profile?.name || "Puppy";
}

function getRecordDuration(record) {
  if (Number.isFinite(Number(record.durationMinutes))) {
    return Number(record.durationMinutes);
  }
  return parseDurationMinutes(record.amount);
}

function parseDurationMinutes(value) {
  const match = String(value || "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Math.round(Number(match[1].replace(",", "."))) : 0;
}

function formatDuration(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}hr ${String(total % 60).padStart(2, "0")}min`;
}

function getElapsedText(session) {
  const start = new Date(session.start);
  const elapsed = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function minutesOfDay(time) {
  const [hours, minutes] = String(time || "00:00").split(":").map(Number);
  return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
}

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTime(value) {
  if (!value) {
    return "";
  }
  const [hourText, minute = "00"] = String(value).split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${suffix}${displayHour}:${minute}`;
}

function createId() {
  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function getFirebaseErrorMessage(error) {
  return error?.message || error?.code || "check your internet and Firebase settings.";
}
