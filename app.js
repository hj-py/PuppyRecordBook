const storageKey = "puppy-record-book-state";
const syncTableName = "puppy_books";

const typeConfig = {
  walk: { label: "Walk", icon: "W", color: "#617861", amount: "Minutes", placeholder: "e.g. 30 min" },
  food: { label: "Food", icon: "F", color: "#d69b41", amount: "Amount", placeholder: "e.g. 120g" },
  poop: { label: "Poop", icon: "P", color: "#7b5f45", amount: "Result", placeholder: "normal, soft..." },
  pee: { label: "Pee", icon: "P", color: "#7fa6b8", amount: "Result", placeholder: "clear, frequent..." },
  weight: { label: "Weight", icon: "Kg", color: "#c86f5c", amount: "Weight", placeholder: "e.g. 4.8kg" },
  vaccine: { label: "Vaccine", icon: "V", color: "#4f6f93", amount: "Dose", placeholder: "e.g. DHPP" },
  school: { label: "Hundeschule", icon: "H", color: "#7f6aa3", amount: "Topic", placeholder: "e.g. leash walking" },
  play: { label: "Play", icon: "Pl", color: "#d68a6a", amount: "Duration", placeholder: "auto" },
  sleep: { label: "Sleep", icon: "S", color: "#6f7896", amount: "Duration", placeholder: "auto" },
  train: { label: "Train", icon: "T", color: "#817044", amount: "Duration", placeholder: "auto" },
};

const categoryTypes = ["walk", "food", "weight", "vaccine", "school"];
const timedQuickTypes = ["walk", "play", "sleep", "train"];
const defaultPhoto =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23e8dfcf'/%3E%3Ccircle cx='80' cy='78' r='46' fill='%23b98b68'/%3E%3Ccircle cx='48' cy='54' r='22' fill='%23816045'/%3E%3Ccircle cx='112' cy='54' r='22' fill='%23816045'/%3E%3Ccircle cx='64' cy='74' r='6' fill='%2325231f'/%3E%3Ccircle cx='96' cy='74' r='6' fill='%2325231f'/%3E%3Cellipse cx='80' cy='90' rx='10' ry='7' fill='%2325231f'/%3E%3Cpath d='M66 105c10 9 20 9 29 0' fill='none' stroke='%2325231f' stroke-width='6' stroke-linecap='round'/%3E%3C/svg%3E";

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

const elements = {
  mainView: document.querySelector("#mainView"),
  dayView: document.querySelector("#dayView"),
  profileView: document.querySelector("#profileView"),
  currentMonth: document.querySelector("#currentMonth"),
  profileButton: document.querySelector("#profileButton"),
  previousMonth: document.querySelector("#previousMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  calendarGrid: document.querySelector("#calendarGrid"),
  photoCalendarGrid: document.querySelector("#photoCalendarGrid"),
  backToMain: document.querySelector("#backToMain"),
  backFromProfile: document.querySelector("#backFromProfile"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  dayDateInput: document.querySelector("#dayDateInput"),
  recordTime: document.querySelector("#recordTime"),
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
  categoryList: document.querySelector("#categoryList"),
  activeSessionCount: document.querySelector("#activeSessionCount"),
  quickLogStatus: document.querySelector("#quickLogStatus"),
  heroPhoto: document.querySelector("#heroPhoto"),
  photoInput: document.querySelector("#photoInput"),
  dayPhotoInput: document.querySelector("#dayPhotoInput"),
  photoGallery: document.querySelector("#photoGallery"),
  photoCount: document.querySelector("#photoCount"),
  dayPhotoCount: document.querySelector("#dayPhotoCount"),
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
  syncUrl: document.querySelector("#syncUrl"),
  syncKey: document.querySelector("#syncKey"),
  pushSyncButton: document.querySelector("#pushSyncButton"),
  pullSyncButton: document.querySelector("#pullSyncButton"),
  pushFirebaseButton: document.querySelector("#pushFirebaseButton"),
  pullFirebaseButton: document.querySelector("#pullFirebaseButton"),
  firebaseConfig: document.querySelector("#firebaseConfig"),
  exportDataButton: document.querySelector("#exportDataButton"),
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

  elements.backToMain.addEventListener("click", () => {
    showMainView();
  });

  elements.backFromProfile.addEventListener("click", () => {
    showMainView();
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

  [elements.puppyName, elements.adultWeight].forEach((input) => {
    input.addEventListener("input", () => {
      state.profile.name = elements.puppyName.value.trim() || "Puppy";
      state.profile.weightKg = Number(elements.adultWeight.value) || state.profile.weightKg;
      persist();
      hydrateProfileForm();
      renderAge();
      renderInsight();
    });
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
  elements.pushSyncButton.addEventListener("click", pushCloudSync);
  elements.pullSyncButton.addEventListener("click", pullCloudSync);
  elements.pushFirebaseButton.addEventListener("click", pushFirebaseSync);
  elements.pullFirebaseButton.addEventListener("click", pullFirebaseSync);
  elements.exportDataButton.addEventListener("click", exportData);
  elements.importDataInput.addEventListener("change", importData);

  [elements.syncCode, elements.syncUrl, elements.syncKey, elements.firebaseConfig].forEach((input) => {
    input.addEventListener("input", () => {
      state.sync.code = elements.syncCode.value.trim();
      state.sync.url = elements.syncUrl.value.trim();
      state.sync.key = elements.syncKey.value.trim();
      state.sync.firebaseConfig = elements.firebaseConfig.value.trim();
      persist();
    });
  });

  elements.photoInput.addEventListener("change", async (event) => {
    await addPhotosFromInput(event.target, toKey(today));
    renderMain();
  });

  elements.dayPhotoInput.addEventListener("change", async (event) => {
    await addPhotosFromInput(event.target, selectedDate);
    renderDayView();
  });

  document.addEventListener("touchstart", handleTouchStart, { passive: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
}

function renderMain() {
  currentView = "main";
  elements.mainView.hidden = false;
  elements.dayView.hidden = true;
  elements.profileView.hidden = true;
  renderCalendar();
  renderAge();
  renderInsight();
  renderQuickLogButtons();
  renderPhotoCalendar();
  renderCategory();
  elements.heroPhoto.src = getLatestPhoto()?.src || defaultPhoto;
}

function renderDayView() {
  elements.selectedDateLabel.textContent = formatSelectedDate(selectedDate);
  elements.dayDateInput.value = selectedDate;
  elements.recordTime.value = elements.recordTime.value || new Date().toTimeString().slice(0, 5);
  renderRecords();
  renderDayPhotos();
}

function showDayView(dateKey) {
  currentView = "day";
  selectedDate = dateKey;
  const date = parseDateKey(dateKey);
  visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  elements.mainView.hidden = true;
  elements.dayView.hidden = false;
  elements.profileView.hidden = true;
  renderDayView();
}

function showMainView() {
  currentView = "main";
  elements.mainView.hidden = false;
  elements.dayView.hidden = true;
  elements.profileView.hidden = true;
  renderMain();
}

function showProfileView() {
  currentView = "profile";
  elements.mainView.hidden = true;
  elements.dayView.hidden = true;
  elements.profileView.hidden = false;
  hydrateProfileForm();
  renderReminderSections();
}

function renderCalendar() {
  elements.currentMonth.textContent = visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  elements.calendarGrid.innerHTML = "";

  getCalendarDates().forEach((day) => {
    const key = toKey(day);
    const records = state.records[key] || [];
    const photoCount = getPhotosForDate(key).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-cell";
    button.classList.toggle("muted", day.getMonth() !== visibleMonth.getMonth());
    button.classList.toggle("today", key === toKey(today));
    button.classList.toggle("selected", key === selectedDate);
    button.innerHTML = `
      <span class="day-number">${day.getDate()}</span>
      <span class="dot-row">${records.slice(0, 3).map(() => '<span class="dot"></span>').join("")}${photoCount ? '<span class="dot photo-dot"></span>' : ""}</span>
    `;
    button.addEventListener("click", () => showDayView(key));
    elements.calendarGrid.appendChild(button);
  });
}

function renderPhotoCalendar() {
  elements.photoCount.textContent = state.photos.length;
  elements.photoCalendarGrid.innerHTML = "";

  getCalendarDates().forEach((day) => {
    const key = toKey(day);
    const photos = getPhotosForDate(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "photo-day";
    button.classList.toggle("muted", day.getMonth() !== visibleMonth.getMonth());
    button.classList.toggle("has-photo", photos.length > 0);
    button.innerHTML = `
      <span class="day-number">${day.getDate()}</span>
      ${renderPhotoThumbs(photos, key)}
      ${photos.length > 1 ? `<span class="photo-day-count">${photos.length}</span>` : ""}
    `;
    button.addEventListener("click", () => showDayView(key));
    elements.photoCalendarGrid.appendChild(button);
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
      state.records[selectedDate] = (state.records[selectedDate] || []).filter((entry) => entry.id !== record.id);
      if (!state.records[selectedDate].length) {
        delete state.records[selectedDate];
      }
      syncProfileWeightFromRecords();
      persist();
      renderDayView();
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

function renderDayPhotos() {
  const photos = getPhotosForDate(selectedDate);
  elements.dayPhotoCount.textContent = photos.length;
  elements.photoGallery.innerHTML = "";

  if (!photos.length) {
    const placeholder = document.createElement("img");
    placeholder.src = defaultPhoto;
    placeholder.alt = "Puppy photo placeholder";
    elements.photoGallery.appendChild(placeholder);
    return;
  }

  photos.forEach((photo, index) => {
    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = `Puppy photo ${index + 1}`;
    img.addEventListener("click", () => {
      elements.heroPhoto.src = photo.src;
    });
    elements.photoGallery.appendChild(img);
  });
}

function renderPhotoThumbs(photos, dateKey) {
  if (!photos.length) {
    return "";
  }

  return `<span class="photo-thumbs">${photos
    .slice(0, 4)
    .map((photo, index) => `<img src="${photo.src}" alt="Photo ${index + 1} from ${formatShortDate(dateKey)}" />`)
    .join("")}</span>`;
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
    button.classList.toggle("active", Boolean(state.activeSessions[button.dataset.action]));
    if (timedQuickTypes.includes(button.dataset.action)) {
      button.textContent = state.activeSessions[button.dataset.action] ? `Stop ${typeConfig[button.dataset.action].label}` : typeConfig[button.dataset.action].label;
    }
  });
  elements.activeSessionCount.textContent = Object.keys(state.activeSessions).length;
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
  const record = {
    id: createId(),
    type,
    time: time.toTimeString().slice(0, 5),
    amount,
    note,
  };

  state.records[dateKey] = [...(state.records[dateKey] || []), record];
  selectedDate = dateKey;
  visibleMonth = new Date(time.getFullYear(), time.getMonth(), 1);
  persist();
  renderMain();
  elements.quickLogStatus.textContent = `${typeConfig[type].label} saved for ${formatTime(record.time)}.`;
}

function toggleTimedQuickLog(type) {
  const now = new Date();
  const existing = state.activeSessions[type];
  if (!existing) {
    state.activeSessions[type] = now.toISOString();
    persist();
    renderQuickLogButtons();
    elements.quickLogStatus.textContent = `${typeConfig[type].label} started at ${formatTime(now.toTimeString().slice(0, 5))}.`;
    return;
  }

  const start = new Date(existing);
  const minutes = Math.max(1, Math.round((now - start) / 60000));
  const amount = `${minutes} min`;
  const note = `${formatTime(start.toTimeString().slice(0, 5))} - ${formatTime(now.toTimeString().slice(0, 5))}`;
  delete state.activeSessions[type];
  addQuickRecord(type, amount, note, start);
  elements.quickLogStatus.textContent = `${typeConfig[type].label} ended. ${amount} saved.`;
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

function renderCategory() {
  if (activeCategory === "weight") {
    renderGrowthCategory();
    return;
  }

  const category = getCategoryMeta(activeCategory);
  const records = getCategoryRecords(activeCategory);
  elements.categoryTitle.textContent = `${category.label} Records`;
  elements.categoryCount.textContent = records.length;
  elements.categoryList.innerHTML = "";

  if (!records.length) {
    const range = activeCategory === "vaccine" ? "yet" : "this month";
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
    `;
    item.addEventListener("click", () => showDayView(entry.date));
    elements.categoryList.appendChild(item);
  });
}

function renderGrowthCategory() {
  const weights = getWeightRecords();
  elements.categoryTitle.textContent = "Weight Records";
  elements.categoryCount.textContent = weights.length;

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
          <article class="category-item">
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

  const record = {
    id: createId(),
    type: activeType,
    time: elements.recordTime.value || new Date().toTimeString().slice(0, 5),
    amount: elements.recordAmount.value.trim(),
    note: elements.recordNote.value.trim(),
  };

  state.records[selectedDate] = [...(state.records[selectedDate] || []), record];
  if (record.type === "weight") {
    const parsedWeight = parseWeight(record.amount);
    if (Number.isFinite(parsedWeight)) {
      state.profile.weightKg = parsedWeight;
      hydrateMainProfile();
      hydrateProfileForm();
    }
  }
  if (categoryTypes.includes(activeType)) {
    activeCategory = activeType;
    document.querySelectorAll(".category-tab").forEach((button) => {
      button.classList.toggle("selected", button.dataset.category === activeCategory);
    });
  }

  elements.recordAmount.value = "";
  elements.recordNote.value = "";
  persist();
  renderDayView();
}

function startEditRecord(record) {
  editingRecordId = record.id;
  activeType = record.type;
  elements.recordTime.value = record.time;
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

  record.type = activeType;
  record.time = elements.recordTime.value || record.time;
  record.amount = elements.recordAmount.value.trim();
  record.note = elements.recordNote.value.trim();
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
  elements.saveRecord.textContent = "Save";
  elements.cancelEditRecord.hidden = true;
}

async function addPhotosFromInput(input, dateKey) {
  const files = Array.from(input.files || []);
  for (const file of files) {
    const photo = await fileToDataUrl(file);
    state.photos.unshift({ id: createId(), src: photo, date: dateKey });
  }
  state.photos = state.photos.slice(0, 40);
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
          if (["potty", "activity", "sleep", "walk", "food", "school"].includes(type)) {
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
      secondary: "Monthly walk record",
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
    primary: entry.amount || "Food",
    secondary: entry.note,
  };
}

function getPhotosForDate(dateKey) {
  return state.photos.filter((photo) => photo.date === dateKey);
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
  elements.syncUrl.value = state.sync.url;
  elements.syncKey.value = state.sync.key;
  elements.firebaseConfig.value = state.sync.firebaseConfig;
  renderSyncStatus(state.sync.lastSync ? `Last sync: ${state.sync.lastSync}` : "Use the same sync code on each phone. Push uploads this puppy book; Pull downloads the shared copy.");
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
    return {
      title: `${label}: ${formatTime(time)}`,
      body: `Next reminder ${formatDateKey(toKey(nextMeal))} ${formatTime(time)}`,
      urgent: minutesUntil(nextMeal) <= 45,
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
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state,
  };
}

function applySyncedPayload(payload) {
  const nextState = migrateState(payload.data || payload);
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, nextState);
  state.sync.lastSync = new Date().toLocaleString();
  persist();
  hydrateMainProfile();
  hydrateProfileForm();
  renderMain();
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

async function pushCloudSync() {
  if (!validateSyncSettings()) {
    return;
  }

  renderSyncStatus("Pushing shared puppy book...");
  try {
    const response = await fetch(`${state.sync.url}/rest/v1/${syncTableName}?on_conflict=sync_code`, {
      method: "POST",
      headers: getSupabaseHeaders(),
      body: JSON.stringify({ sync_code: state.sync.code, book_data: getSyncPayload(), updated_at: new Date().toISOString() }),
    });

    if (!response.ok) {
      throw new Error("Unable to push sync row");
    }
    state.sync.lastSync = new Date().toLocaleString();
    persist();
    renderSyncStatus(`Pushed to sync code "${state.sync.code}".`);
  } catch {
    renderSyncStatus("Cloud push failed. Check Supabase URL, anon key, table, and internet connection.");
  }
}

async function pullCloudSync() {
  if (!validateSyncSettings()) {
    return;
  }

  renderSyncStatus("Pulling shared puppy book...");
  try {
    const response = await fetch(`${state.sync.url}/rest/v1/${syncTableName}?sync_code=eq.${encodeURIComponent(state.sync.code)}&select=book_data&limit=1`, {
      headers: getSupabaseHeaders(),
    });
    if (!response.ok) {
      throw new Error("Unable to pull sync row");
    }
    const rows = await response.json();
    if (!rows.length) {
      renderSyncStatus("No shared puppy book found for this sync code. Push first from one phone.");
      return;
    }
    applySyncedPayload(rows[0].book_data);
    renderSyncStatus(`Pulled shared puppy book "${state.sync.code}".`);
  } catch {
    renderSyncStatus("Cloud pull failed. Check Supabase URL, anon key, table, and internet connection.");
  }
}

function validateSyncSettings() {
  state.sync.code = elements.syncCode.value.trim();
  state.sync.url = elements.syncUrl.value.trim().replace(/\/$/, "");
  state.sync.key = elements.syncKey.value.trim();
  persist();

  if (!state.sync.code || !state.sync.url || !state.sync.key) {
    renderSyncStatus("Add a sync code, Supabase URL, and Supabase anon key first.");
    return false;
  }

  return true;
}

function getSupabaseHeaders() {
  return {
    apikey: state.sync.key,
    Authorization: `Bearer ${state.sync.key}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  };
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
    const response = await fetch(getFirebaseDocumentUrl(settings), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          bookData: { stringValue: JSON.stringify(getSyncPayload()) },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });
    if (!response.ok) {
      throw new Error("Firebase push failed");
    }
    state.sync.lastSync = new Date().toLocaleString();
    persist();
    renderSyncStatus(`Pushed to Firebase sync code "${state.sync.code}".`);
  } catch {
    renderSyncStatus("Firebase push failed. Check Firestore rules, project config, and internet connection.");
  }
}

async function pullFirebaseSync() {
  const settings = validateFirebaseSettings();
  if (!settings) {
    return;
  }

  renderSyncStatus("Pulling from Firebase...");
  try {
    const response = await fetch(getFirebaseDocumentUrl(settings));
    if (!response.ok) {
      throw new Error("Firebase pull failed");
    }
    const documentData = await response.json();
    const rawPayload = documentData.fields?.bookData?.stringValue;
    if (!rawPayload) {
      renderSyncStatus("No Firebase puppy book found for this sync code. Push first from one phone.");
      return;
    }
    applySyncedPayload(JSON.parse(rawPayload));
    renderSyncStatus(`Pulled Firebase sync code "${state.sync.code}".`);
  } catch {
    renderSyncStatus("Firebase pull failed. Check Firestore rules, project config, and internet connection.");
  }
}

function validateFirebaseSettings() {
  state.sync.code = elements.syncCode.value.trim();
  state.sync.firebaseConfig = elements.firebaseConfig.value.trim();
  persist();

  if (!state.sync.code || !state.sync.firebaseConfig) {
    renderSyncStatus("Add a sync code and Firebase config JSON first.");
    return null;
  }

  try {
    const config = JSON.parse(state.sync.firebaseConfig);
    if (!config.projectId) {
      throw new Error("Missing projectId");
    }
    return config;
  } catch {
    renderSyncStatus("Firebase config must be valid JSON and include projectId.");
    return null;
  }
}

function getFirebaseDocumentUrl(config) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents/puppy_books/${encodeURIComponent(state.sync.code)}`;
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
}

function getWeightRecords() {
  return Object.entries(state.records)
    .flatMap(([date, records]) =>
      records
        .filter((record) => record.type === "weight")
        .map((record) => ({ date, value: parseWeight(record.amount) }))
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
    sync: { code: "", url: "", key: "", firebaseConfig: "", lastSync: "" },
    activeSessions: {},
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
      url: value.sync?.url || "",
      key: value.sync?.key || "",
      firebaseConfig: value.sync?.firebaseConfig || "",
      lastSync: value.sync?.lastSync || "",
    },
    activeSessions: value.activeSessions || {},
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
    photos,
    records: value.records || {},
  };
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
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
