const storageKey = "puppy-record-book-state";
const timedTypes = ["walk", "play", "sleep", "train", "box"];
const typeConfig = {
  pee: { label: "Pee", icon: "P", color: "#7fa6b8" },
  poop: { label: "Poop", icon: "P", color: "#7b5f45" },
  walk: { label: "Walk", icon: "W", color: "#617861" },
  play: { label: "Play", icon: "Pl", color: "#d68a6a" },
  sleep: { label: "Sleep", icon: "S", color: "#6f7896" },
  train: { label: "Train", icon: "T", color: "#817044" },
  food: { label: "Food", icon: "F", color: "#d69b41" },
  water: { label: "Water", icon: "Wa", color: "#5799ad" },
  box: { label: "Box", icon: "B", color: "#8a7768" },
};

let firebaseServices = null;
let syncTimer = null;
const state = loadState();
const elements = {
  widgetTitle: document.querySelector("#widgetTitle"),
  statusText: document.querySelector("#statusText"),
  todaySummary: document.querySelector("#todaySummary"),
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
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleQuickAction(button.dataset.action));
  });
  elements.syncNow.addEventListener("click", syncNow);
  [elements.syncCode, elements.firebaseConfig].forEach((input) => input.addEventListener("input", saveSyncSettings));
  window.setInterval(render, 1000);
  window.setInterval(pullQuietly, 15000);
  render();
  pullQuietly();
}

async function handleQuickAction(type) {
  await pullQuietly();
  if (timedTypes.includes(type)) {
    toggleTimedType(type);
  } else if (type === "food") {
    recordFoodNow();
  } else if (type === "water") {
    addQuickRecord("water", "Water", "");
  } else {
    addQuickRecord(type, "", "");
  }
  persist();
  render();
  pushSoon();
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
    id: createId(),
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
  const amount = meal.amount || "Food";
  const note = [state.foodSettings?.type, meal.label].filter(Boolean).join(" - ");
  addQuickRecord("food", amount, note);
}

function getCurrentMealSetting() {
  const now = new Date();
  const foodTimes = state.foodTimes || {};
  const amounts = state.foodSettings?.amounts || {};
  const options = [
    { label: "Morning", time: foodTimes.morning, amount: amounts.morning },
    { label: "Afternoon", time: foodTimes.afternoon, amount: amounts.afternoon },
    { label: "Evening", time: foodTimes.evening, amount: amounts.evening },
  ].filter((item) => item.time);
  if (!options.length) {
    return { label: "Food", amount: "" };
  }
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return options
    .map((item) => ({ ...item, distance: Math.abs(minutesOfDay(item.time) - currentMinutes) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function addQuickRecord(type, amount, note) {
  const now = new Date();
  addRecord(toKey(now), {
    id: createId(),
    type,
    time: now.toTimeString().slice(0, 5),
    amount,
    note,
  });
  setStatus(`${typeConfig[type].label} saved.`);
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
  elements.recordList.innerHTML = records.length
    ? records
        .slice(0, 10)
        .map((record) => {
          const config = typeConfig[record.type] || { label: record.type, icon: "?", color: "#6e6a5f" };
          const meta = timedTypes.includes(record.type)
            ? `${formatDuration(getRecordDuration(record))} - ${formatTime(record.startTime || record.time)} - ${formatTime(record.endTime)}`
            : [record.amount, record.note].filter(Boolean).join(" - ");
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

async function syncNow() {
  const settings = getFirebaseSettings();
  if (!settings) {
    setStatus("Add sync code and Firebase config first.");
    return;
  }
  try {
    setStatus("Syncing...");
    const services = await getFirebaseServices(settings);
    const ref = services.doc(services.db, "puppy_books", state.sync.code);
    const snapshot = await services.getDoc(ref);
    if (snapshot.exists()) {
      mergeRemote(snapshot.data().bookData);
    }
    await services.setDoc(ref, { bookData: getSyncPayload(), updatedAt: new Date().toISOString() });
    state.sync.lastSync = new Date().toLocaleString();
    persist();
    updateWidgetTitle();
    render();
    setStatus(`Synced ${state.sync.lastSync}`);
  } catch (error) {
    setStatus(`Sync failed: ${getFirebaseErrorMessage(error)}`);
  }
}

async function pullQuietly() {
  const settings = getFirebaseSettings(true);
  if (!settings) {
    return;
  }
  try {
    const services = await getFirebaseServices(settings);
    const snapshot = await services.getDoc(services.doc(services.db, "puppy_books", state.sync.code));
    if (snapshot.exists()) {
      mergeRemote(snapshot.data().bookData);
      persist();
      updateWidgetTitle();
      render();
    }
  } catch {
    // Keep the widget quiet during background checks.
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

function getSyncPayload() {
  return JSON.parse(
    JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        ...state,
        photos: [],
        sync: { code: state.sync?.code || "", lastSync: state.sync?.lastSync || "", firebaseConfig: "" },
      },
    })
  );
}

function mergeRemote(payload) {
  const rawRemote = payload?.data || payload || {};
  const remote = migrateState(rawRemote);
  const remoteHasSection = (sectionName) => Object.prototype.hasOwnProperty.call(rawRemote, sectionName);
  const localSync = state.sync;
  const localRecords = state.records || {};
  const remoteRecords = remote.records || {};
  state.records = mergeRecords(localRecords, remoteRecords, state.deletedRecordIds || []);
  state.activeSessions = mergeActiveSessions(state.activeSessions || {}, remote.activeSessions || {}, [
    ...(state.stoppedSessionIds || []),
    ...(remote.stoppedSessionIds || []),
  ]);
  state.stoppedSessionIds = Array.from(new Set([...(state.stoppedSessionIds || []), ...(remote.stoppedSessionIds || [])]));
  state.deletedRecordIds = Array.from(new Set(state.deletedRecordIds || []));
  if (remoteHasSection("profile")) state.profile = { ...state.profile, ...remote.profile };
  if (remoteHasSection("owner")) state.owner = { ...state.owner, ...remote.owner };
  if (remoteHasSection("school")) state.school = { ...state.school, ...remote.school };
  if (remoteHasSection("schoolSchedule")) state.schoolSchedule = { ...state.schoolSchedule, ...remote.schoolSchedule };
  if (remoteHasSection("foodTimes")) state.foodTimes = { ...state.foodTimes, ...remote.foodTimes };
  if (remoteHasSection("foodSettings")) {
    state.foodSettings = {
      ...state.foodSettings,
      ...remote.foodSettings,
      amounts: { ...state.foodSettings?.amounts, ...remote.foodSettings?.amounts },
    };
  }
  if (remoteHasSection("bookmarks")) state.bookmarks = { ...state.bookmarks, ...remote.bookmarks };
  if (remoteHasSection("vaccination")) state.vaccination = { ...state.vaccination, ...remote.vaccination };
  if (remoteHasSection("settings")) state.settings = { ...state.settings, ...remote.settings };
  state.sync = localSync;
}

function mergeRecords(localRecords, remoteRecords, deletedIds = []) {
  const deleted = new Set(deletedIds);
  const merged = {};
  [...Object.keys(remoteRecords), ...Object.keys(localRecords)].forEach((date) => {
    const byId = new Map();
    [...(remoteRecords[date] || []), ...(localRecords[date] || [])].forEach((record) => {
      const id = record.id || createId();
      if (!deleted.has(id)) {
        byId.set(id, { ...record, id });
      }
    });
    const list = Array.from(byId.values()).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    if (list.length) {
      merged[date] = list;
    }
  });
  return merged;
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
    getDoc: firestoreModule.getDoc,
    setDoc: firestoreModule.setDoc,
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
    return migrateState(JSON.parse(localStorage.getItem(storageKey) || "{}"));
  } catch {
    return migrateState({});
  }
}

function migrateState(value) {
  return {
    profile: { name: value.profile?.name || "Leo", birthday: value.profile?.birthday || "2026-03-14", weightKg: Number(value.profile?.weightKg) || 5.1 },
    foodTimes: { morning: value.foodTimes?.morning || "07:30", afternoon: value.foodTimes?.afternoon || "", evening: value.foodTimes?.evening || "18:30" },
    foodSettings: {
      type: value.foodSettings?.type || "Puppy food",
      reminderMinutes: Number(value.foodSettings?.reminderMinutes ?? 5),
      amounts: {
        morning: value.foodSettings?.amounts?.morning || "110g",
        afternoon: value.foodSettings?.amounts?.afternoon || "",
        evening: value.foodSettings?.amounts?.evening || "120g",
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

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
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
