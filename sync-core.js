(function (root) {
  "use strict";
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const time = (value) => Date.parse(value || "") || 0;
  function stable(value) {
    if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
    if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
  }
  function latest(a, b) {
    if (!a) return b;
    if (!b) return a;
    const difference = time(a.updatedAt) - time(b.updatedAt);
    return difference ? (difference > 0 ? a : b) : (stable(a) >= stable(b) ? a : b);
  }
  function mergeRecords(local = {}, remote = {}, deletedIds = []) {
    const deleted = new Set(deletedIds);
    const byId = new Map();
    for (const records of [remote, local]) {
      for (const [date, entries] of Object.entries(records)) {
        for (const record of entries) {
          // Legacy imports without IDs receive the same identity on every merge.
          const id = record.id || `legacy-${date}-${stable(record)}`;
          if (deleted.has(id)) continue;
          const candidate = { ...record, id, _date: date };
          byId.set(id, latest(byId.get(id), candidate));
        }
      }
    }
    const result = {};
    for (const { _date, ...record } of byId.values()) (result[_date] ||= []).push(record);
    for (const entries of Object.values(result)) entries.sort((a, b) => (a.time || "").localeCompare(b.time || "") || a.id.localeCompare(b.id));
    return result;
  }
  function remoteData(payload) {
    if (typeof payload === "string") payload = JSON.parse(payload);
    const data = payload?.data || payload;
    if (!data || typeof data !== "object" || Array.isArray(data) || !data.records || typeof data.records !== "object" || Array.isArray(data.records) ||
      Object.values(data.records).some(entries => !Array.isArray(entries) || entries.some(record => !record || typeof record !== "object" || Array.isArray(record)))) {
      throw new Error("Firebase returned an invalid puppy book. Nothing was replaced; export a backup and check the sync code.");
    }
    return data;
  }
  function serialQueue() {
    let tail = Promise.resolve();
    return (work) => {
      const next = tail.then(work);
      tail = next.catch(() => {});
      return next;
    };
  }
  function guardTarget(current, expected) {
    if (current?.code !== expected.code || current?.firebaseConfig !== expected.firebaseConfig)
      throw new Error("Sync settings changed during the request. Nothing from the previous book was applied; retry with the current settings.");
  }
  function capacityWarning(payload) {
    const bytes = new TextEncoder().encode(JSON.stringify(payload)).length;
    return bytes >= 600 * 1024
      ? `Shared book is large (about ${Math.round(bytes / 1024)} KiB as a JSON estimate, not an exact Firestore measurement). Firestore has a 1 MiB document limit. Export your records and plan a storage upgrade.`
      : "";
  }
  function mergeBook(local, remote, firstPull = false) {
    const merged = { ...remote, ...local, _pendingSync: local._pendingSync };
    for (const key of ["profile", "owner", "school", "schoolSchedule", "foodTimes", "foodSettings", "vaccination", "settings"]) {
      const a = local[key] || {}, b = remote[key];
      merged[key] = b && ((firstPull && !time(a.updatedAt)) || time(b.updatedAt) > time(a.updatedAt)) ? clone(b) : clone(a);
    }
    const a = local.foodSettings || {}, b = remote.foodSettings || {};
    const snacks = (firstPull && !time(a.snacksUpdatedAt)) || time(b.snacksUpdatedAt) > time(a.snacksUpdatedAt) ? b : a;
    for (const key of ["snacks", "snackAmounts", "snacksUpdatedAt"]) if (snacks[key] !== undefined) merged.foodSettings[key] = clone(snacks[key]);
    merged.deletedRecordIds = [...new Set([...(local.deletedRecordIds || []), ...(remote.deletedRecordIds || [])])];
    merged.stoppedSessionIds = [...new Set([...(local.stoppedSessionIds || []), ...(remote.stoppedSessionIds || [])])];
    merged.records = mergeRecords(local.records, remote.records, merged.deletedRecordIds);
    merged.activeSessions = {};
    for (const sessions of [remote.activeSessions || {}, local.activeSessions || {}]) {
      for (const [type, session] of Object.entries(sessions)) {
        if (!merged.stoppedSessionIds.includes(session.id)) merged.activeSessions[type] = latest(merged.activeSessions[type], session);
      }
    }
    merged.bookmarks = {};
    for (const bookmarks of [remote.bookmarks || {}, local.bookmarks || {}]) {
      for (const [date, value] of Object.entries(bookmarks)) {
        const bookmark = typeof value === "boolean" ? { bookmarked: value, note: "", updatedAt: "" } : value;
        merged.bookmarks[date] = latest(merged.bookmarks[date], bookmark);
      }
    }
    return merged;
  }
  function assertRecordsPresent(expectedPayload, remotePayload) {
    const expected = remoteData(expectedPayload), remote = remoteData(remotePayload);
    const deleted = new Set(remote.deletedRecordIds || []);
    const records = new Map(Object.entries(remote.records).flatMap(([date, entries]) => entries.map(record => [record.id, { date, record }])));
    for (const [date, entries] of Object.entries(expected.records)) for (const record of entries) {
      const match = records.get(record.id), actual = match?.record;
      const compact = value => Object.fromEntries(Object.entries(value).filter(([key, entry]) =>
        entry !== "" && entry !== null && entry !== undefined && entry !== false && !(Array.isArray(entry) && !entry.length) &&
        !(key === "reminderMinutes" && value.type !== "vaccine" && Number(entry) === 60)));
      if (!deleted.has(record.id) && (!actual || time(actual.updatedAt) < time(record.updatedAt) ||
          (time(actual.updatedAt) === time(record.updatedAt) && (match.date !== date || stable(compact(actual)) !== stable(compact(record)))))) {
        throw new Error("Firebase has not confirmed all records. Changes remain pending.");
      }
    }
    for (const id of expected.deletedRecordIds || []) if (!deleted.has(id)) throw new Error("Firebase has not confirmed a deletion.");
    const stopped = new Set(remote.stoppedSessionIds || []);
    for (const id of expected.stoppedSessionIds || []) if (!stopped.has(id)) throw new Error("Firebase has not confirmed a timer stop.");
    for (const [type, session] of Object.entries(expected.activeSessions || {})) {
      const actual = remote.activeSessions?.[type];
      if (!stopped.has(session.id) && (!actual || actual.id !== session.id || time(actual.updatedAt) < time(session.updatedAt))) throw new Error("Firebase has not confirmed a timer start.");
    }
    const contains = (value, wanted) => {
      if (Array.isArray(wanted)) return Array.isArray(value) && stable(value) === stable(wanted);
      if (wanted && typeof wanted === "object") return value && typeof value === "object" && !Array.isArray(value) &&
        Object.keys(wanted).every(key => Object.prototype.hasOwnProperty.call(value, key) && contains(value[key], wanted[key]));
      return value === wanted;
    };
    const confirmVersioned = (wanted, actual, label, version = "updatedAt") => {
      if (!wanted) return;
      if (!actual || time(actual[version]) < time(wanted[version]) ||
        (time(actual[version]) === time(wanted[version]) && !contains(actual, wanted)))
        throw new Error(`Firebase has not confirmed ${label}. Changes remain pending.`);
    };
    for (const key of ["profile", "owner", "school", "schoolSchedule", "foodTimes", "vaccination", "settings"]) {
      confirmVersioned(expected[key], remote[key], key);
    }
    if (expected.foodSettings) {
      const { snacks, snackAmounts, snacksUpdatedAt, ...wanted } = expected.foodSettings;
      const { snacks: actualSnacks, snackAmounts: actualAmounts, snacksUpdatedAt: actualSnackTime, ...actual } = remote.foodSettings || {};
      confirmVersioned(wanted, actual, "food settings");
      const wantedSnacks = Object.fromEntries(Object.entries({ snacks, snackAmounts, snacksUpdatedAt }).filter(([, value]) => value !== undefined));
      const actualSnackSettings = Object.fromEntries(Object.entries({ snacks: actualSnacks, snackAmounts: actualAmounts, snacksUpdatedAt: actualSnackTime }).filter(([, value]) => value !== undefined));
      if (Object.keys(wantedSnacks).length) confirmVersioned(wantedSnacks, actualSnackSettings, "snack settings", "snacksUpdatedAt");
    }
    const bookmark = value => typeof value === "boolean" ? { bookmarked: value, note: "", updatedAt: "" } : value;
    for (const [date, value] of Object.entries(expected.bookmarks || {})) {
      confirmVersioned(bookmark(value), bookmark(remote.bookmarks?.[date]), `bookmark ${date}`);
    }
  }
  const api = { clone, stable, latest, mergeRecords, mergeBook, remoteData, serialQueue, guardTarget, capacityWarning, assertRecordsPresent };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PuppySync = api;
})(globalThis);
