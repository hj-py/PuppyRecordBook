const storageKey = "puppy-record-book-state";

const typeConfig = {
  walk: { label: "Walk", icon: "W", color: "#617861", amount: "Minutes", placeholder: "e.g. 30 min" },
  food: { label: "Food", icon: "F", color: "#d69b41", amount: "Amount", placeholder: "e.g. 120g" },
  water: { label: "Water", icon: "Wa", color: "#5799ad", amount: "Amount", placeholder: "e.g. fresh bowl" },
  poop: { label: "Poop", icon: "P", color: "#7b5f45", amount: "Result", placeholder: "normal, soft..." },
  pee: { label: "Pee", icon: "P", color: "#7fa6b8", amount: "Result", placeholder: "clear, frequent..." },
  weight: { label: "Weight", icon: "Kg", color: "#c86f5c", amount: "Weight", placeholder: "e.g. 4.8kg" },
  vaccine: { label: "Vaccine", icon: "V", color: "#4f6f93", amount: "Dose", placeholder: "e.g. DHPP" },
  school: { label: "Hundeschule", icon: "H", color: "#7f6aa3", amount: "Topic", placeholder: "e.g. leash walking" },
  play: { label: "Play", icon: "Pl", color: "#d68a6a", amount: "Duration", placeholder: "auto" },
  sleep: { label: "Sleep", icon: "S", color: "#6f7896", amount: "Duration", placeholder: "auto" },
  train: { label: "Train", icon: "T", color: "#817044", amount: "Duration", placeholder: "auto" },
  box: { label: "Box", icon: "B", color: "#8a7768", amount: "Duration", placeholder: "auto" },
};

const categoryTypes = ["walk", "food", "water", "weight", "vaccine", "school", "sleep", "box"];
const timedQuickTypes = ["walk", "play", "sleep", "train", "box"];
const timedRecordTypes = ["walk", "play", "sleep", "train", "box"];
const analyticsStartKey = "2026-05-09";
const defaultPhoto =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23e8dfcf'/%3E%3Ccircle cx='80' cy='84' r='50' fill='%23fffdf8'/%3E%3Cpath d='M43 58c-15 7-25 21-23 36 1 12 9 20 19 20 12 0 19-11 18-24-1-10-6-22-14-32Z' fill='%23efe4d0'/%3E%3Cpath d='M117 58c15 7 25 21 23 36-1 12-9 20-19 20-12 0-19-11-18-24 1-10 6-22 14-32Z' fill='%23efe4d0'/%3E%3Cpath d='M44 70c9-26 64-26 73 0 7 19-1 50-37 50S37 89 44 70Z' fill='%23fff8e9'/%3E%3Cpath d='M55 63c9-14 43-18 52 0-13-7-39-7-52 0Z' fill='%23f6edda'/%3E%3Ccircle cx='64' cy='80' r='5.8' fill='%2325231f'/%3E%3Ccircle cx='96' cy='80' r='5.8' fill='%2325231f'/%3E%3Ccircle cx='66' cy='78' r='2' fill='%23fffdf8'/%3E%3Ccircle cx='98' cy='78' r='2' fill='%23fffdf8'/%3E%3Cellipse cx='80' cy='95' rx='11' ry='8' fill='%232d2923'/%3E%3Cpath d='M71 108c7 7 17 7 25 0' fill='none' stroke='%232d2923' stroke-width='5.5' stroke-linecap='round'/%3E%3C/svg%3E";

const today = new Date();
const state = loadState();
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = toKey(today);
let activeType = "walk";
let activeCategory = "walk";
let deferredInstallPrompt = null;
let currentView = "main";
let touchStartX = 0;
let touchStartY = 0;
let editingRecordId = null;
let firebaseServices = null;
let autoSyncTimer = null;
let autoSyncInProgress = false;
let persistOptions = {};
let selectedStatusYear = today.getFullYear();

const elements = {
  mainView: document.querySelector("#mainView"),
  dayView: document.querySelector("#dayView"),
  profileView: document.querySelector("#profileView"),
  statusView: document.querySelector("#statusView"),
  currentMonth: document.querySelector("#currentMonth"),
  profileButton: document.querySelector("#profileButton"),
  statusButton: document.querySelector("#statusButton"),
  previousMonth: document.querySelector("#previousMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  calendarGrid: document.querySelector("#calendarGrid"),
  backToMain: document.querySelector("#backToMain"),
  backFromProfile: document.querySelector("#backFromProfile"),
  backFromStatus: document.querySelector("#backFromStatus"),
  statusSettingsButton: document.querySelector("#statusSettingsButton"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  dayDateInput: document.querySelector("#dayDateInput"),
  recordTime: document.querySelector("#recordTime"),
  recordStartTime: document.querySelector("#recordStartTime"),
  recordEndTime: document.querySelector("#recordEndTime"),
  recordDuration: document.querySelector("#recordDuration"),
  durationFields: document.querySelector("#durationFields"),
  recordAmount: document.querySelector("#recordAmount"),
  recordNote: document.querySelector("#recordNote"),
  amountField: document.querySelector("#amountField"),
  saveRecord: document.querySelector("#saveRecord"),
  cancelEditRecord: document.querySelector("#cancelEditRecord"),
  recordList: document.querySelector("#recordList"),
  dayRecordCount: document.querySelector("#dayRecordCount"),
  puppyName: document.querySelector("#puppyName"),
  puppyAgeText: document.querySelector("#puppyAgeText"),
  adultWeight: document.querySelector("#adultWeight"),
  growthInsight: document.querySelector("#growthInsight"),
  categoryTitle: document.querySelector("#categoryTitle"),
  categoryCount: document.querySelector("#categoryCount"),
  categorySummary: document.querySelector("#categorySummary"),
  categoryList: document.querySelector("#categoryList"),
  annualStats: document.querySelector("#annualStats"),
  monthlyStats: document.querySelector("#monthlyStats"),
  statusYearSelect: document.querySelector("#statusYearSelect"),
  activeSessionCount: document.querySelector("#activeSessionCount"),
  quickLogStatus: document.querySelector("#quickLogStatus"),
  heroPhoto: document.querySelector("#heroPhoto"),
  photoInput: document.querySelector("#photoInput"),
  ownerName: document.querySelector("#ownerName"),
  profilePuppyName: document.querySelector("#profilePuppyName"),
  profilePuppyBirthday: document.querySelector("#profilePuppyBirthday"),
  puppyBreed: document.querySelector("#puppyBreed"),
  profileWeight: document.querySelector("#profileWeight"),
  puppyNotes: document.querySelector("#puppyNotes"),
  schoolName: document.querySelector("#schoolName"),
  trainerName: document.querySelector("#trainerName"),
  schoolContact: document.querySelector("#schoolContact"),
  schoolNotes: document.querySelector("#schoolNotes"),
  rabiesDate: document.querySelector("#rabiesDate"),
  rabiesValidUntil: document.querySelector("#rabiesValidUntil"),
  enableVaccineAlarm: document.querySelector("#enableVaccineAlarm"),
  vaccineReminderList: document.querySelector("#vaccineReminderList"),
  enableSchoolAlarm: document.querySelector("#enableSchoolAlarm"),
  schoolWeekday: document.querySelector("#schoolWeekday"),
  schoolTime: document.querySelector("#schoolTime"),
  schoolStartDate: document.querySelector("#schoolStartDate"),
  schoolEndDate: document.querySelector("#schoolEndDate"),
  schoolReminderList: document.querySelector("#schoolReminderList"),
  enableFoodAlarm: document.querySelector("#enableFoodAlarm"),
  foodType: document.querySelector("#foodType"),
  foodTimeMorning: document.querySelector("#foodTimeMorning"),
  foodTimeAfternoon: document.querySelector("#foodTimeAfternoon"),
  foodTimeEvening: document.querySelector("#foodTimeEvening"),
  foodAmountMorning: document.querySelector("#foodAmountMorning"),
  foodAmountAfternoon: document.querySelector("#foodAmountAfternoon"),
  foodAmountEvening: document.querySelector("#foodAmountEvening"),
  foodReminderList: document.querySelector("#foodReminderList"),
  installAppButton: document.querySelector("#installAppButton"),
  installStatus: document.querySelector("#installStatus"),
  syncCode: document.querySelector("#syncCode"),
  pushFirebaseButton: document.querySelector("#pushFirebaseButton"),
  pullFirebaseButton: document.querySelector("#pullFirebaseButton"),
  firebaseConfig: document.querySelector("#firebaseConfig"),
  exportDataButton: document.querySelector("#exportDataButton"),
  exportExcelButton: document.querySelector("#exportExcelButton"),
  importDataInput: document.querySelector("#importDataInput"),
  syncStatus: document.querySelector("#syncStatus"),
};

init();

function init() {
  elements.puppyName.value = state.profile.name;
  elements.adultWeight.value = state.profile.weightKg;
  hydrateProfileForm();
  syncProfileWeightFromRecords();
  elements.heroPhoto.src = getLatestPhoto()?.src || defaultPhoto;
  elements.recordTime.value = new Date().toTimeString().slice(0, 5);
  updateAmountField();

  bindEvents();
  registerServiceWorker();
  initPwaInstall();
  startAlarmTimer();
  renderMain();
}

function bindEvents() {
  elements.previousMonth.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderMain();
  });

  elements.nextMonth.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderMain();
  });

  elements.profileButton.addEventListener("click", () => {
    showProfileView();
  });

  elements.statusButton.addEventListener("click", () => {
    showStatusView();
  });

  elements.backToMain.addEventListener("click", () => {
    showMainView();
  });

  elements.backFromProfile.addEventListener("click", () => {
    showMainView();
  });

  elements.backFromStatus.addEventListener("click", () => {
    showMainView();
  });

  elements.statusSettingsButton.addEventListener("click", () => {
    showProfileView();
  });

  elements.statusYearSelect.addEventListener("input", () => {
    selectedStatusYear = Number(elements.statusYearSelect.value) || today.getFullYear();
    renderStatusView();
  });

  elements.dayDateInput.addEventListener("input", () => {
    if (!elements.dayDateInput.value) {
      return;
    }
    selectedDate = elements.dayDateInput.value;
    const date = parseDateKey(selectedDate);
    visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    renderDayView();
  });

  elements.saveRecord.addEventListener("click", saveRecord);
  elements.cancelEditRecord.addEventListener("click", clearEditMode);
  const syncStartFromMainTime = () => {
    if (timedRecordTypes.includes(activeType)) {
      elements.recordStartTime.value = elements.recordTime.value;
      syncEndFromDuration();
    }
  };
  elements.recordTime.addEventListener("input", syncStartFromMainTime);
  elements.recordTime.addEventListener("change", syncStartFromMainTime);
  elements.recordStartTime.addEventListener("input", syncDurationFromEnd);
  elements.recordStartTime.addEventListener("change", syncDurationFromEnd);
  elements.recordEndTime.addEventListener("input", syncDurationFromEnd);
  elements.recordEndTime.addEventListener("change", syncDurationFromEnd);
  elements.recordDuration.addEventListener("input", syncEndFromDuration);
  elements.recordDuration.addEventListener("change", syncEndFromDuration);

  document.querySelectorAll(".type-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeType = button.dataset.type;
      document.querySelectorAll(".type-button").forEach((item) => item.classList.toggle("selected", item === button));
      updateAmountField();
    });
  });

  document.querySelectorAll(".category-tab").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      document.querySelectorAll(".category-tab").forEach((item) => item.classList.toggle("selected", item === button));
      renderCategory();
    });
  });

  document.querySelectorAll(".quick-log-button").forEach((button) => {
    button.addEventListener("click", () => handleQuickLog(button.dataset.action));
  });

  elements.puppyName.addEventListener("input", () => {
    state.profile.name = elements.puppyName.value.trim() || "Puppy";
    persist();
    hydrateProfileForm();
    renderAge();
    renderInsight();
  });

  elements.adultWeight.addEventListener("change", () => {
    recordMainWeightChange();
  });

  getProfileInputs().forEach((input) => {
    input.addEventListener("input", () => {
      syncProfileFromForm();
      persist();
      hydrateMainProfile();
      renderAge();
      renderInsight();
      renderReminderSections();
    });
  });

  elements.enableVaccineAlarm.addEventListener("click", () => {
    state.settings.vaccineAlarmEnabled = !state.settings.vaccineAlarmEnabled;
    persist();
    renderReminderSections();
    maybeRequestNotificationPermission();
  });

  elements.enableSchoolAlarm.addEventListener("click", () => {
    state.settings.schoolAlarmEnabled = !state.settings.schoolAlarmEnabled;
    persist();
    renderReminderSections();
    maybeRequestNotificationPermission();
  });

  elements.enableFoodAlarm.addEventListener("click", () => {
    state.settings.foodAlarmEnabled = !state.settings.foodAlarmEnabled;
    persist();
    renderReminderSections();
    maybeRequestNotificationPermission();
  });

  elements.installAppButton.addEventListener("click", installPwa);
  elements.pushFirebaseButton.addEventListener("click", pushFirebaseSync);
  elements.pullFirebaseButton.addEventListener("click", pullFirebaseSync);
  elements.exportDataButton.addEventListener("click", exportData);
  elements.exportExcelButton.addEventListener("click", exportExcelData);
  elements.importDataInput.addEventListener("change", importData);

  [elements.syncCode, elements.firebaseConfig].forEach((input) => {
    input.addEventListener("input", () => {
      state.sync.code = elements.syncCode.value.trim();
      state.sync.firebaseConfig = elements.firebaseConfig.value.trim();
      persist({ skipAutoSync: true });
    });
  });

  elements.photoInput.addEventListener("change", async (event) => {
    await addProfilePhotoFromInput(event.target);
    renderMain();
  });

  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
}

function renderMain() {
  currentView = "main";
  elements.mainView.hidden = false;
  elements.dayView.hidden = true;
  elements.profileView.hidden = true;
  elements.statusView.hidden = true;
  renderCalendar();
  renderAge();
  renderInsight();
  renderQuickLogButtons();
  renderCategory();
  elements.heroPhoto.src = getLatestPhoto()?.src || defaultPhoto;
}

function renderDayView() {
  elements.selectedDateLabel.textContent = formatSelectedDate(selectedDate);
  elements.dayDateInput.value = selectedDate;
  elements.recordTime.value = elements.recordTime.value || new Date().toTimeString().slice(0, 5);
  syncDurationVisibility();
  renderRecords();
}

function showDayView(dateKey) {
  currentView = "day";
  selectedDate = dateKey;
  const date = parseDateKey(dateKey);
  visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  elements.mainView.hidden = true;
  elements.dayView.hidden = false;
  elements.profileView.hidden = true;
  elements.statusView.hidden = true;
  renderDayView();
}

function showMainView() {
  currentView = "main";
  elements.mainView.hidden = false;
  elements.dayView.hidden = true;
  elements.profileView.hidden = true;
  elements.statusView.hidden = true;
  renderMain();
}

function showProfileView() {
  currentView = "profile";
  elements.mainView.hidden = true;
  elements.dayView.hidden = true;
  elements.profileView.hidden = false;
  elements.statusView.hidden = true;
  hydrateProfileForm();
  renderReminderSections();
}

function showStatusView() {
  currentView = "status";
  elements.mainView.hidden = true;
  elements.dayView.hidden = true;
  elements.profileView.hidden = true;
  elements.statusView.hidden = false;
  renderStatusView();
}

function recordMainWeightChange() {
  const value = Number(elements.adultWeight.value);
  if (!Number.isFinite(value) || value <= 0) {
    hydrateMainProfile();
    return;
  }

  const dateKey = toKey(new Date());
  const time = new Date().toTimeString().slice(0, 5);
  const existing = (state.records[dateKey] || []).find((record) => record.type === "weight" && record.note === "Main page weight update");
  if (existing) {
    existing.time = time;
    existing.amount = `${value}kg`;
  } else {
    state.records[dateKey] = [
      ...(state.records[dateKey] || []),
      { id: createId(), type: "weight", time, amount: `${value}kg`, note: "Main page weight update" },
    ];
  }
  state.profile.weightKg = value;
  hydrateProfileForm();
  renderInsight();
  renderCategory();
  persist();
}

function renderCalendar() {
  elements.currentMonth.textContent = visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  elements.calendarGrid.innerHTML = "";

  getCalendarDates().forEach((day) => {
    const key = toKey(day);
    const records = state.records[key] || [];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-cell";
    button.classList.toggle("muted", day.getMonth() !== visibleMonth.getMonth());
    button.classList.toggle("today", key === toKey(today));
    button.classList.toggle("selected", key === selectedDate);
    button.innerHTML = `
      <span class="day-number">${day.getDate()}</span>
      <span class="dot-row">${records.slice(0, 3).map(() => '<span class="dot"></span>').join("")}</span>
    `;
    button.addEventListener("click", () => showDayView(key));
    elements.calendarGrid.appendChild(button);
  });
}

function renderRecords() {
  const records = [...(state.records[selectedDate] || [])].sort((a, b) => a.time.localeCompare(b.time));
  elements.dayRecordCount.textContent = records.length;
  elements.recordList.innerHTML = "";

  if (!records.length) {
    elements.recordList.innerHTML = `<p class="empty-state">No records yet. Add walks, meals, potty breaks, weight, or vaccines for this day.</p>`;
    return;
  }

  records.forEach((record) => {
    const config = typeConfig[record.type];
    const item = document.createElement("article");
    item.className = "record-item";
    item.innerHTML = `
      <span class="record-icon" style="background:${config.color}">${config.icon}</span>
      <div>
        <p class="record-title">${config.label} - ${escapeHtml(formatTime(record.time))}</p>
        <p class="record-meta">${escapeHtml([record.amount, record.note].filter(Boolean).join(" - "))}</p>
      </div>
      <button class="delete-button" type="button" aria-label="Delete record">x</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      deleteRecord(selectedDate, record.id);
    });
    item.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        return;
      }
      startEditRecord(record);
    });
    elements.recordList.appendChild(item);
  });
}

function deleteRecord(dateKey, recordId) {
  state.records[dateKey] = (state.records[dateKey] || []).filter((entry) => entry.id !== recordId);
  if (!state.records[dateKey].length) {
    delete state.records[dateKey];
  }
  state.deletedRecordIds = Array.from(new Set([...(state.deletedRecordIds || []), recordId]));
  if (editingRecordId === recordId) {
    clearEditMode();
  }
  syncProfileWeightFromRecords();
  persist();
  renderDayView();
  renderCategory();
  renderCalendar();
}

function renderAge() {
  const birthday = parseDateKey(state.profile.birthday);
  if (!birthday) {
    elements.puppyAgeText.textContent = "Age: add birthday in profile";
    return;
  }

  elements.puppyAgeText.textContent = `Age: ${formatAge(birthday, today)}`;
}

function renderInsight() {
  const weights = getWeightRecords();
  const latestWeight = weights[weights.length - 1];

  if (!latestWeight) {
    elements.growthInsight.textContent = "Add a weight record to see growth guidance.";
    return;
  }

  const weightText = `${latestWeight.value.toFixed(1)}kg`;
  const previousWeight = weights[weights.length - 2];
  if (!previousWeight) {
    elements.growthInsight.textContent = `${weightText} is the latest recorded weight. Add weekly weights to see the growth trend.`;
    return;
  }

  const change = latestWeight.value - previousWeight.value;
  if (change < -0.1) {
    elements.growthInsight.textContent = `${weightText} is lower than the previous record. Recheck the measurement and ask your vet if it continues.`;
  } else if (change > 0.8) {
    elements.growthInsight.textContent = `${weightText} is rising quickly. Keep tracking weekly and watch body condition.`;
  } else {
    elements.growthInsight.textContent = `${weightText} shows a steady recent growth trend.`;
  }
}

function renderQuickLogButtons() {
  document.querySelectorAll(".quick-log-button").forEach((button) => {
    const session = getActiveSession(button.dataset.action);
    button.classList.toggle("active", Boolean(session));
    if (timedQuickTypes.includes(button.dataset.action)) {
      button.textContent = session ? `Stop ${typeConfig[button.dataset.action].label}` : typeConfig[button.dataset.action].label;
    }
  });
  elements.activeSessionCount.textContent = Object.values(state.activeSessions || {}).filter(Boolean).length;
}

function handleQuickLog(type) {
  if (timedQuickTypes.includes(type)) {
    toggleTimedQuickLog(type);
    return;
  }

  if (type === "food") {
    recordFoodNow();
    return;
  }

  addQuickRecord(type, "", "Quick log");
}

function addQuickRecord(type, amount, note, time = new Date()) {
  const dateKey = toKey(time);
  const durationMinutes = timedRecordTypes.includes(type) ? parseDurationMinutes(amount) : 0;
  const record = {
    id: createId(),
    type,
    time: time.toTimeString().slice(0, 5),
    amount,
    note,
  };
  if (durationMinutes) {
    record.startTime = record.time;
    record.durationMinutes = durationMinutes;
    record.endTime = addMinutesToTime(record.startTime, durationMinutes);
  }

  state.records[dateKey] = [...(state.records[dateKey] || []), record];
  selectedDate = dateKey;
  visibleMonth = new Date(time.getFullYear(), time.getMonth(), 1);
  persist();
  renderMain();
  elements.quickLogStatus.textContent = `${typeConfig[type].label} saved for ${formatTime(record.time)}.`;
}

function toggleTimedQuickLog(type) {
  const now = new Date();
  const existing = getActiveSession(type);
  if (!existing) {
    state.activeSessions[type] = { id: createId(), type, start: now.toISOString(), updatedAt: now.toISOString() };
    persist();
    renderQuickLogButtons();
    elements.quickLogStatus.textContent = `${typeConfig[type].label} started at ${formatTime(now.toTimeString().slice(0, 5))}.`;
    return;
  }

  const start = new Date(existing.start);
  const minutes = Math.max(1, Math.round((now - start) / 60000));
  const amount = `${minutes} min`;
  const note = `${formatTime(start.toTimeString().slice(0, 5))} - ${formatTime(now.toTimeString().slice(0, 5))}`;
  state.stoppedSessionIds = Array.from(new Set([...(state.stoppedSessionIds || []), existing.id]));
  delete state.activeSessions[type];
  renderQuickLogButtons();
  addQuickRecord(type, amount, note, start);
  elements.quickLogStatus.textContent = `${typeConfig[type].label} ended. ${amount} saved.`;
}

function getActiveSession(type) {
  return normalizeActiveSession(type, state.activeSessions?.[type]);
}

function recordFoodNow() {
  const meal = getCurrentMealSetting();
  const amount = meal.amount || "Food";
  const note = [state.foodSettings.type, meal.label].filter(Boolean).join(" - ");
  addQuickRecord("food", amount, note || "Quick food log");
}

function getCurrentMealSetting() {
  const now = new Date();
  const options = [
    { key: "morning", label: "Morning", time: state.foodTimes.morning, amount: state.foodSettings.amounts.morning },
    { key: "afternoon", label: "Afternoon", time: state.foodTimes.afternoon, amount: state.foodSettings.amounts.afternoon },
    { key: "evening", label: "Evening", time: state.foodTimes.evening, amount: state.foodSettings.amounts.evening },
  ].filter((item) => item.time);

  if (!options.length) {
    return { label: "Food", amount: "" };
  }

  return options
    .map((item) => ({ ...item, distance: Math.abs(minutesOfDay(item.time) - (now.getHours() * 60 + now.getMinutes())) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function minutesOfDay(time) {
  const [hours, minutes] = parseTimeParts(time);
  return hours * 60 + minutes;
}

function durationFromTimes(startTime, endTime) {
  if (!startTime || !endTime) {
    return 0;
  }
  let duration = minutesOfDay(endTime) - minutesOfDay(startTime);
  if (duration <= 0) {
    duration += 1440;
  }
  return duration;
}

function addMinutesToTime(time, minutesToAdd) {
  const total = (minutesOfDay(time) + Number(minutesToAdd || 0)) % 1440;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function parseDurationMinutes(value) {
  const match = String(value || "").match(/(\d+(?:[.,]\d+)?)/);
  return match ? Math.round(Number(match[1].replace(",", "."))) : 0;
}

function getRecordDuration(record) {
  if (Number.isFinite(Number(record.durationMinutes))) {
    return Number(record.durationMinutes);
  }
  if (record.startTime && record.endTime) {
    return durationFromTimes(record.startTime, record.endTime);
  }
  return parseDurationMinutes(record.amount);
}

function formatDuration(minutes) {
  const total = Math.round(minutes || 0);
  if (total < 60) {
    return `${total} min`;
  }
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return mins ? `${hours} hr ${mins} min` : `${hours} hr`;
}

function renderCategory() {
  if (activeCategory === "weight") {
    renderGrowthCategory();
    return;
  }

  const category = getCategoryMeta(activeCategory);
  const records = getCategoryRecords(activeCategory);
  elements.categoryTitle.textContent = `${category.label} Records`;
  elements.categoryCount.textContent = records.length;
  elements.categorySummary.innerHTML = renderDailySummary(activeCategory);
  elements.categoryList.innerHTML = "";

  if (!records.length) {
    const range = activeCategory === "vaccine" ? "yet" : "today";
    elements.categoryList.innerHTML = `<p class="empty-state">No ${category.label.toLowerCase()} records ${range}.</p>`;
    return;
  }

  records.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "category-item";
    const detail = getCategoryDetail(entry, activeCategory);
    item.innerHTML = `
      <div class="category-date">${escapeHtml(formatShortDate(entry.date))}<br>${escapeHtml(formatTime(entry.time))}</div>
      <div>
        <p class="category-detail">${escapeHtml(detail.primary)}</p>
        ${detail.secondary ? `<p class="category-subtext">${escapeHtml(detail.secondary)}</p>` : ""}
      </div>
      <button class="delete-button category-delete" type="button" aria-label="Delete record">x</button>
    `;
    item.querySelector(".category-delete").addEventListener("click", (event) => {
      event.stopPropagation();
      deleteRecord(entry.date, entry.id);
    });
    item.addEventListener("click", () => openCategoryRecord(entry));
    elements.categoryList.appendChild(item);
  });
}

function openCategoryRecord(entry) {
  showDayView(entry.date);
  const record = (state.records[entry.date] || []).find((item) => item.id === entry.id);
  if (record) {
    startEditRecord(record);
  }
}

function renderGrowthCategory() {
  const weights = getWeightRecords();
  elements.categoryTitle.textContent = "Weight Records";
  elements.categoryCount.textContent = weights.length;
  elements.categorySummary.innerHTML = renderDailySummary("weight");

  if (!weights.length) {
    elements.categoryList.innerHTML = `<p class="empty-state">No weight records yet. Add weight records to draw the graph.</p>`;
    return;
  }

  elements.categoryList.innerHTML = `
    <div class="weight-graph-card">
      ${renderWeightGraph(weights)}
      <div class="weight-graph-meta">
        <span>${escapeHtml(weights[0].date)}: ${weights[0].value.toFixed(1)}kg</span>
        <span>${escapeHtml(weights[weights.length - 1].date)}: ${weights[weights.length - 1].value.toFixed(1)}kg</span>
      </div>
    </div>
    ${weights
      .slice()
      .reverse()
      .map(
        (entry) => `
          <article class="category-item" data-date="${escapeHtml(entry.date)}" data-record-id="${escapeHtml(entry.id || "")}">
            <div class="category-date">${escapeHtml(formatShortDate(entry.date))}</div>
            <div>
              <p class="category-detail">${entry.value.toFixed(1)}kg</p>
              <p class="category-subtext">Weight record</p>
            </div>
          </article>
        `
      )
      .join("")}
  `;
  elements.categoryList.querySelectorAll(".category-item[data-record-id]").forEach((item) => {
    item.addEventListener("click", () => {
      const date = item.dataset.date;
      const id = item.dataset.recordId;
      const record = (state.records[date] || []).find((entry) => entry.id === id);
      if (record) {
        showDayView(date);
        startEditRecord(record);
      }
    });
  });
}

function renderWeightGraph(weights) {
  const width = Math.max(360, weights.length * 86);
  const height = 180;
  const padding = 28;
  const values = weights.map((item) => item.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const countRange = Math.max(weights.length - 1, 1);
  const points = weights.map((item, index) => {
    const x = padding + (index / countRange) * (width - padding * 2);
    const y = height - padding - ((item.value - min) / range) * (height - padding * 2);
    return { x, y, item };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");

  return `
    <svg class="weight-graph" viewBox="0 0 ${width} ${height}" role="img" aria-label="Weight growth graph">
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="graph-axis" />
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" class="graph-axis" />
      <path d="${path}" class="graph-line" />
      ${points
        .map(
          (point) => `
            <circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4" class="graph-dot" />
            <text x="${point.x.toFixed(1)}" y="${Math.max(12, point.y - 8).toFixed(1)}" class="graph-label">${point.item.value.toFixed(1)}</text>
          `
        )
        .join("")}
    </svg>
  `;
}

function saveRecord() {
  if (editingRecordId) {
    updateEditedRecord();
    return;
  }

  const record = buildRecordFromForm(createId());

  state.records[selectedDate] = [...(state.records[selectedDate] || []), record];
  if (record.type === "weight") {
    const parsedWeight = parseWeight(record.amount);
    if (Number.isFinite(parsedWeight)) {
      state.profile.weightKg = parsedWeight;
      hydrateMainProfile();
      hydrateProfileForm();
    }
  }
  const nextCategory = getCategoryForType(activeType);
  if (nextCategory) {
    activeCategory = nextCategory;
    document.querySelectorAll(".category-tab").forEach((button) => {
      button.classList.toggle("selected", button.dataset.category === activeCategory);
    });
  }

  clearFormAfterSave();
  persist();
  renderDayView();
}

function buildRecordFromForm(id) {
  const record = {
    id: createId(),
    type: activeType,
    time: elements.recordTime.value || elements.recordStartTime.value || new Date().toTimeString().slice(0, 5),
    amount: elements.recordAmount.value.trim(),
    note: elements.recordNote.value.trim(),
  };

  record.id = id;
  if (timedRecordTypes.includes(activeType)) {
    const startTime = elements.recordStartTime.value || record.time;
    const durationMinutes = Math.max(1, durationFromTimes(startTime, elements.recordEndTime.value) || Number(elements.recordDuration.value) || parseDurationMinutes(record.amount) || 1);
    const endTime = elements.recordEndTime.value || addMinutesToTime(startTime, durationMinutes);
    record.time = startTime;
    record.startTime = startTime;
    record.endTime = endTime;
    record.durationMinutes = durationMinutes;
    record.amount = `${durationMinutes} min`;
  }

  return record;
}

function clearFormAfterSave() {
  elements.recordAmount.value = "";
  elements.recordNote.value = "";
  elements.recordEndTime.value = "";
  elements.recordDuration.value = "";
  elements.recordStartTime.value = elements.recordTime.value || new Date().toTimeString().slice(0, 5);
}

function startEditRecord(record) {
  editingRecordId = record.id;
  activeType = record.type;
  elements.recordTime.value = record.time;
  elements.recordStartTime.value = record.startTime || record.time;
  elements.recordEndTime.value = record.endTime || "";
  elements.recordDuration.value = record.durationMinutes || parseDurationMinutes(record.amount) || "";
  elements.recordAmount.value = record.amount || "";
  elements.recordNote.value = record.note || "";
  document.querySelectorAll(".type-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.type === activeType);
  });
  updateAmountField();
  elements.saveRecord.textContent = "Update";
  elements.cancelEditRecord.hidden = false;
  elements.recordAmount.focus();
}

function updateEditedRecord() {
  const records = state.records[selectedDate] || [];
  const record = records.find((entry) => entry.id === editingRecordId);
  if (!record) {
    clearEditMode();
    return;
  }

  Object.assign(record, buildRecordFromForm(record.id));
  if (record.type === "weight") {
    const parsedWeight = parseWeight(record.amount);
    if (Number.isFinite(parsedWeight)) {
      state.profile.weightKg = parsedWeight;
    }
  }
  syncProfileWeightFromRecords();
  persist();
  clearEditMode();
  renderDayView();
}

function clearEditMode() {
  editingRecordId = null;
  elements.recordAmount.value = "";
  elements.recordNote.value = "";
  elements.recordEndTime.value = "";
  elements.recordDuration.value = "";
  elements.saveRecord.textContent = "Save";
  elements.cancelEditRecord.hidden = true;
  syncDurationVisibility();
}

async function addProfilePhotoFromInput(input) {
  const files = Array.from(input.files || []);
  const file = files[0];
  if (file) {
    const photo = await imageFileToProfileDataUrl(file);
    state.photos = [{ id: createId(), src: photo, date: toKey(today), name: file.name || "puppy-photo.jpg" }];
  }
  input.value = "";
  elements.heroPhoto.src = getLatestPhoto()?.src || defaultPhoto;
  persist();
}

function getCategoryRecords(type) {
  const typeMap = {
    potty: ["pee", "poop"],
    activity: ["play", "train"],
  };
  const matchedTypes = typeMap[type] || [type];
  const entries = Object.entries(state.records).flatMap(([date, records]) =>
    records
      .filter((record) => matchedTypes.includes(record.type))
      .map((record) => ({ ...record, date }))
  );

  const filtered =
    type === "vaccine"
      ? entries
      : entries.filter((entry) => {
          if (["potty", "activity", "sleep", "walk", "food", "water", "school", "box"].includes(type)) {
            return entry.date === toKey(today);
          }
          const [year, month] = entry.date.split("-").map(Number);
          return year === visibleMonth.getFullYear() && month === visibleMonth.getMonth() + 1;
        });

  return filtered.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function getCategoryMeta(type) {
  if (type === "potty") {
    return { label: "Pee & Poop" };
  }
  if (type === "activity") {
    return { label: "Play & Train" };
  }
  if (type === "sleep") {
    return { label: "Sleep" };
  }
  return { label: typeConfig[type]?.label || "Records" };
}

function getCategoryForType(type) {
  if (["pee", "poop"].includes(type)) {
    return "potty";
  }
  if (["play", "train"].includes(type)) {
    return "activity";
  }
  return categoryTypes.includes(type) ? type : "";
}

function getCategoryDetail(entry, activeCategoryType = "") {
  const typeLabel = typeConfig[entry.type]?.label || entry.type;
  if (activeCategoryType === "potty" || activeCategoryType === "activity") {
    return {
      primary: [entry.amount || formatTime(entry.time), typeLabel].filter(Boolean).join(" - "),
      secondary: entry.note,
    };
  }

  if (entry.type === "walk") {
    return {
      primary: [entry.amount || "Walk", entry.note].filter(Boolean).join(" - "),
      secondary: [formatTime(entry.startTime || entry.time), entry.endTime ? formatTime(entry.endTime) : "Today walk record"].filter(Boolean).join(" - "),
    };
  }

  if (timedRecordTypes.includes(entry.type)) {
    return {
      primary: [entry.amount || "Duration", typeLabel].filter(Boolean).join(" - "),
      secondary: [formatTime(entry.startTime || entry.time), entry.endTime ? formatTime(entry.endTime) : "", entry.note].filter(Boolean).join(" - "),
    };
  }

  if (entry.type === "vaccine") {
    return {
      primary: entry.note || entry.amount || "Vaccine",
      secondary: entry.amount && entry.note ? entry.amount : "",
    };
  }

  if (entry.type === "weight") {
    return {
      primary: entry.amount || "Weight check",
      secondary: entry.note,
    };
  }

  if (entry.type === "school") {
    return {
      primary: entry.amount || "Hundeschule",
      secondary: entry.note || "Training notes",
    };
  }

  return {
    primary: [entry.amount || typeLabel, typeLabel].filter(Boolean).join(" - "),
    secondary: entry.note,
  };
}

function renderStatusView() {
  const years = getAvailableRecordYears();
  if (!years.includes(selectedStatusYear)) {
    selectedStatusYear = years[0] || today.getFullYear();
  }
  elements.statusYearSelect.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  elements.statusYearSelect.value = String(selectedStatusYear);
  const year = selectedStatusYear;
  const yearEnd = year === today.getFullYear() ? toKey(today) : `${year}-12-31`;
  const yearStats = calculateStatsForRange(maxDateKey(`${year}-01-01`, analyticsStartKey), yearEnd);
  elements.annualStats.innerHTML = renderStatCards(yearStats);
  const monthCount = year === today.getFullYear() ? today.getMonth() + 1 : 12;
  elements.monthlyStats.innerHTML = Array.from({ length: monthCount }, (_, index) => {
    const month = index + 1;
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0);
    const end = year === today.getFullYear() && month === today.getMonth() + 1 ? toKey(today) : toKey(endDate);
    if (end < analyticsStartKey) {
      return "";
    }
    const stats = calculateStatsForRange(maxDateKey(start, analyticsStartKey), end);
    return renderMonthStats(endDate, stats);
  }).join("");
}

function renderMonthStats(endDate, stats) {
  return `
    <article class="month-stat">
      <h3>${endDate.toLocaleDateString("en", { month: "short" })}</h3>
      <p>Pee ${stats.peeTotal} total (${stats.peePerDay} times/day)</p>
      <p>Poop ${stats.poopTotal} total (${stats.poopPerDay} times/day)</p>
      <p>Pee interval ${stats.peeInterval} - Poop interval ${stats.poopInterval}</p>
      <p>Sleep ${stats.sleepPerDay}/day - Walk ${stats.walkPerDay}/day</p>
      <p>Box ${stats.boxPerDay}/day</p>
      <p>${stats.weightText}</p>
    </article>
  `;
}

function getAvailableRecordYears() {
  const years = new Set([today.getFullYear()]);
  Object.keys(state.records || {}).forEach((date) => {
    const year = Number(date.slice(0, 4));
    if (year) {
      years.add(year);
    }
  });
  return Array.from(years).sort((a, b) => b - a);
}

function renderStatCards(stats) {
  const cards = [
    ["Pee", `${stats.peeTotal} total (${stats.peePerDay} times/day)`],
    ["Poop", `${stats.poopTotal} total (${stats.poopPerDay} times/day)`],
    ["Pee Interval", stats.peeInterval],
    ["Poop Interval", stats.poopInterval],
    ["Sleep", `${stats.sleepPerDay}/day`],
    ["Walk", `${stats.walkPerDay}/day`],
    ["Box", `${stats.boxPerDay}/day`],
    ["Weight", stats.weightText],
  ];
  return cards
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </article>
      `
    )
    .join("");
}

function calculateStatsForRange(startKey, endKey) {
  const effectiveStartKey = maxDateKey(startKey, analyticsStartKey);
  const records = Object.entries(state.records)
    .filter(([date]) => date >= effectiveStartKey && date <= endKey)
    .flatMap(([date, entries]) => entries.map((entry) => ({ ...entry, date })));
  const days = Math.max(1, countDaysInclusive(effectiveStartKey, endKey));
  const count = (type) => records.filter((record) => record.type === type).length;
  const duration = (type) => records.filter((record) => record.type === type).reduce((total, record) => total + getRecordDuration(record), 0);
  const weights = records
    .filter((record) => record.type === "weight")
    .map((record) => ({ date: record.date, value: parseWeight(record.amount) }))
    .filter((record) => Number.isFinite(record.value))
    .sort((a, b) => a.date.localeCompare(b.date));
  const latestWeight = weights.at(-1);
  const firstWeight = weights[0];
  return {
    peeTotal: count("pee"),
    poopTotal: count("poop"),
    peePerDay: formatAverage(count("pee") / days),
    poopPerDay: formatAverage(count("poop") / days),
    peeInterval: formatAverageInterval(records, "pee"),
    poopInterval: formatAverageInterval(records, "poop"),
    sleepPerDay: formatDuration(duration("sleep") / days),
    walkPerDay: formatDuration(duration("walk") / days),
    boxPerDay: formatDuration(duration("box") / days),
    weightText: latestWeight ? `${latestWeight.value.toFixed(1)}kg${firstWeight && firstWeight !== latestWeight ? ` from ${firstWeight.value.toFixed(1)}kg` : ""}` : "No data",
  };
}

function maxDateKey(a, b) {
  return a > b ? a : b;
}

function countDaysInclusive(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (!start || !end) {
    return 1;
  }
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function formatAverage(value) {
  return Number(value || 0).toFixed(value >= 10 ? 0 : 1);
}

function renderDailySummary(type) {
  const dateKey = toKey(today);
  const records = getRecordsForSummary(dateKey, type);
  const parts = [];
  const duration = records.reduce((total, record) => total + getRecordDuration(record), 0);

  if (duration && ["walk", "activity", "sleep"].includes(type)) {
    parts.push(`${formatDuration(duration)} total`);
  }
  if (type === "potty") {
    const pee = records.filter((record) => record.type === "pee").length;
    const poop = records.filter((record) => record.type === "poop").length;
    parts.push(`${pee} pee`, `${poop} poop`);
    parts.push(`Pee interval ${formatAverageInterval(records, "pee")}`);
    parts.push(`Poop interval ${formatAverageInterval(records, "poop")}`);
  } else if (type === "food") {
    parts.push(`${sumAmount(records, "g")}g consumed`);
  } else if (type === "water") {
    parts.push(`${records.length} times today`);
    parts.push(`${sumAmount(records, "ml")}mL total`);
  } else if (type === "box") {
    parts.push(`${formatDuration(duration)} in box`);
  } else if (type !== "weight" && type !== "vaccine") {
    parts.push(`${records.length} records today`);
  }

  if (type === "weight") {
    const latest = getWeightRecords().at(-1);
    parts.push(latest ? `Latest ${latest.value.toFixed(1)}kg` : "No weight yet");
  }

  return parts.length ? parts.map((part) => `<span>${escapeHtml(part)}</span>`).join("") : "<span>No records today</span>";
}

function getRecordsForSummary(dateKey, type) {
  const typeMap = {
    potty: ["pee", "poop"],
    activity: ["play", "train"],
  };
  const matchedTypes = typeMap[type] || [type];
  return (state.records[dateKey] || []).filter((record) => matchedTypes.includes(record.type));
}

function sumAmount(records, unit) {
  return Math.round(
    records.reduce((total, record) => {
      const value = parseAmountForUnit(record.amount, unit);
      return total + (Number.isFinite(value) ? value : 0);
    }, 0)
  );
}

function parseAmountForUnit(value, unit) {
  const text = String(value || "").toLowerCase();
  const unitPattern = unit === "ml" ? "m\\s*l|ml|milliliter|milliliters" : "g|gram|grams";
  const unitMatch = text.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(?:${unitPattern})`));
  if (unitMatch) {
    return Number(unitMatch[1].replace(",", "."));
  }
  const plain = text.match(/(\d+(?:[.,]\d+)?)/);
  return plain ? Number(plain[1].replace(",", ".")) : 0;
}

function formatAverageInterval(records, type) {
  const intervals = getSameDayIntervals(records.filter((record) => record.type === type));
  if (!intervals.length) {
    return "not enough data";
  }
  const average = intervals.reduce((total, value) => total + value, 0) / intervals.length;
  return formatDuration(average);
}

function getSameDayIntervals(records) {
  const byDate = new Map();
  records.forEach((record) => {
    const list = byDate.get(record.date) || [];
    list.push(record);
    byDate.set(record.date, list);
  });
  return Array.from(byDate.values()).flatMap((items) => {
    const sorted = items.slice().sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    return sorted.slice(1).map((record, index) => durationFromTimes(sorted[index].time, record.time));
  });
}

function syncProfileWeightFromRecords() {
  const latestWeight = getWeightRecords().at(-1);
  if (!latestWeight) {
    return;
  }

  state.profile.weightKg = latestWeight.value;
  hydrateMainProfile();
  hydrateProfileForm();
}

function parseWeight(value) {
  return parseFloat(String(value).replace(",", "."));
}

function getLatestPhoto() {
  return state.photos[0] || null;
}

function hydrateMainProfile() {
  elements.puppyName.value = state.profile.name;
  elements.adultWeight.value = state.profile.weightKg;
}

function hydrateProfileForm() {
  elements.ownerName.value = state.owner.name;
  elements.profilePuppyName.value = state.profile.name;
  elements.profilePuppyBirthday.value = state.profile.birthday;
  elements.puppyBreed.value = state.profile.breed;
  elements.profileWeight.value = state.profile.weightKg;
  elements.puppyNotes.value = state.profile.notes;
  elements.schoolName.value = state.school.name;
  elements.trainerName.value = state.school.trainer;
  elements.schoolContact.value = state.school.contact;
  elements.schoolNotes.value = state.school.notes;
  elements.schoolWeekday.value = String(state.schoolSchedule.weekday);
  elements.schoolTime.value = state.schoolSchedule.time;
  elements.schoolStartDate.value = state.schoolSchedule.startDate;
  elements.schoolEndDate.value = state.schoolSchedule.endDate;
  elements.rabiesDate.value = state.vaccination.rabiesDate;
  elements.rabiesValidUntil.value = state.vaccination.rabiesValidUntil;
  elements.enableVaccineAlarm.textContent = state.settings.vaccineAlarmEnabled ? "On" : "Enable";
  elements.enableSchoolAlarm.textContent = state.settings.schoolAlarmEnabled ? "On" : "Enable";
  elements.enableFoodAlarm.textContent = state.settings.foodAlarmEnabled ? "On" : "Enable";
  elements.foodType.value = state.foodSettings.type;
  elements.foodTimeMorning.value = state.foodTimes.morning;
  elements.foodTimeAfternoon.value = state.foodTimes.afternoon;
  elements.foodTimeEvening.value = state.foodTimes.evening;
  elements.foodAmountMorning.value = state.foodSettings.amounts.morning;
  elements.foodAmountAfternoon.value = state.foodSettings.amounts.afternoon;
  elements.foodAmountEvening.value = state.foodSettings.amounts.evening;
  elements.syncCode.value = state.sync.code;
  elements.firebaseConfig.value = state.sync.firebaseConfig;
  renderSyncStatus(state.sync.lastSync ? `Last sync: ${state.sync.lastSync}` : "Use the same sync code and Firebase config on each phone. Auto-sync runs after edits.");
}

function syncProfileFromForm() {
  state.owner.name = elements.ownerName.value.trim();
  state.profile.name = elements.profilePuppyName.value.trim() || "Puppy";
  state.profile.birthday = elements.profilePuppyBirthday.value || state.profile.birthday;
  state.profile.breed = elements.puppyBreed.value.trim();
  state.profile.weightKg = Number(elements.profileWeight.value) || state.profile.weightKg;
  state.profile.notes = elements.puppyNotes.value.trim();
  state.school.name = elements.schoolName.value.trim();
  state.school.trainer = elements.trainerName.value.trim();
  state.school.contact = elements.schoolContact.value.trim();
  state.school.notes = elements.schoolNotes.value.trim();
  state.schoolSchedule.weekday = Number(elements.schoolWeekday.value);
  state.schoolSchedule.time = elements.schoolTime.value;
  state.schoolSchedule.startDate = elements.schoolStartDate.value;
  state.schoolSchedule.endDate = elements.schoolEndDate.value;
  state.vaccination.rabiesDate = elements.rabiesDate.value;
  state.vaccination.rabiesValidUntil = elements.rabiesValidUntil.value;
  state.foodTimes.morning = elements.foodTimeMorning.value;
  state.foodTimes.afternoon = elements.foodTimeAfternoon.value;
  state.foodTimes.evening = elements.foodTimeEvening.value;
  state.foodSettings.type = elements.foodType.value.trim();
  state.foodSettings.amounts.morning = elements.foodAmountMorning.value.trim();
  state.foodSettings.amounts.afternoon = elements.foodAmountAfternoon.value.trim();
  state.foodSettings.amounts.evening = elements.foodAmountEvening.value.trim();
}

function getProfileInputs() {
  return [
    elements.ownerName,
    elements.profilePuppyName,
    elements.profilePuppyBirthday,
    elements.puppyBreed,
    elements.profileWeight,
    elements.puppyNotes,
    elements.schoolName,
    elements.trainerName,
    elements.schoolContact,
    elements.schoolNotes,
    elements.schoolWeekday,
    elements.schoolTime,
    elements.schoolStartDate,
    elements.schoolEndDate,
    elements.rabiesDate,
    elements.rabiesValidUntil,
    elements.foodType,
    elements.foodTimeMorning,
    elements.foodTimeAfternoon,
    elements.foodTimeEvening,
    elements.foodAmountMorning,
    elements.foodAmountAfternoon,
    elements.foodAmountEvening,
  ];
}

function renderVaccineReminders() {
  const reminders = getVaccineReminders();
  elements.enableVaccineAlarm.textContent = state.settings.vaccineAlarmEnabled ? "On" : "Enable";
  elements.vaccineReminderList.innerHTML = "";

  renderReminderList(elements.vaccineReminderList, reminders);
}

function renderReminderSections() {
  renderVaccineReminders();
  renderSchoolReminders();
  renderFoodReminders();
}

function renderReminderList(container, reminders) {
  container.innerHTML = "";
  reminders.forEach((reminder) => {
    const item = document.createElement("article");
    item.className = "reminder-item";
    item.classList.toggle("urgent", reminder.urgent);
    item.innerHTML = `
      <p class="reminder-title">${escapeHtml(reminder.title)}</p>
      <p class="reminder-meta">${escapeHtml(reminder.body)}</p>
    `;
    container.appendChild(item);
  });
}

function renderSchoolReminders() {
  elements.enableSchoolAlarm.textContent = state.settings.schoolAlarmEnabled ? "On" : "Enable";
  renderReminderList(elements.schoolReminderList, getSchoolReminders());
}

function renderFoodReminders() {
  elements.enableFoodAlarm.textContent = state.settings.foodAlarmEnabled ? "On" : "Enable";
  renderReminderList(elements.foodReminderList, getFoodReminders());
}

function getVaccineReminders() {
  const birthday = parseDateKey(state.profile.birthday);
  const reminders = [];

  if (birthday) {
    const earliestRabies = addDays(birthday, 84);
    const travelValidFrom = addDays(earliestRabies, 21);
    reminders.push({
      title: `Rabies earliest from ${formatDateKey(toKey(earliestRabies))}`,
      body: `For Germany/EU travel, rabies vaccination is counted only if the puppy is at least 12 weeks old.`,
      urgent: daysUntil(earliestRabies) <= 14 && !state.vaccination.rabiesDate,
    });
    reminders.push({
      title: `Travel protection from ${formatDateKey(toKey(travelValidFrom))}`,
      body: `Primary rabies protection starts 21 days after vaccination. Puppies can generally enter/pass Germany from 15 weeks with valid protection.`,
      urgent: daysUntil(travelValidFrom) <= 14 && !state.vaccination.rabiesDate,
    });
  }

  if (state.vaccination.rabiesValidUntil) {
    const validUntil = parseDateKey(state.vaccination.rabiesValidUntil);
    reminders.push({
      title: `Rabies booster due by ${formatDateKey(state.vaccination.rabiesValidUntil)}`,
      body: `For travel, repeat vaccination must happen within the previous vaccine's validity period; otherwise it counts as a new primary vaccination.`,
      urgent: daysUntil(validUntil) <= 30,
    });
  } else {
    reminders.push({
      title: "Add rabies validity date",
      body: "The valid-until date is set by the vaccine manufacturer and entered in the EU pet passport by the vet.",
      urgent: false,
    });
  }

  reminders.push({
    title: "Microchip before rabies for travel",
    body: "German/EU travel documents must clearly link the rabies vaccine to the identified dog, so the microchip should be recorded before vaccination.",
    urgent: false,
  });

  return reminders;
}

function getSchoolReminders() {
  const nextClass = getNextWeeklyOccurrence(
    state.schoolSchedule.weekday,
    state.schoolSchedule.time,
    state.schoolSchedule.startDate,
    state.schoolSchedule.endDate
  );

  if (!state.schoolSchedule.time) {
    return [{ title: "Set Hundeschule time", body: "Choose the weekday and time for recurring class reminders.", urgent: false }];
  }

  if (!nextClass) {
    return [{ title: "No upcoming Hundeschule", body: "The class schedule is outside the start/end date range.", urgent: false }];
  }

  return [
    {
      title: `Next Hundeschule: ${formatDateKey(toKey(nextClass))} ${formatTime(state.schoolSchedule.time)}`,
      body: state.school.name ? `${state.school.name}${state.school.trainer ? ` with ${state.school.trainer}` : ""}` : "Weekly training reminder",
      urgent: minutesUntil(nextClass) <= 120,
    },
  ];
}

function getFoodReminders() {
  const times = [
    ["Morning food", state.foodTimes.morning],
    ["Afternoon food", state.foodTimes.afternoon],
    ["Evening food", state.foodTimes.evening],
  ].filter(([, time]) => time);

  if (!times.length) {
    return [{ title: "Set food times", body: "Add one or more meal times for daily food reminders.", urgent: false }];
  }

  return times.map(([label, time]) => {
    const nextMeal = getNextDailyOccurrence(time);
    const reminderTime = new Date(nextMeal.getTime() - 5 * 60000);
    return {
      title: `${label}: ${formatTime(time)}`,
      body: `Reminder 5 minutes before: ${formatDateKey(toKey(reminderTime))} ${formatTime(reminderTime.toTimeString().slice(0, 5))}`,
      urgent: minutesUntil(reminderTime) <= 1,
    };
  });
}

function maybeRequestNotificationPermission() {
  if (!anyAlarmEnabled() || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then(() => showDueVaccinationNotification());
    return;
  }

  showDueVaccinationNotification();
}

function showDueVaccinationNotification() {
  if (!anyAlarmEnabled() || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const urgent = [
    ...(state.settings.vaccineAlarmEnabled ? getVaccineReminders() : []),
    ...(state.settings.schoolAlarmEnabled ? getSchoolReminders() : []),
    ...(state.settings.foodAlarmEnabled ? getFoodReminders() : []),
  ].find((reminder) => reminder.urgent);
  if (!urgent) {
    return;
  }

  const notificationKey = `${toKey(new Date())}-${urgent.title}`;
  if (state.settings.lastNotificationKey === notificationKey) {
    return;
  }
  state.settings.lastNotificationKey = notificationKey;
  persist();

  new Notification("Puppy Record Book reminder", {
    body: urgent.title,
  });
}

function anyAlarmEnabled() {
  return state.settings.vaccineAlarmEnabled || state.settings.schoolAlarmEnabled || state.settings.foodAlarmEnabled;
}

function startAlarmTimer() {
  showDueVaccinationNotification();
  window.setInterval(showDueVaccinationNotification, 60000);
}

function initPwaInstall() {
  updateInstallStatus();
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallStatus("Ready to install on this device.");
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallStatus("Installed on this device.");
  });
}

async function installPwa() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallStatus();
    return;
  }

  updateInstallStatus("On iPhone: open the hosted app in Safari, tap Share, then Add to Home Screen.");
}

function updateInstallStatus(message) {
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone;
  elements.installStatus.textContent = message || (standalone ? "Installed as an app." : "Install the app from Safari or Chrome to use it from the home screen.");
}

function getSyncPayload() {
  const syncState = {
    ...state,
    photos: [],
    activeSessions: normalizeActiveSessions(state.activeSessions),
    stoppedSessionIds: state.stoppedSessionIds || [],
    sync: {
      code: state.sync.code,
      lastSync: state.sync.lastSync,
      firebaseConfig: "",
    },
  };
  return makeJsonSafe({
    version: 1,
    exportedAt: new Date().toISOString(),
    data: syncState,
  });
}

function makeJsonSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

function applySyncedPayload(payload) {
  const localPhotos = state.photos;
  const localSync = state.sync;
  const localDeletedRecordIds = state.deletedRecordIds || [];
  const localActiveSessions = normalizeActiveSessions(state.activeSessions);
  const localStoppedSessionIds = state.stoppedSessionIds || [];
  const nextState = migrateState(payload.data || payload);
  nextState.deletedRecordIds = Array.from(new Set([...(nextState.deletedRecordIds || []), ...localDeletedRecordIds]));
  nextState.stoppedSessionIds = Array.from(new Set([...(nextState.stoppedSessionIds || []), ...localStoppedSessionIds]));
  nextState.records = mergeRecords(nextState.records || {}, {}, nextState.deletedRecordIds);
  nextState.activeSessions = mergeActiveSessions(localActiveSessions, nextState.activeSessions || {}, nextState.stoppedSessionIds);
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, nextState);
  state.photos = localPhotos;
  state.sync = { ...nextState.sync, ...localSync };
  state.sync.lastSync = new Date().toLocaleString();
  persist();
  hydrateMainProfile();
  hydrateProfileForm();
  refreshCurrentView();
  renderReminderSections();
}

function exportData() {
  const blob = new Blob([JSON.stringify(getSyncPayload(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `puppy-record-book-${state.sync.code || "backup"}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  renderSyncStatus("Exported a backup file.");
}

function exportExcelData() {
  const rows = [["Date", "Type", "Time", "Start", "End", "Duration minutes", "Amount", "Note"]];
  Object.entries(state.records)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, records]) => {
      records
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time))
        .forEach((record) => {
          rows.push([
            date,
            typeConfig[record.type]?.label || record.type,
            record.time || "",
            record.startTime || "",
            record.endTime || "",
            getRecordDuration(record) || "",
            record.amount || "",
            record.note || "",
          ]);
        });
    });
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `puppy-record-book-${state.sync.code || "records"}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
  renderSyncStatus("Exported an Excel-readable CSV file.");
}

function escapeCsvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function importData(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      applySyncedPayload(JSON.parse(reader.result));
      renderSyncStatus("Imported puppy book data.");
    } catch {
      renderSyncStatus("Import failed. Please choose a valid Puppy Record Book JSON file.");
    }
    elements.importDataInput.value = "";
  };
  reader.readAsText(file);
}

function renderSyncStatus(message) {
  elements.syncStatus.textContent = message;
}

async function pushFirebaseSync() {
  const settings = validateFirebaseSettings();
  if (!settings) {
    return;
  }

  renderSyncStatus("Pushing to Firebase...");
  try {
    const services = await getFirebaseServices(settings);
    await services.setDoc(services.doc(services.db, "puppy_books", state.sync.code), {
      bookData: getSyncPayload(),
      updatedAt: new Date().toISOString(),
    });
    state.sync.lastSync = new Date().toLocaleString();
    persist();
    renderSyncStatus(`Pushed to Firebase sync code "${state.sync.code}".`);
  } catch (error) {
    renderSyncStatus(`Firebase push failed: ${getFirebaseErrorMessage(error)}`);
  }
}

async function pullFirebaseSync() {
  const settings = validateFirebaseSettings();
  if (!settings) {
    return;
  }

  renderSyncStatus("Pulling from Firebase...");
  try {
    const services = await getFirebaseServices(settings);
    const snapshot = await services.getDoc(services.doc(services.db, "puppy_books", state.sync.code));
    if (!snapshot.exists()) {
      renderSyncStatus("No Firebase puppy book found for this sync code. Push first from one phone.");
      return;
    }
    applySyncedPayload(snapshot.data().bookData);
    renderSyncStatus(`Pulled Firebase sync code "${state.sync.code}".`);
  } catch (error) {
    renderSyncStatus(`Firebase pull failed: ${getFirebaseErrorMessage(error)}`);
  }
}

function scheduleAutoFirebaseSync() {
  if (persistOptions.skipAutoSync || autoSyncInProgress || !hasFirebaseSettings()) {
    return;
  }
  window.clearTimeout(autoSyncTimer);
  autoSyncTimer = window.setTimeout(autoFirebaseSync, 1800);
}

async function autoFirebaseSync() {
  if (!hasFirebaseSettings() || autoSyncInProgress) {
    return;
  }
  autoSyncInProgress = true;
  renderSyncStatus("Auto-syncing with Firebase...");
  try {
    const settings = validateFirebaseSettings();
    if (!settings) {
      return;
    }
    const services = await getFirebaseServices(settings);
    const ref = services.doc(services.db, "puppy_books", state.sync.code);
    const snapshot = await services.getDoc(ref);
    if (snapshot.exists()) {
      mergeSyncedPayload(snapshot.data().bookData);
    }
    await services.setDoc(ref, {
      bookData: getSyncPayload(),
      updatedAt: new Date().toISOString(),
    });
    state.sync.lastSync = new Date().toLocaleString();
    persist({ skipAutoSync: true });
    renderSyncStatus(`Auto-synced Firebase at ${state.sync.lastSync}.`);
  } catch (error) {
    renderSyncStatus(`Auto-sync failed: ${getFirebaseErrorMessage(error)}`);
  } finally {
    autoSyncInProgress = false;
  }
}

function hasFirebaseSettings() {
  return Boolean(state.sync.code && state.sync.code.length >= 12 && state.sync.firebaseConfig);
}

function mergeSyncedPayload(payload) {
  const localPhotos = state.photos;
  const local = makeJsonSafe(state);
  const remote = migrateState(payload?.data || payload || {});
  const merged = mergeStates(local, remote);
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, merged);
  state.photos = localPhotos;
  persist({ skipAutoSync: true });
  hydrateMainProfile();
  hydrateProfileForm();
  refreshCurrentView();
  renderReminderSections();
}

function refreshCurrentView() {
  if (currentView === "day") {
    renderDayView();
    renderCalendar();
    renderCategory();
    return;
  }
  if (currentView === "profile") {
    hydrateProfileForm();
    renderReminderSections();
    return;
  }
  if (currentView === "status") {
    renderStatusView();
    return;
  }
  renderMain();
}

function mergeStates(local, remote) {
  const merged = migrateState({ ...remote, ...local, photos: local.photos });
  const deletedRecordIds = Array.from(new Set([...(remote.deletedRecordIds || []), ...(local.deletedRecordIds || [])]));
  const stoppedSessionIds = Array.from(new Set([...(remote.stoppedSessionIds || []), ...(local.stoppedSessionIds || [])]));
  merged.owner = { ...remote.owner, ...local.owner };
  merged.profile = { ...remote.profile, ...local.profile };
  merged.school = { ...remote.school, ...local.school };
  merged.schoolSchedule = { ...remote.schoolSchedule, ...local.schoolSchedule };
  merged.foodTimes = { ...remote.foodTimes, ...local.foodTimes };
  merged.foodSettings = {
    ...remote.foodSettings,
    ...local.foodSettings,
    amounts: { ...remote.foodSettings?.amounts, ...local.foodSettings?.amounts },
  };
  merged.settings = { ...remote.settings, ...local.settings };
  merged.vaccination = { ...remote.vaccination, ...local.vaccination };
  merged.sync = { ...remote.sync, ...local.sync };
  merged.deletedRecordIds = deletedRecordIds;
  merged.stoppedSessionIds = stoppedSessionIds;
  merged.records = mergeRecords(local.records || {}, remote.records || {}, deletedRecordIds);
  merged.activeSessions = mergeActiveSessions(local.activeSessions || {}, remote.activeSessions || {}, stoppedSessionIds);
  return merged;
}

function normalizeActiveSession(type, value) {
  if (!value) {
    return null;
  }
  if (typeof value === "string") {
    return { id: `${type}-${value}`, type, start: value, updatedAt: value };
  }
  return {
    id: value.id || `${type}-${value.start || value.updatedAt || Date.now()}`,
    type: value.type || type,
    start: value.start || value.startedAt || value.updatedAt,
    updatedAt: value.updatedAt || value.start || value.startedAt || new Date().toISOString(),
  };
}

function normalizeActiveSessions(activeSessions = {}) {
  return Object.fromEntries(
    Object.entries(activeSessions)
      .map(([type, value]) => [type, normalizeActiveSession(type, value)])
      .filter(([, value]) => value?.start)
  );
}

function mergeActiveSessions(localSessions = {}, remoteSessions = {}, stoppedSessionIds = []) {
  const stopped = new Set(stoppedSessionIds);
  const merged = {};
  [...Object.entries(normalizeActiveSessions(remoteSessions)), ...Object.entries(normalizeActiveSessions(localSessions))].forEach(([type, session]) => {
    if (!session || stopped.has(session.id)) {
      return;
    }
    const existing = merged[type];
    if (!existing || new Date(session.updatedAt) >= new Date(existing.updatedAt)) {
      merged[type] = session;
    }
  });
  return merged;
}

function mergeRecords(localRecords, remoteRecords, deletedRecordIds = []) {
  const merged = {};
  const deleted = new Set(deletedRecordIds);
  [...Object.keys(remoteRecords), ...Object.keys(localRecords)].forEach((date) => {
    const byId = new Map();
    [...(remoteRecords[date] || []), ...(localRecords[date] || [])].forEach((record) => {
      const id = record.id || createId();
      if (!deleted.has(id)) {
        byId.set(id, { ...record, id });
      }
    });
    const records = Array.from(byId.values()).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    if (records.length) {
      merged[date] = records;
    }
  });
  return merged;
}

function validateFirebaseSettings() {
  state.sync.code = elements.syncCode.value.trim();
  state.sync.firebaseConfig = elements.firebaseConfig.value.trim();
  persist({ skipAutoSync: true });

  if (!state.sync.code || !state.sync.firebaseConfig) {
    renderSyncStatus("Add a sync code and Firebase config JSON first.");
    return null;
  }

  if (state.sync.code.length < 12) {
    renderSyncStatus("Firebase sync code must be at least 12 characters. Try something like leo-family-2026.");
    return null;
  }

  try {
    const config = parseFirebaseConfig(state.sync.firebaseConfig);
    if (!config.projectId) {
      throw new Error("Missing projectId");
    }
    state.sync.firebaseConfig = JSON.stringify(config, null, 2);
    elements.firebaseConfig.value = state.sync.firebaseConfig;
    persist({ skipAutoSync: true });
    return config;
  } catch {
    renderSyncStatus("Firebase config must include projectId. Paste the full firebaseConfig block from Project settings > General > SDK setup.");
    return null;
  }
}

function parseFirebaseConfig(value) {
  let text = value.trim();
  text = text
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*export\s+/gm, "")
    .trim();
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
  if (!text.startsWith("{")) {
    throw new Error("Not a config object");
  }
  try {
    return JSON.parse(text.replace(/,\s*([}\]])/g, "$1"));
  } catch {
    const jsonish = text
      .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/'/g, '"');
    return JSON.parse(jsonish);
  }
}

async function getFirebaseServices(config) {
  if (firebaseServices?.projectId === config.projectId) {
    return firebaseServices;
  }

  const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
  const authModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
  const firestoreModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
  const appName = `puppy-record-book-${config.projectId}`;
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
    setDoc: firestoreModule.setDoc,
    getDoc: firestoreModule.getDoc,
  };
  return firebaseServices;
}

function getFirebaseErrorMessage(error) {
  if (error?.code === "auth/admin-restricted-operation") {
    return "enable Anonymous sign-in in Firebase Authentication.";
  }
  if (error?.code === "permission-denied") {
    return "check Firestore rules and make sure Anonymous Auth is enabled.";
  }
  if (error?.message?.includes("Failed to fetch")) {
    return "check internet connection and Firebase project config.";
  }
  return error?.message || "check Firebase setup.";
}

function handleTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
  if (currentView === "main" || isEditableElement(event.target)) {
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = Math.abs(touch.clientY - touchStartY);
  const edgeSwipe = touchStartX <= 48 && deltaX > 80 && deltaY < 55;
  const broadSwipe = deltaX > 130 && deltaY < 45;

  if (edgeSwipe || broadSwipe) {
    showMainView();
  }
}

function isEditableElement(target) {
  return ["INPUT", "TEXTAREA", "SELECT", "OPTION"].includes(target?.tagName);
}

function getCalendarDates() {
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function createId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function updateAmountField() {
  elements.amountField.childNodes[0].nodeValue = `${typeConfig[activeType].amount} `;
  elements.recordAmount.placeholder = typeConfig[activeType].placeholder;
  syncDurationVisibility();
  if (timedRecordTypes.includes(activeType)) {
    elements.recordStartTime.value = elements.recordStartTime.value || elements.recordTime.value || new Date().toTimeString().slice(0, 5);
  }
}

function syncDurationVisibility() {
  const isTimed = timedRecordTypes.includes(activeType);
  elements.durationFields.hidden = !isTimed;
  if (isTimed) {
    elements.recordStartTime.value = elements.recordStartTime.value || elements.recordTime.value || new Date().toTimeString().slice(0, 5);
  }
}

function syncDurationFromEnd() {
  if (!timedRecordTypes.includes(activeType)) {
    return;
  }
  const startTime = elements.recordStartTime.value || elements.recordTime.value;
  const endTime = elements.recordEndTime.value;
  if (startTime && endTime) {
    elements.recordDuration.value = durationFromTimes(startTime, endTime);
  }
  elements.recordTime.value = startTime || elements.recordTime.value;
  updateDurationAmountField();
}

function syncEndFromDuration() {
  if (!timedRecordTypes.includes(activeType)) {
    return;
  }
  const startTime = elements.recordStartTime.value || elements.recordTime.value;
  const duration = Number(elements.recordDuration.value);
  if (startTime && duration > 0) {
    elements.recordEndTime.value = addMinutesToTime(startTime, duration);
  }
  elements.recordTime.value = startTime || elements.recordTime.value;
  updateDurationAmountField();
}

function updateDurationAmountField() {
  if (!timedRecordTypes.includes(activeType)) {
    return;
  }
  const duration = Number(elements.recordDuration.value);
  if (duration > 0) {
    elements.recordAmount.value = `${Math.round(duration)} min`;
  }
}

function getWeightRecords() {
  return Object.entries(state.records)
    .flatMap(([date, records]) =>
      records
        .filter((record) => record.type === "weight")
        .map((record) => ({ date, id: record.id, value: parseWeight(record.amount) }))
    )
    .filter((record) => Number.isFinite(record.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function estimateExpectedWeight(ageMonths, adultWeight) {
  const curve = [
    [1, 0.12],
    [2, 0.22],
    [3, 0.34],
    [4, 0.45],
    [5, 0.56],
    [6, 0.66],
    [8, 0.78],
    [10, 0.88],
    [12, 0.95],
    [18, 1],
  ];

  const age = Math.max(1, Math.min(18, ageMonths || 1));
  for (let index = 0; index < curve.length - 1; index += 1) {
    const [fromAge, fromRatio] = curve[index];
    const [toAge, toRatio] = curve[index + 1];
    if (age >= fromAge && age <= toAge) {
      const progress = (age - fromAge) / (toAge - fromAge);
      return adultWeight * (fromRatio + progress * (toRatio - fromRatio));
    }
  }
  return adultWeight;
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    return migrateState(JSON.parse(saved));
  }

  const key = toKey(today);
  return migrateState({
    profile: {
      name: "Leo",
      birthday: "2026-03-14",
      breed: "",
      weightKg: 5.1,
      notes: "",
    },
    owner: { name: "" },
    school: { name: "", trainer: "", contact: "", notes: "" },
    schoolSchedule: { weekday: 6, time: "18:00", startDate: key, endDate: "" },
    foodTimes: { morning: "07:30", afternoon: "", evening: "18:30" },
    foodSettings: { type: "Puppy food", amounts: { morning: "110g", afternoon: "", evening: "120g" } },
    sync: { code: "", firebaseConfig: "", lastSync: "" },
    activeSessions: {},
    stoppedSessionIds: [],
    deletedRecordIds: [],
    vaccination: { rabiesDate: "", rabiesValidUntil: "" },
    settings: { vaccineAlarmEnabled: false, schoolAlarmEnabled: false, foodAlarmEnabled: false, lastNotificationKey: "" },
    photos: [],
    records: {
      [key]: [
        { id: "sample-1", type: "food", time: "07:30", amount: "110g", note: "Breakfast" },
        { id: "sample-2", type: "walk", time: "08:15", amount: "22 min", note: "Maple park loop" },
        { id: "sample-3", type: "pee", time: "08:35", amount: "Normal", note: "After walk" },
        { id: "sample-4", type: "weight", time: "18:00", amount: "5.1kg", note: "Weekly weigh-in" },
        { id: "sample-5", type: "vaccine", time: "10:00", amount: "DHPP", note: "First vaccine" },
        { id: "sample-6", type: "school", time: "18:00", amount: "Recall", note: "Practiced attention and loose leash walking" },
      ],
    },
  });
}

function migrateState(value) {
  const profile = value.profile || {};
  const ageMonths = Number(profile.ageMonths) || 4;
  const legacyWeight = Number(profile.weightKg || profile.expectedAdultWeightKg) || 12;
  const migratedName = !profile.name || profile.name === "Mochi" ? "Leo" : profile.name;
  const migratedBirthday = !profile.birthday || profile.name === "Mochi" ? "2026-03-14" : profile.birthday;
  const photos = Array.isArray(value.photos)
    ? value.photos.map((photo) => {
        if (typeof photo === "string") {
          return { id: createId(), src: photo, date: toKey(today) };
        }
        return {
          id: photo.id || createId(),
          src: photo.src || photo,
          date: photo.date || toKey(today),
        };
      })
    : [];

  return {
    profile: {
      name: migratedName,
      birthday: migratedBirthday || shiftMonthKey(today, -ageMonths),
      breed: profile.breed || "",
      weightKg: legacyWeight,
      notes: profile.notes || "",
    },
    owner: {
      name: value.owner?.name || "",
    },
    school: {
      name: value.school?.name || "",
      trainer: value.school?.trainer || "",
      contact: value.school?.contact || "",
      notes: value.school?.notes || "",
    },
    schoolSchedule: {
      weekday: Number(value.schoolSchedule?.weekday ?? 6),
      time: value.schoolSchedule?.time || "18:00",
      startDate: value.schoolSchedule?.startDate || "",
      endDate: value.schoolSchedule?.endDate || "",
    },
    foodTimes: {
      morning: value.foodTimes?.morning || "07:30",
      afternoon: value.foodTimes?.afternoon || "",
      evening: value.foodTimes?.evening || "18:30",
    },
    foodSettings: {
      type: value.foodSettings?.type || "",
      amounts: {
        morning: value.foodSettings?.amounts?.morning || "",
        afternoon: value.foodSettings?.amounts?.afternoon || "",
        evening: value.foodSettings?.amounts?.evening || "",
      },
    },
    sync: {
      code: value.sync?.code || "",
      firebaseConfig: value.sync?.firebaseConfig || "",
      lastSync: value.sync?.lastSync || "",
    },
    activeSessions: normalizeActiveSessions(value.activeSessions || {}),
    stoppedSessionIds: Array.isArray(value.stoppedSessionIds) ? value.stoppedSessionIds : [],
    deletedRecordIds: Array.isArray(value.deletedRecordIds) ? value.deletedRecordIds : [],
    vaccination: {
      rabiesDate: value.vaccination?.rabiesDate || "",
      rabiesValidUntil: value.vaccination?.rabiesValidUntil || "",
    },
    settings: {
      vaccineAlarmEnabled: Boolean(value.settings?.vaccineAlarmEnabled),
      schoolAlarmEnabled: Boolean(value.settings?.schoolAlarmEnabled),
      foodAlarmEnabled: Boolean(value.settings?.foodAlarmEnabled),
      lastNotificationKey: value.settings?.lastNotificationKey || "",
    },
    photos: photos.slice(0, 1),
    records: value.records || {},
  };
}

function persist(options = {}) {
  persistOptions = options;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    if (state.photos.length) {
      state.photos = [];
      elements.heroPhoto.src = defaultPhoto;
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }
  scheduleAutoFirebaseSync();
  persistOptions = {};
}

function imageFileToProfileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const maxSize = 360;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(image.src);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      fileToDataUrl(file).then(resolve).catch(reject);
    };
    image.src = URL.createObjectURL(file);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getAgeMonths(birthdayKey) {
  const birthday = parseDateKey(birthdayKey);
  if (!birthday) {
    return 1;
  }

  let months = (today.getFullYear() - birthday.getFullYear()) * 12 + today.getMonth() - birthday.getMonth();
  if (today.getDate() < birthday.getDate()) {
    months -= 1;
  }
  return Math.max(1, months);
}

function formatAge(birthday, currentDate) {
  let months = (currentDate.getFullYear() - birthday.getFullYear()) * 12 + currentDate.getMonth() - birthday.getMonth();
  let days = currentDate.getDate() - birthday.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
  }

  const years = Math.floor(Math.max(0, months) / 12);
  const remainingMonths = Math.max(0, months) % 12;
  const parts = [];
  if (years) {
    parts.push(`${years} yr`);
  }
  if (remainingMonths) {
    parts.push(`${remainingMonths} mo`);
  }
  if (!years && days) {
    parts.push(`${days} days`);
  }
  return parts.length ? parts.join(" ") : "0 days";
}

function parseDateKey(key) {
  if (!key) {
    return null;
  }
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function shiftMonthKey(date, monthDelta) {
  const shifted = new Date(date.getFullYear(), date.getMonth() + monthDelta, date.getDate());
  return toKey(shifted);
}

function toKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSelectedDate(key) {
  const date = parseDateKey(key);
  return date.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatShortDate(key) {
  const [, month, day] = key.split("-");
  return `${month}.${day}`;
}

function formatDateKey(key) {
  const date = parseDateKey(key);
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysUntil(date) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.ceil((end - start) / 86400000);
}

function minutesUntil(date) {
  return Math.ceil((date - new Date()) / 60000);
}

function getNextDailyOccurrence(time) {
  const [hours, minutes] = parseTimeParts(time);
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next < new Date()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

function getNextWeeklyOccurrence(weekday, time, startDateKey, endDateKey) {
  if (!time) {
    return null;
  }

  const [hours, minutes] = parseTimeParts(time);
  const next = new Date();
  const dayDelta = (weekday - next.getDay() + 7) % 7;
  next.setDate(next.getDate() + dayDelta);
  next.setHours(hours, minutes, 0, 0);
  if (next < new Date()) {
    next.setDate(next.getDate() + 7);
  }

  const startDate = parseDateKey(startDateKey);
  if (startDate && next < startDate) {
    const adjustedDelta = (weekday - startDate.getDay() + 7) % 7;
    next.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + adjustedDelta);
    next.setHours(hours, minutes, 0, 0);
  }

  const endDate = parseDateKey(endDateKey);
  if (endDate) {
    endDate.setHours(23, 59, 59, 999);
    if (next > endDate) {
      return null;
    }
  }

  return next;
}

function parseTimeParts(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return [hours || 0, minutes || 0];
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const [hourValue, minute] = value.split(":");
  const hour = Number(hourValue);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${period}${displayHour}:${minute}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[char];
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    return;
  }

  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Offline support is a nice-to-have; the app should still run without it.
  });
}
