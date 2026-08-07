const storageKey = "puppy-record-book-state";
const backupStorageKey = "puppy-record-book-state-backups";
const pendingSyncStorageKey = "puppy-record-book-firebase-pending";

const typeConfig = {
  walk: { label: "Walk", icon: "W", color: "#617861", amount: "Minutes", placeholder: "e.g. 30 min" },
  food: { label: "Food", icon: "F", color: "#d69b41", amount: "Amount", placeholder: "e.g. 120g" },
  water: { label: "Water", icon: "Wa", color: "#5799ad", amount: "Amount", placeholder: "e.g. fresh bowl" },
  poop: { label: "Poop", icon: "P", color: "#7b5f45", amount: "Result", placeholder: "normal, soft..." },
  pee: { label: "Pee", icon: "P", color: "#7fa6b8", amount: "Result", placeholder: "clear, frequent..." },
  weight: { label: "Weight", icon: "Kg", color: "#c86f5c", amount: "Weight", placeholder: "e.g. 4.8kg" },
  vaccine: { label: "Vet", icon: "Vet", color: "#4f6f93", amount: "Detail", placeholder: "e.g. DHPP, checkup, clinic name" },
  school: { label: "Hundeschule", icon: "H", color: "#7f6aa3", amount: "Topic", placeholder: "e.g. leash walking" },
  play: { label: "Play", icon: "Pl", color: "#d68a6a", amount: "Duration", placeholder: "auto" },
  sleep: { label: "Sleep", icon: "S", color: "#6f7896", amount: "Duration", placeholder: "auto" },
  train: { label: "Train", icon: "T", color: "#817044", amount: "Duration", placeholder: "auto" },
  box: { label: "Box", icon: "B", color: "#8a7768", amount: "Duration", placeholder: "auto" },
  shower: { label: "Shower", icon: "Sh", color: "#4f8f8a", amount: "Detail", placeholder: "e.g. shampoo, paw wash" },
  tooth: { label: "Brush teeth", icon: "Bt", color: "#6f8fb4", amount: "Detail", placeholder: "e.g. finger brush, dental gel" },
  note: { label: "Note", icon: "N", color: "#6e6a5f", amount: "Topic", placeholder: "e.g. mood, symptom, visitor" },
};

const categoryTypes = ["walk", "food", "water", "weight", "sleep", "box", "note"];
const timedQuickTypes = ["walk", "play", "sleep", "train", "box"];
const timedRecordTypes = ["walk", "play", "sleep", "train", "box"];
const analyticsStartKey = "2026-05-09";
const notePlaceholder = "Park, chicken kibble, rabies vaccine...";
const defaultSnackList = ["Dental stick", "Training treat", "Carrot"];
const joseraFeedingSourceUrl = "https://josera.com/en/feeding-calculator";
const joseraProducts = [
  {
    key: "youngstar",
    label: "YoungStar",
    kcalPerKg: 3725,
    guideUrl: "https://www.josera.de/josera-youngstar.html",
    aliases: ["young star", "josera youngstar", "josera young star", "youngstar dry food"],
  },
  {
    key: "kids",
    label: "Kids",
    kcalPerKg: 3675,
    guideUrl: "https://www.josera.fr/josera-kids.html",
    aliases: ["josera kids", "kids dry food"],
  },
  {
    key: "sensijunior",
    label: "SensiJunior",
    kcalPerKg: 3950,
    guideUrl: "https://www.josera.fr/josera-sensijunior.html",
    aliases: ["sensi junior", "josera sensijunior", "josera sensi junior"],
  },
  {
    key: "mini-junior-duck-salmon",
    label: "Mini Junior Duck & Salmon",
    kcalPerKg: 3991,
    guideUrl: "https://www.josera.fr/josera-minijunior.html",
    aliases: ["mini junior", "minijunior", "duck salmon", "duck & salmon", "mini junior duck salmon"],
  },
  {
    key: "junior-duck-potato",
    label: "Junior Duck & Potato",
    kcalPerKg: 3689,
    guideUrl: "https://www.josera.fr/josera-junior-duck-potato-relaunch25.html",
    aliases: ["junior duck potato", "duck potato", "duck & potato"],
  },
];
const joseraGrowthModel = {
  7: { a: 36.92, b: -43.57 },
  15: { a: 36.86, b: -48.22 },
  27.5: { a: 39.88, b: -60.7 },
  47.5: { a: 36.96, b: -56.18 },
  class5: { a: 36.61, b: -62.39 },
};
const defaultPhoto =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23e8dfcf'/%3E%3Ccircle cx='80' cy='84' r='50' fill='%23fffdf8'/%3E%3Cpath d='M43 58c-15 7-25 21-23 36 1 12 9 20 19 20 12 0 19-11 18-24-1-10-6-22-14-32Z' fill='%23efe4d0'/%3E%3Cpath d='M117 58c15 7 25 21 23 36-1 12-9 20-19 20-12 0-19-11-18-24 1-10 6-22 14-32Z' fill='%23efe4d0'/%3E%3Cpath d='M44 70c9-26 64-26 73 0 7 19-1 50-37 50S37 89 44 70Z' fill='%23fff8e9'/%3E%3Cpath d='M55 63c9-14 43-18 52 0-13-7-39-7-52 0Z' fill='%23f6edda'/%3E%3Ccircle cx='64' cy='80' r='5.8' fill='%2325231f'/%3E%3Ccircle cx='96' cy='80' r='5.8' fill='%2325231f'/%3E%3Ccircle cx='66' cy='78' r='2' fill='%23fffdf8'/%3E%3Ccircle cx='98' cy='78' r='2' fill='%23fffdf8'/%3E%3Cellipse cx='80' cy='95' rx='11' ry='8' fill='%232d2923'/%3E%3Cpath d='M71 108c7 7 17 7 25 0' fill='none' stroke='%232d2923' stroke-width='5.5' stroke-linecap='round'/%3E%3C/svg%3E";

let today = new Date();
const state = loadState();
let lastPersistedStateJson = JSON.stringify(state);
let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = toKey(today);
let activeType = "walk";
let activeCategory = "walk";
let deferredInstallPrompt = null;
let currentView = "main";
let touchStartX = 0;
let touchStartY = 0;
let touchStartScrollY = 0;
let touchMaxPullY = 0;
let touchMaxHorizontal = 0;
let touchTrackingPull = false;
let touchGestureActive = false;
let pullRefreshInProgress = false;
let editingRecordId = null;
let firebaseServices = null;
let autoSyncTimer = null;
let firebaseRetryTimer = null;
let firebaseRetryCount = 0;
let activeTimerInterval = null;
let autoSyncInProgress = false;
let autoSyncQueued = false;
let localChangeRevision = hasStoredPendingFirebasePush() ? 1 : 0;
let resumeSyncInProgress = false;
let lastResumeSyncAt = 0;
let appWasHidden = document.hidden;
let importInProgress = false;
let persistOptions = {};
let selectedStatusYear = today.getFullYear();
let activeCalendarType = "walk";
let calendarEditingRecordId = null;
let homeBookmarkMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedBookmarkYear = today.getFullYear();

const elements = {
  pullRefreshIndicator: document.querySelector("#pullRefreshIndicator"),
  appToast: document.querySelector("#appToast"),
  mainView: document.querySelector("#mainView"),
  dayView: document.querySelector("#dayView"),
  calendarView: document.querySelector("#calendarView"),
  bookmarksView: document.querySelector("#bookmarksView"),
  profileView: document.querySelector("#profileView"),
  statusView: document.querySelector("#statusView"),
  currentMonth: document.querySelector("#currentMonth"),
  profileButton: document.querySelector("#profileButton"),
  statusButton: document.querySelector("#statusButton"),
  calendarPageButton: document.querySelector("#calendarPageButton"),
  bookmarksButton: document.querySelector("#bookmarksButton"),
  calendarToBookmarks: document.querySelector("#calendarToBookmarks"),
  bookmarksToCalendar: document.querySelector("#bookmarksToCalendar"),
  statusSettingsButton: document.querySelector("#statusSettingsButton"),
  calendarPageTitle: document.querySelector("#calendarPageTitle"),
  calendarPagePreviousMonth: document.querySelector("#calendarPagePreviousMonth"),
  calendarPageNextMonth: document.querySelector("#calendarPageNextMonth"),
  calendarPageGrid: document.querySelector("#calendarPageGrid"),
  calendarSelectedDateLabel: document.querySelector("#calendarSelectedDateLabel"),
  calendarDaySummary: document.querySelector("#calendarDaySummary"),
  calendarBookmarkDay: document.querySelector("#calendarBookmarkDay"),
  calendarBookmarkNoteField: document.querySelector("#calendarBookmarkNoteField"),
  calendarBookmarkNote: document.querySelector("#calendarBookmarkNote"),
  calendarRecordCount: document.querySelector("#calendarRecordCount"),
  calendarRecordList: document.querySelector("#calendarRecordList"),
  openSelectedDayEditor: document.querySelector("#openSelectedDayEditor"),
  calendarInlineEditor: document.querySelector("#calendarInlineEditor"),
  calendarEditorDate: document.querySelector("#calendarEditorDate"),
  calendarEditorTime: document.querySelector("#calendarEditorTime"),
  calendarEditorStartTime: document.querySelector("#calendarEditorStartTime"),
  calendarEditorEndTime: document.querySelector("#calendarEditorEndTime"),
  calendarEditorDuration: document.querySelector("#calendarEditorDuration"),
  calendarDurationFields: document.querySelector("#calendarDurationFields"),
  calendarEditorAmount: document.querySelector("#calendarEditorAmount"),
  calendarFoodKindField: document.querySelector("#calendarFoodKindField"),
  calendarFoodKind: document.querySelector("#calendarFoodKind"),
  calendarSnackNameField: document.querySelector("#calendarSnackNameField"),
  calendarSnackName: document.querySelector("#calendarSnackName"),
  calendarVetKindField: document.querySelector("#calendarVetKindField"),
  calendarVetKind: document.querySelector("#calendarVetKind"),
  calendarVetReminderField: document.querySelector("#calendarVetReminderField"),
  calendarVetReminderMinutes: document.querySelector("#calendarVetReminderMinutes"),
  calendarVetReminderPreview: document.querySelector("#calendarVetReminderPreview"),
  calendarAccidentField: document.querySelector("#calendarAccidentField"),
  calendarRecordAccident: document.querySelector("#calendarRecordAccident"),
  calendarEditorNote: document.querySelector("#calendarEditorNote"),
  calendarAmountField: document.querySelector("#calendarAmountField"),
  calendarCancelEdit: document.querySelector("#calendarCancelEdit"),
  calendarSaveRecord: document.querySelector("#calendarSaveRecord"),
  bookmarkYearTitle: document.querySelector("#bookmarkYearTitle"),
  bookmarkYearSelect: document.querySelector("#bookmarkYearSelect"),
  bookmarkCount: document.querySelector("#bookmarkCount"),
  bookmarkList: document.querySelector("#bookmarkList"),
  homeMonthlyAverageTitle: document.querySelector("#homeMonthlyAverageTitle"),
  homeMonthlyAverage: document.querySelector("#homeMonthlyAverage"),
  homeBookmarkTitle: document.querySelector("#homeBookmarkTitle"),
  homeBookmarkCount: document.querySelector("#homeBookmarkCount"),
  homeBookmarkSummary: document.querySelector("#homeBookmarkSummary"),
  homeBookmarkPreviousMonth: document.querySelector("#homeBookmarkPreviousMonth"),
  homeBookmarkNextMonth: document.querySelector("#homeBookmarkNextMonth"),
  selectedDateLabel: document.querySelector("#selectedDateLabel"),
  dayDateInput: document.querySelector("#dayDateInput"),
  bookmarkDay: document.querySelector("#bookmarkDay"),
  bookmarkNoteField: document.querySelector("#bookmarkNoteField"),
  bookmarkNote: document.querySelector("#bookmarkNote"),
  recordTime: document.querySelector("#recordTime"),
  recordStartTime: document.querySelector("#recordStartTime"),
  recordEndTime: document.querySelector("#recordEndTime"),
  recordDuration: document.querySelector("#recordDuration"),
  durationFields: document.querySelector("#durationFields"),
  recordAmount: document.querySelector("#recordAmount"),
  foodKindField: document.querySelector("#foodKindField"),
  foodKind: document.querySelector("#foodKind"),
  snackNameField: document.querySelector("#snackNameField"),
  snackName: document.querySelector("#snackName"),
  vetKindField: document.querySelector("#vetKindField"),
  vetKind: document.querySelector("#vetKind"),
  vetReminderField: document.querySelector("#vetReminderField"),
  vetReminderMinutes: document.querySelector("#vetReminderMinutes"),
  vetReminderPreview: document.querySelector("#vetReminderPreview"),
  accidentField: document.querySelector("#accidentField"),
  recordAccident: document.querySelector("#recordAccident"),
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
  activeSessionTimers: document.querySelector("#activeSessionTimers"),
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
  foodTargetMode: document.querySelector("#foodTargetMode"),
  foodType: document.querySelector("#foodType"),
  foodType2: document.querySelector("#foodType2"),
  snackList: document.querySelector("#snackList"),
  foodDailyTarget: document.querySelector("#foodDailyTarget"),
  foodExpectedWeight: document.querySelector("#foodExpectedWeight"),
  foodEstimatedWeight: document.querySelector("#foodEstimatedWeight"),
  foodUseEstimatedWeight: document.querySelector("#foodUseEstimatedWeight"),
  foodRecommendationStatus: document.querySelector("#foodRecommendationStatus"),
  foodReminderMinutes: document.querySelector("#foodReminderMinutes"),
  foodTimeMorning: document.querySelector("#foodTimeMorning"),
  foodTimeAfternoon: document.querySelector("#foodTimeAfternoon"),
  foodTimeEvening: document.querySelector("#foodTimeEvening"),
  foodAmountMorning: document.querySelector("#foodAmountMorning"),
  foodAmountMorning2: document.querySelector("#foodAmountMorning2"),
  foodAmountAfternoon: document.querySelector("#foodAmountAfternoon"),
  foodAmountAfternoon2: document.querySelector("#foodAmountAfternoon2"),
  foodAmountEvening: document.querySelector("#foodAmountEvening"),
  foodAmountEvening2: document.querySelector("#foodAmountEvening2"),
  foodReminderList: document.querySelector("#foodReminderList"),
  installAppButton: document.querySelector("#installAppButton"),
  installStatus: document.querySelector("#installStatus"),
  syncCode: document.querySelector("#syncCode"),
  pushFirebaseButton: document.querySelector("#pushFirebaseButton"),
  pullFirebaseButton: document.querySelector("#pullFirebaseButton"),
  firebaseConfig: document.querySelector("#firebaseConfig"),
  exportExcelButton: document.querySelector("#exportExcelButton"),
  importDataInput: document.querySelector("#importDataInput"),
  recoverBackupButton: document.querySelector("#recoverBackupButton"),
  backupRecoveryList: document.querySelector("#backupRecoveryList"),
  syncStatus: document.querySelector("#syncStatus"),
};

init();

function init() {
  elements.puppyName.value = state.profile.name;
  elements.adultWeight.value = state.profile.weightKg;
  const foodRecommendationChanged = refreshFoodRecommendationIfNeeded();
  if (foodRecommendationChanged) {
    persist({ skipAutoSync: true });
  }
  hydrateProfileForm();
  syncProfileWeightFromRecords();
  elements.heroPhoto.src = getLatestPhoto()?.src || defaultPhoto;
  elements.recordTime.value = new Date().toTimeString().slice(0, 5);
  updateAmountField();

  bindEvents();
  registerServiceWorker();
  initPwaInstall();
  startAlarmTimer();
  startFirebaseSyncLifecycle();
  startActiveSessionTimer();
  renderMain();
}

function bindEvents() {
  elements.profileButton.addEventListener("click", () => {
    showProfileView();
  });

  elements.statusButton.addEventListener("click", () => {
    showStatusView();
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => navigateToView(button.dataset.view));
  });

  elements.calendarPageButton.addEventListener("click", () => {
    showCalendarView();
  });

  elements.bookmarksButton.addEventListener("click", () => {
    showBookmarksView();
  });

  elements.calendarToBookmarks.addEventListener("click", () => {
    showBookmarksView();
  });

  elements.bookmarksToCalendar.addEventListener("click", () => {
    showCalendarView();
  });

  elements.homeBookmarkPreviousMonth.addEventListener("click", () => {
    homeBookmarkMonth = new Date(homeBookmarkMonth.getFullYear(), homeBookmarkMonth.getMonth() - 1, 1);
    renderHomeBookmarkSummary();
  });

  elements.homeBookmarkNextMonth.addEventListener("click", () => {
    homeBookmarkMonth = new Date(homeBookmarkMonth.getFullYear(), homeBookmarkMonth.getMonth() + 1, 1);
    renderHomeBookmarkSummary();
  });

  elements.statusSettingsButton.addEventListener("click", () => {
    showProfileView();
  });

  elements.statusYearSelect.addEventListener("input", () => {
    selectedStatusYear = Number(elements.statusYearSelect.value) || today.getFullYear();
    renderStatusView();
  });

  elements.bookmarkYearSelect.addEventListener("input", () => {
    selectedBookmarkYear = Number(elements.bookmarkYearSelect.value) || today.getFullYear();
    renderBookmarksView();
  });

  elements.calendarPagePreviousMonth.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendarView();
  });

  elements.calendarPageNextMonth.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendarView();
  });

  elements.openSelectedDayEditor.addEventListener("click", () => {
    toggleCalendarEditor();
  });

  elements.calendarEditorDate.addEventListener("input", () => {
    if (!elements.calendarEditorDate.value) {
      return;
    }
    selectedDate = elements.calendarEditorDate.value;
    const date = parseDateKey(selectedDate);
    visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    renderCalendarView();
    elements.calendarInlineEditor.hidden = false;
    hydrateCalendarEditor();
  });

  const syncCalendarStartFromMainTime = () => {
    if (timedRecordTypes.includes(activeCalendarType)) {
      elements.calendarEditorStartTime.value = elements.calendarEditorTime.value;
      syncCalendarEndFromDuration();
    }
  };
  elements.calendarEditorTime.addEventListener("input", syncCalendarStartFromMainTime);
  elements.calendarEditorTime.addEventListener("change", syncCalendarStartFromMainTime);
  elements.calendarEditorTime.addEventListener("input", updateCalendarVetReminderPreview);
  elements.calendarEditorTime.addEventListener("change", updateCalendarVetReminderPreview);
  elements.calendarVetReminderMinutes.addEventListener("input", updateCalendarVetReminderPreview);
  elements.calendarVetReminderMinutes.addEventListener("change", updateCalendarVetReminderPreview);
  elements.calendarFoodKind.addEventListener("change", syncCalendarFoodKindFields);
  elements.calendarEditorStartTime.addEventListener("input", syncCalendarDurationFromEnd);
  elements.calendarEditorStartTime.addEventListener("change", syncCalendarDurationFromEnd);
  elements.calendarEditorEndTime.addEventListener("input", syncCalendarDurationFromEnd);
  elements.calendarEditorEndTime.addEventListener("change", syncCalendarDurationFromEnd);
  elements.calendarEditorDuration.addEventListener("input", syncCalendarEndFromDuration);
  elements.calendarEditorDuration.addEventListener("change", syncCalendarEndFromDuration);
  elements.calendarSaveRecord.addEventListener("click", saveCalendarRecord);
  elements.calendarCancelEdit.addEventListener("click", clearCalendarEditMode);

  document.querySelectorAll(".calendar-type-button").forEach((button) => {
    button.addEventListener("click", () => {
      const nextType = button.dataset.type;
      if (!calendarEditingRecordId && nextType !== activeCalendarType) {
        resetCalendarEditorTimeToNow();
      }
      activeCalendarType = nextType;
      document.querySelectorAll(".calendar-type-button").forEach((item) => item.classList.toggle("selected", item === button));
      updateCalendarAmountField();
      syncCalendarFoodKindFields();
    });
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

  elements.bookmarkDay.addEventListener("click", toggleSelectedDateBookmark);
  elements.calendarBookmarkDay.addEventListener("click", toggleSelectedDateBookmark);
  elements.bookmarkNote.addEventListener("input", () => updateSelectedBookmarkNote(elements.bookmarkNote.value, elements.bookmarkNote));
  elements.calendarBookmarkNote.addEventListener("input", () =>
    updateSelectedBookmarkNote(elements.calendarBookmarkNote.value, elements.calendarBookmarkNote)
  );
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
  elements.recordTime.addEventListener("input", updateVetReminderPreview);
  elements.recordTime.addEventListener("change", updateVetReminderPreview);
  elements.vetReminderMinutes.addEventListener("input", updateVetReminderPreview);
  elements.vetReminderMinutes.addEventListener("change", updateVetReminderPreview);
  elements.foodKind.addEventListener("change", syncFoodKindFields);
  elements.recordStartTime.addEventListener("input", syncDurationFromEnd);
  elements.recordStartTime.addEventListener("change", syncDurationFromEnd);
  elements.recordEndTime.addEventListener("input", syncDurationFromEnd);
  elements.recordEndTime.addEventListener("change", syncDurationFromEnd);
  elements.recordDuration.addEventListener("input", syncEndFromDuration);
  elements.recordDuration.addEventListener("change", syncEndFromDuration);

  document.querySelectorAll(".type-button").forEach((button) => {
    button.addEventListener("click", () => {
      const nextType = button.dataset.type;
      if (!editingRecordId && nextType !== activeType) {
        resetRecordTimeToNow();
      }
      activeType = nextType;
      document.querySelectorAll(".type-button").forEach((item) => item.classList.toggle("selected", item === button));
      updateAmountField();
      syncFoodKindFields();
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

  elements.puppyName.addEventListener("change", () => {
    state.profile.name = elements.puppyName.value.trim() || "Puppy";
    state.profile.updatedAt = new Date().toISOString();
    persist();
    hydrateProfileForm();
    renderAge();
    renderInsight();
  });

  elements.adultWeight.addEventListener("change", () => {
    recordMainWeightChange();
  });

  getProfileInputs().forEach((input) => {
    input.addEventListener("change", saveProfileFormChanges);
  });

  elements.enableVaccineAlarm.addEventListener("click", () => {
    state.settings.vaccineAlarmEnabled = !state.settings.vaccineAlarmEnabled;
    state.settings.updatedAt = new Date().toISOString();
    persist();
    renderReminderSections();
    maybeRequestNotificationPermission({ allowPrompt: state.settings.vaccineAlarmEnabled });
  });

  elements.enableSchoolAlarm.addEventListener("click", () => {
    state.settings.schoolAlarmEnabled = !state.settings.schoolAlarmEnabled;
    state.settings.updatedAt = new Date().toISOString();
    persist();
    renderReminderSections();
    maybeRequestNotificationPermission({ allowPrompt: state.settings.schoolAlarmEnabled });
  });

  elements.enableFoodAlarm.addEventListener("click", () => {
    state.settings.foodAlarmEnabled = !state.settings.foodAlarmEnabled;
    state.settings.updatedAt = new Date().toISOString();
    persist();
    renderReminderSections();
    maybeRequestNotificationPermission({ allowPrompt: state.settings.foodAlarmEnabled });
  });

  elements.installAppButton.addEventListener("click", installPwa);
  elements.pushFirebaseButton.addEventListener("click", pushFirebaseSync);
  elements.pullFirebaseButton.addEventListener("click", pullFirebaseSync);
  elements.exportExcelButton.addEventListener("click", exportExcelData);
  elements.importDataInput.addEventListener("change", importData);
  elements.recoverBackupButton.addEventListener("click", recoverLatestLocalBackup);

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
  document.addEventListener("touchmove", handleTouchMove, { passive: true });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
  document.addEventListener("touchcancel", cancelPullGesture, { passive: true });
}

function navigateToView(view) {
  if (currentView === "profile" && view !== "profile") {
    saveProfileFormChanges();
  }
  if (view === "status") {
    showStatusView();
    return;
  }
  if (view === "calendar") {
    showCalendarView();
    return;
  }
  if (view === "bookmarks") {
    showBookmarksView();
    return;
  }
  if (view === "profile") {
    showProfileView();
    return;
  }
  showMainView();
}

function refreshTodayContext({ resetMainDate = false } = {}) {
  const previousToday = today;
  const previousKey = toKey(previousToday);
  const nextToday = new Date();
  const nextKey = toKey(nextToday);
  today = nextToday;

  if (previousKey === nextKey) {
    return false;
  }

  if (resetMainDate) {
    selectedDate = nextKey;
    visibleMonth = new Date(nextToday.getFullYear(), nextToday.getMonth(), 1);
    homeBookmarkMonth = new Date(nextToday.getFullYear(), nextToday.getMonth(), 1);
  }

  if (selectedStatusYear === previousToday.getFullYear()) {
    selectedStatusYear = nextToday.getFullYear();
  }
  if (selectedBookmarkYear === previousToday.getFullYear()) {
    selectedBookmarkYear = nextToday.getFullYear();
  }

  return true;
}

function refreshAppForCurrentDay({ resetMainDate = currentView === "main" } = {}) {
  const dayChanged = refreshTodayContext({ resetMainDate });
  const foodRecommendationChanged = refreshFoodRecommendationIfNeeded();
  if (foodRecommendationChanged) {
    persist({ skipAutoSync: true });
  }
  if (dayChanged || foodRecommendationChanged) {
    refreshCurrentView();
  }
  return dayChanged;
}

function renderMain() {
  refreshTodayContext({ resetMainDate: true });
  currentView = "main";
  elements.mainView.hidden = false;
  elements.dayView.hidden = true;
  elements.calendarView.hidden = true;
  elements.bookmarksView.hidden = true;
  elements.profileView.hidden = true;
  elements.statusView.hidden = true;
  elements.currentMonth.textContent = formatLongDate(today);
  renderAge();
  renderInsight();
  renderQuickLogButtons();
  renderCategory();
  renderHomeMonthlyAverage();
  renderHomeBookmarkSummary();
  elements.heroPhoto.src = getLatestPhoto()?.src || defaultPhoto;
}

function renderDayView() {
  elements.selectedDateLabel.textContent = formatSelectedDate(selectedDate);
  elements.dayDateInput.value = selectedDate;
  elements.recordTime.value = elements.recordTime.value || new Date().toTimeString().slice(0, 5);
  syncDurationVisibility();
  renderBookmarkButton();
  renderRecords();
}

function showDayView(dateKey) {
  showCalendarView(dateKey);
  elements.calendarInlineEditor.hidden = false;
  hydrateCalendarEditor();
}

function showMainView() {
  currentView = "main";
  elements.mainView.hidden = false;
  elements.dayView.hidden = true;
  elements.calendarView.hidden = true;
  elements.bookmarksView.hidden = true;
  elements.profileView.hidden = true;
  elements.statusView.hidden = true;
  renderMain();
}

function showCalendarView(dateKey = selectedDate) {
  currentView = "calendar";
  selectedDate = dateKey;
  const date = parseDateKey(dateKey);
  visibleMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  elements.mainView.hidden = true;
  elements.dayView.hidden = true;
  elements.calendarView.hidden = false;
  elements.bookmarksView.hidden = true;
  elements.profileView.hidden = true;
  elements.statusView.hidden = true;
  renderCalendarView();
}

function showBookmarksView() {
  currentView = "bookmarks";
  elements.mainView.hidden = true;
  elements.dayView.hidden = true;
  elements.calendarView.hidden = true;
  elements.bookmarksView.hidden = false;
  elements.profileView.hidden = true;
  elements.statusView.hidden = true;
  renderBookmarksView();
}

function showProfileView() {
  currentView = "profile";
  elements.mainView.hidden = true;
  elements.dayView.hidden = true;
  elements.calendarView.hidden = true;
  elements.bookmarksView.hidden = true;
  elements.profileView.hidden = false;
  elements.statusView.hidden = true;
  hydrateProfileForm();
  renderReminderSections();
}

function showStatusView() {
  currentView = "status";
  elements.mainView.hidden = true;
  elements.dayView.hidden = true;
  elements.calendarView.hidden = true;
  elements.bookmarksView.hidden = true;
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
  state.profile.updatedAt = new Date().toISOString();
  hydrateProfileForm();
  renderInsight();
  renderCategory();
  persist();
}

function renderCalendarView() {
  refreshTodayContext();
  elements.calendarPageTitle.textContent = visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  elements.calendarSelectedDateLabel.textContent = formatSelectedDate(selectedDate);
  elements.calendarPageGrid.innerHTML = "";

  getCalendarDates().forEach((day) => {
    const key = toKey(day);
    const records = state.records[key] || [];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "day-cell";
    button.classList.toggle("muted", day.getMonth() !== visibleMonth.getMonth());
    button.classList.toggle("today", key === toKey(today));
    button.classList.toggle("selected", key === selectedDate);
    button.classList.toggle("bookmarked", isDateBookmarked(key));
    button.innerHTML = `
      <span class="day-number">${day.getDate()}</span>
      ${isDateBookmarked(key) ? '<span class="day-star" aria-label="Bookmarked day">★</span>' : ""}
      <span class="dot-row">${records.slice(0, 3).map(() => '<span class="dot"></span>').join("")}</span>
    `;
    button.addEventListener("click", () => {
      selectedDate = key;
      renderCalendarView();
    });
    elements.calendarPageGrid.appendChild(button);
  });

  renderCalendarSelectedRecords();
}

function renderCalendarSelectedRecords() {
  const records = [...(state.records[selectedDate] || [])].sort((a, b) => a.time.localeCompare(b.time));
  elements.calendarRecordCount.textContent = records.length;
  elements.calendarDaySummary.innerHTML = renderSelectedDayTotalSummary(selectedDate);
  elements.calendarEditorDate.value = selectedDate;
  renderBookmarkButton();
  elements.calendarRecordList.innerHTML = "";

  if (!records.length) {
    elements.calendarRecordList.innerHTML = `<p class="empty-state">No records for this day yet.</p>`;
    return;
  }

  records.forEach((record) => {
    const item = createRecordListItem(record, selectedDate);
    item.addEventListener("click", (event) => {
      if (event.target.closest("button")) {
        return;
      }
      startCalendarEditRecord(record);
    });
    elements.calendarRecordList.appendChild(item);
  });
}

function toggleCalendarEditor() {
  elements.calendarInlineEditor.hidden = !elements.calendarInlineEditor.hidden;
  if (!elements.calendarInlineEditor.hidden) {
    hydrateCalendarEditor();
  }
}

function hydrateCalendarEditor() {
  elements.calendarEditorDate.value = selectedDate;
  elements.calendarEditorTime.value = elements.calendarEditorTime.value || new Date().toTimeString().slice(0, 5);
  elements.calendarEditorStartTime.value = elements.calendarEditorStartTime.value || elements.calendarEditorTime.value;
  document.querySelectorAll(".calendar-type-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.type === activeCalendarType);
  });
  updateCalendarAmountField();
}

function updateCalendarAmountField() {
  const config = typeConfig[activeCalendarType];
  elements.calendarAmountField.childNodes[0].nodeValue = `${config.amount} `;
  elements.calendarEditorAmount.placeholder = config.placeholder;
  elements.calendarAmountField.hidden = activeCalendarType === "vaccine";
  elements.calendarFoodKindField.hidden = activeCalendarType !== "food";
  elements.calendarVetKindField.hidden = activeCalendarType !== "vaccine";
  elements.calendarVetReminderField.hidden = activeCalendarType !== "vaccine";
  updateCalendarVetReminderPreview();
  syncCalendarFoodKindFields();
  syncCalendarAccidentFieldVisibility();
  syncCalendarDurationVisibility();
}

function syncCalendarAccidentFieldVisibility() {
  const show = ["pee", "poop"].includes(activeCalendarType);
  elements.calendarAccidentField.hidden = !show;
  if (!show) {
    elements.calendarRecordAccident.checked = false;
  }
}

function syncCalendarDurationVisibility() {
  const timed = timedRecordTypes.includes(activeCalendarType);
  elements.calendarDurationFields.hidden = !timed;
  if (timed && !elements.calendarEditorStartTime.value) {
    elements.calendarEditorStartTime.value = elements.calendarEditorTime.value || new Date().toTimeString().slice(0, 5);
  }
}

function syncCalendarDurationFromEnd() {
  if (!timedRecordTypes.includes(activeCalendarType)) {
    return;
  }
  const start = elements.calendarEditorStartTime.value || elements.calendarEditorTime.value;
  const end = elements.calendarEditorEndTime.value;
  if (start && end) {
    elements.calendarEditorDuration.value = durationFromTimes(start, end);
  }
}

function syncCalendarEndFromDuration() {
  if (!timedRecordTypes.includes(activeCalendarType)) {
    return;
  }
  const start = elements.calendarEditorStartTime.value || elements.calendarEditorTime.value;
  const duration = Number(elements.calendarEditorDuration.value);
  if (start && Number.isFinite(duration) && duration > 0) {
    elements.calendarEditorEndTime.value = addMinutesToTime(start, duration);
  }
}

function saveCalendarRecord() {
  if (calendarEditingRecordId) {
    updateCalendarEditedRecord();
    return;
  }

  const record = buildCalendarRecordFromForm(createId());
  state.records[selectedDate] = [...(state.records[selectedDate] || []), record];
  applyWeightRecordToProfile(record);
  if (record.type === "vaccine") {
    maybeRequestNotificationPermission({ allowPrompt: true });
  }
  clearCalendarFormAfterSave();
  persist();
  renderCalendarView();
  renderCategory();
}

function buildCalendarRecordFromForm(id) {
  const record = {
    id,
    type: activeCalendarType,
    time: elements.calendarEditorTime.value || elements.calendarEditorStartTime.value || new Date().toTimeString().slice(0, 5),
    amount: elements.calendarEditorAmount.value.trim(),
    note: elements.calendarEditorNote.value.trim(),
  };

  if (activeCalendarType === "vaccine") {
    record.amount = elements.calendarVetKind.value || "Visit";
    record.reminderMinutes = getSelectedReminderMinutes(elements.calendarVetReminderMinutes);
  }
  if (activeCalendarType === "food") {
    record.foodKind = elements.calendarFoodKind.value || "food";
    record.snackName = record.foodKind === "snack" && !elements.calendarSnackName.disabled ? elements.calendarSnackName.value || "" : "";
    if (record.foodKind === "snack") {
      record.note = "";
    }
  }
  if (["pee", "poop"].includes(activeCalendarType)) {
    record.accident = elements.calendarRecordAccident.checked;
  }

  if (timedRecordTypes.includes(activeCalendarType)) {
    const startTime = elements.calendarEditorStartTime.value || record.time;
    const durationMinutes = Math.max(1, durationFromTimes(startTime, elements.calendarEditorEndTime.value) || Number(elements.calendarEditorDuration.value) || parseDurationMinutes(record.amount) || 1);
    const endTime = elements.calendarEditorEndTime.value || addMinutesToTime(startTime, durationMinutes);
    record.time = startTime;
    record.startTime = startTime;
    record.endTime = endTime;
    record.durationMinutes = durationMinutes;
    record.amount = `${durationMinutes} min`;
    record.note = "";
  }

  return record;
}

function startCalendarEditRecord(record) {
  calendarEditingRecordId = record.id;
  activeCalendarType = record.type;
  elements.calendarInlineEditor.hidden = false;
  elements.calendarEditorDate.value = selectedDate;
  elements.calendarEditorTime.value = record.time;
  elements.calendarEditorStartTime.value = record.startTime || record.time;
  elements.calendarEditorEndTime.value = record.endTime || "";
  elements.calendarEditorDuration.value = record.durationMinutes || parseDurationMinutes(record.amount) || "";
  elements.calendarEditorAmount.value = record.amount || "";
  elements.calendarFoodKind.value = getFoodKind(record);
  populateSnackSelect(elements.calendarSnackName, getSnackName(record));
  elements.calendarVetKind.value = getVetKind(record);
  elements.calendarVetReminderMinutes.value = String(getVetReminderMinutes(record));
  elements.calendarRecordAccident.checked = Boolean(record.accident);
  elements.calendarEditorNote.value = record.note || "";
  document.querySelectorAll(".calendar-type-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.type === activeCalendarType);
  });
  updateCalendarAmountField();
  syncCalendarFoodKindFields();
  elements.calendarSaveRecord.textContent = "Update";
  elements.calendarCancelEdit.hidden = false;
  elements.calendarEditorAmount.focus();
}

function updateCalendarEditedRecord() {
  const records = state.records[selectedDate] || [];
  const record = records.find((entry) => entry.id === calendarEditingRecordId);
  if (!record) {
    clearCalendarEditMode();
    return;
  }

  Object.assign(record, buildCalendarRecordFromForm(record.id));
  applyWeightRecordToProfile(record);
  syncProfileWeightFromRecords();
  if (record.type === "vaccine") {
    maybeRequestNotificationPermission({ allowPrompt: true });
  }
  persist();
  clearCalendarEditMode();
  renderCalendarView();
  renderCategory();
}

function clearCalendarFormAfterSave() {
  elements.calendarEditorAmount.value = "";
  elements.calendarFoodKind.value = "food";
  populateSnackSelect(elements.calendarSnackName);
  elements.calendarVetKind.value = "Visit";
  elements.calendarVetReminderMinutes.value = "60";
  elements.calendarRecordAccident.checked = false;
  elements.calendarEditorNote.value = "";
  syncCalendarFoodKindFields();
  resetCalendarEditorTimeToNow();
}

function clearCalendarEditMode() {
  calendarEditingRecordId = null;
  clearCalendarFormAfterSave();
  elements.calendarSaveRecord.textContent = "Save";
  elements.calendarCancelEdit.hidden = true;
  syncCalendarDurationVisibility();
}

function applyWeightRecordToProfile(record) {
  if (record.type !== "weight") {
    return;
  }
  const parsedWeight = parseWeight(record.amount);
  if (Number.isFinite(parsedWeight)) {
    state.profile.weightKg = parsedWeight;
    hydrateMainProfile();
    hydrateProfileForm();
  }
}

function renderSelectedDayTotalSummary(dateKey) {
  const records = state.records[dateKey] || [];
  const durationFor = (type) => records.filter((record) => record.type === type).reduce((total, record) => total + getRecordDuration(record), 0);
  const countFor = (type) => records.filter((record) => record.type === type).length;
  const sleepMinutes = durationFor("sleep");
  const playMinutes = durationFor("play");
  const walkMinutes = durationFor("walk");
  const trainMinutes = durationFor("train");
  const boxMinutes = durationFor("box");
  const peeCount = countFor("pee");
  const poopCount = countFor("poop");
  const foodProgress = formatFoodProgress(records, dateKey);
  const waterMl = sumAmount(records.filter((record) => record.type === "water"), "ml");

  const noteText = buildSelectedDayNoteSummary(records);
  const valueOrBlank = (value) => value || "";
  const durationOrBlank = (minutes) => (minutes ? formatDuration(minutes) : "");
  const parts = [
    ["Sleep", durationOrBlank(sleepMinutes)],
    ["Play", durationOrBlank(playMinutes)],
    ["Walk", durationOrBlank(walkMinutes)],
    ["Train", durationOrBlank(trainMinutes)],
    ["Box", durationOrBlank(boxMinutes)],
    ["Pee", peeCount ? `${peeCount} times (avg. interval: ${formatAverageInterval(records, "pee")})` : ""],
    ["Poop", poopCount ? `${poopCount} times (avg. interval: ${formatAverageInterval(records, "poop")})` : ""],
    ["Food", valueOrBlank(foodProgress)],
    ["Water", valueOrBlank(waterMl ? `${countFor("water")} times, ${waterMl}mL` : "")],
    ["Notes", noteText],
  ];

  return parts
    .map(
      ([label, value]) => `
        <article class="day-total-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </article>
      `
    )
    .join("");
}

function buildSelectedDayNoteSummary(records) {
  const noteTypes = ["note", "shower", "tooth", "vaccine", "school"];
  const noteItems = records
    .filter((record) => noteTypes.includes(record.type))
    .map((record) => {
      const label = typeConfig[record.type]?.label || record.type;
      const detail = [record.amount, record.note].filter(Boolean).join(" - ");
      return detail ? `${label}: ${detail}` : label;
    });
  const accidentItems = records.filter(isAccidentRecord).map((record) => {
    const label = typeConfig[record.type]?.label || record.type;
    const detail = [formatTime(record.time), record.amount, record.note].filter(Boolean).join(" - ");
    return detail ? `Accident: ${label} - ${detail}` : `Accident: ${label}`;
  });
  return [...noteItems, ...accidentItems]
    .join("; ");
}

function getVetKind(record) {
  const amount = String(record?.amount || "").trim();
  if (/^visit$/i.test(amount)) {
    return "Visit";
  }
  if (/regular|visit|check|clinic|vet/i.test(amount)) {
    return "Regular visit";
  }
  return "Vaccine";
}

function getFoodKind(record) {
  const kind = String(record?.foodKind || "").toLowerCase();
  if (kind === "snack") {
    return "snack";
  }
  if (record?.snackName) {
    return "snack";
  }
  if (/snack/i.test(record?.note || "")) {
    return "snack";
  }
  return "food";
}

function getFoodKindLabel(record) {
  return getFoodKind(record) === "snack" ? "Snack" : "Food";
}

function getSnackName(record) {
  return getFoodKind(record) === "snack" ? record?.snackName || record?.note || "Snack" : "";
}

function normalizeProductName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(josera|dry|dog|puppy|food|kibble|current|type)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactProductName(value) {
  return normalizeProductName(value).replace(/\s+/g, "");
}

function productNameMatches(left, right) {
  const a = compactProductName(left);
  const b = compactProductName(right);
  return Boolean(a && b && (a === b || (a.length >= 4 && b.includes(a)) || (b.length >= 4 && a.includes(b))));
}

function getJoseraProductConfig(foodType = state.foodSettings?.type) {
  const source = foodType || state.foodSettings?.type || "";
  const match = joseraProducts.find((product) =>
    [product.key, product.label, ...(product.aliases || [])].some((candidate) => productNameMatches(source, candidate))
  );
  return match || joseraProducts[0];
}

function snackMatchesCurrentFood(record) {
  if (getFoodKind(record) !== "snack") {
    return false;
  }
  const snack = getSnackName(record);
  const product = getJoseraProductConfig();
  return [state.foodSettings?.type, state.foodSettings?.type2, product.label, ...(product.aliases || [])].some((candidate) =>
    productNameMatches(snack, candidate)
  );
}

function getVetReminderMinutes(record) {
  const minutes = Number(record?.reminderMinutes);
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : 60;
}

function getSelectedReminderMinutes(select) {
  const minutes = Number(select?.value);
  return Number.isFinite(minutes) && minutes >= 0 ? Math.round(minutes) : 60;
}

function getVetVisitDate(dateKey, record) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return null;
  }
  const [hours, minutes] = parseTimeParts(record?.time || "09:00");
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getVetReminderDate(dateKey, record) {
  const visitDate = getVetVisitDate(dateKey, record);
  if (!visitDate) {
    return null;
  }
  return new Date(visitDate.getTime() - getVetReminderMinutes(record) * 60000);
}

function formatVetReminderText(dateKey, record) {
  const reminderDate = getVetReminderDate(dateKey, record);
  if (!reminderDate) {
    return "";
  }
  return `Reminder ${formatReminderLead(getVetReminderMinutes(record))}: ${formatDateKey(toKey(reminderDate))} ${formatTime(reminderDate.toTimeString().slice(0, 5))}`;
}

function formatReminderLead(minutes) {
  if (!minutes) {
    return "at visit time";
  }
  if (minutes < 60) {
    return `${minutes} min before`;
  }
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} day${days === 1 ? "" : "s"} before`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hr before`;
  }
  return `${minutes} min before`;
}

function updateVetReminderPreview() {
  if (!elements.vetReminderPreview) {
    return;
  }
  if (activeType !== "vaccine") {
    elements.vetReminderPreview.textContent = "";
    return;
  }
  const reminderText = formatVetReminderText(selectedDate, {
    time: elements.recordTime.value || "09:00",
    reminderMinutes: getSelectedReminderMinutes(elements.vetReminderMinutes),
  });
  elements.vetReminderPreview.textContent = reminderText;
}

function updateCalendarVetReminderPreview() {
  if (!elements.calendarVetReminderPreview) {
    return;
  }
  if (activeCalendarType !== "vaccine") {
    elements.calendarVetReminderPreview.textContent = "";
    return;
  }
  const dateKey = elements.calendarEditorDate.value || selectedDate;
  const reminderText = formatVetReminderText(dateKey, {
    time: elements.calendarEditorTime.value || "09:00",
    reminderMinutes: getSelectedReminderMinutes(elements.calendarVetReminderMinutes),
  });
  elements.calendarVetReminderPreview.textContent = reminderText;
}

function renderBookmarksView() {
  const years = getAvailableBookmarkYears();
  if (!years.includes(selectedBookmarkYear)) {
    selectedBookmarkYear = years[0] || today.getFullYear();
  }
  elements.bookmarkYearSelect.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  elements.bookmarkYearSelect.value = String(selectedBookmarkYear);
  elements.bookmarkYearTitle.textContent = `Bookmarked Days in ${selectedBookmarkYear}`;

  const bookmarkedDates = getBookmarkedDates().filter((dateKey) => Number(dateKey.slice(0, 4)) === selectedBookmarkYear);

  elements.bookmarkCount.textContent = bookmarkedDates.length;
  elements.bookmarkList.innerHTML = "";

  if (!bookmarkedDates.length) {
    elements.bookmarkList.innerHTML = `<p class="empty-state">No bookmarked days in ${selectedBookmarkYear}.</p>`;
    return;
  }

  bookmarkedDates.forEach((dateKey) => {
    const records = state.records[dateKey] || [];
    const bookmarkNote = getBookmarkNote(dateKey);
    const meta = bookmarkNote ? `${records.length} records - ${bookmarkNote}` : `${records.length} records`;
    const item = document.createElement("article");
    item.className = "bookmark-item";
    item.innerHTML = `
      <button class="bookmark-main" type="button">
        <span class="bookmark-star" aria-hidden="true">★</span>
        <span>
          <strong>${escapeHtml(formatDateKey(dateKey))}</strong>
          <small>${escapeHtml(meta)}</small>
        </span>
      </button>
      <button class="quiet-button bookmark-edit" type="button">Edit</button>
    `;
    item.querySelector(".bookmark-main").addEventListener("click", () => showCalendarView(dateKey));
    item.querySelector(".bookmark-edit").addEventListener("click", () => showDayView(dateKey));
    elements.bookmarkList.appendChild(item);
  });
}

function renderHomeBookmarkSummary() {
  const monthLabel = homeBookmarkMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  const bookmarkedDates = getBookmarkedDates().filter((dateKey) => {
    const date = parseDateKey(dateKey);
    return date && date.getFullYear() === homeBookmarkMonth.getFullYear() && date.getMonth() === homeBookmarkMonth.getMonth();
  });
  elements.homeBookmarkTitle.textContent = `Bookmarked Days in ${monthLabel}`;
  elements.homeBookmarkCount.textContent = bookmarkedDates.length;
  elements.homeBookmarkSummary.innerHTML = "";

  if (!bookmarkedDates.length) {
    elements.homeBookmarkSummary.innerHTML = `<p class="empty-state">No bookmarked days in ${escapeHtml(monthLabel)}.</p>`;
    return;
  }

  bookmarkedDates.forEach((dateKey) => {
    const records = state.records[dateKey] || [];
    const bookmarkNote = getBookmarkNote(dateKey);
    const meta = bookmarkNote ? `${records.length} records - ${bookmarkNote}` : `${records.length} records`;
    const item = document.createElement("button");
    item.className = "home-bookmark-item";
    item.type = "button";
    item.innerHTML = `
      <span aria-hidden="true">★</span>
      <strong>${escapeHtml(formatDateKey(dateKey))}</strong>
      <small>${escapeHtml(meta)}</small>
    `;
    item.addEventListener("click", () => showCalendarView(dateKey));
    elements.homeBookmarkSummary.appendChild(item);
  });
}

function renderHomeMonthlyAverage() {
  const monthLabel = today.toLocaleDateString("en", { month: "long", year: "numeric" });
  const start = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const end = toKey(today);
  const stats = calculateStatsForRange(maxDateKey(start, analyticsStartKey), end);
  elements.homeMonthlyAverageTitle.textContent = `Monthly Average in ${monthLabel}`;
  elements.homeMonthlyAverage.innerHTML = `
    <article><span>Pee</span><strong>${escapeHtml(stats.peeText)}</strong></article>
    <article><span>Poop</span><strong>${escapeHtml(stats.poopText)}</strong></article>
    <article><span>Accident</span><strong>${escapeHtml(stats.accidentText)}</strong></article>
    <article><span>Pee Interval</span><strong>${escapeHtml(stats.peeInterval)}</strong></article>
    <article><span>Poop Interval</span><strong>${escapeHtml(stats.poopInterval)}</strong></article>
    <article><span>Sleep</span><strong>${escapeHtml(stats.sleepPerDay)}/day</strong></article>
    <article><span>Walk</span><strong>${escapeHtml(stats.walkPerDay)}/day</strong></article>
    <article><span>Box</span><strong>${escapeHtml(stats.boxPerDay)}/day</strong></article>
    <article><span>Weight</span><strong>${escapeHtml(stats.weightText)}</strong></article>
  `;
}

function getBookmarkedDates() {
  return Object.entries(state.bookmarks || {})
    .filter(([, value]) => value?.bookmarked)
    .map(([date]) => date)
    .sort((a, b) => b.localeCompare(a));
}

function getAvailableBookmarkYears() {
  const years = new Set([today.getFullYear()]);
  getBookmarkedDates().forEach((dateKey) => {
    const year = Number(dateKey.slice(0, 4));
    if (year) {
      years.add(year);
    }
  });
  return Array.from(years).sort((a, b) => b - a);
}

function createRecordListItem(record, dateKey) {
  const config = typeConfig[record.type] || typeConfig.note;
  const meta = getRecordListMeta(record, dateKey);
  const item = document.createElement("article");
  item.className = "record-item";
  item.innerHTML = `
    <span class="record-icon" style="background:${config.color}">${config.icon}</span>
    <div>
      <p class="record-title">${config.label} - ${escapeHtml(formatTime(record.time))}</p>
      ${meta ? `<p class="record-meta">${escapeHtml(meta)}</p>` : ""}
    </div>
    <button class="delete-button" type="button" aria-label="Delete record">x</button>
  `;
  item.querySelector("button").addEventListener("click", () => {
    deleteRecord(dateKey, record.id);
  });
  return item;
}

function getRecordListMeta(record, dateKey = "") {
  if (timedRecordTypes.includes(record.type)) {
    return [formatDurationHoursMinutes(getRecordDuration(record)), formatTimeRange(record)].filter(Boolean).join(" - ");
  }
  if (record.type === "vaccine") {
    return [record.amount || "Visit", record.note, formatVetReminderText(dateKey, record)].filter(Boolean).join(" - ");
  }
  if (record.type === "food") {
    const detail = getFoodKind(record) === "snack" ? [getSnackName(record), snackMatchesCurrentFood(record) ? "same as current food" : ""].filter(Boolean).join(" - ") : record.note;
    return [getFoodKindLabel(record), record.amount, detail].filter(Boolean).join(" - ");
  }
  if (["pee", "poop"].includes(record.type)) {
    return [record.accident ? "Accident" : "", record.amount, record.note].filter(Boolean).join(" - ");
  }
  return [record.amount, record.note].filter(Boolean).join(" - ");
}

function formatTimeRange(record) {
  const start = record.startTime || record.time;
  const end = record.endTime;
  return [start ? formatTime(start) : "", end ? formatTime(end) : ""].filter(Boolean).join(" - ");
}

function renderBookmarkButton() {
  const bookmarked = isDateBookmarked(selectedDate);
  const note = getBookmarkNote(selectedDate);
  elements.bookmarkDay.classList.toggle("active", bookmarked);
  elements.bookmarkDay.setAttribute("aria-pressed", String(bookmarked));
  elements.bookmarkDay.textContent = bookmarked ? "Starred" : "Star";
  elements.calendarBookmarkDay.classList.toggle("active", bookmarked);
  elements.calendarBookmarkDay.setAttribute("aria-pressed", String(bookmarked));
  elements.calendarBookmarkDay.textContent = bookmarked ? "Starred" : "Star";
  renderBookmarkNoteFields(bookmarked, note);
}

function toggleSelectedDateBookmark() {
  const current = state.bookmarks[selectedDate];
  state.bookmarks[selectedDate] = {
    bookmarked: !current?.bookmarked,
    note: current?.note || "",
    updatedAt: new Date().toISOString(),
  };
  persist();
  renderBookmarkButton();
  if (currentView === "calendar") {
    renderCalendarView();
  }
  if (currentView === "bookmarks") {
    renderBookmarksView();
  }
  renderHomeBookmarkSummary();
}

function isDateBookmarked(dateKey) {
  return Boolean(state.bookmarks?.[dateKey]?.bookmarked);
}

function getBookmarkNote(dateKey) {
  return state.bookmarks?.[dateKey]?.note || "";
}

function renderBookmarkNoteFields(bookmarked, note) {
  [elements.bookmarkNoteField, elements.calendarBookmarkNoteField].forEach((field) => {
    field.hidden = !bookmarked;
  });
  elements.bookmarkNote.value = note;
  elements.calendarBookmarkNote.value = note;
}

function updateSelectedBookmarkNote(value, sourceInput) {
  const current = state.bookmarks[selectedDate];
  if (!current?.bookmarked) {
    return;
  }
  state.bookmarks[selectedDate] = {
    ...current,
    bookmarked: true,
    note: value,
    updatedAt: new Date().toISOString(),
  };
  [elements.bookmarkNote, elements.calendarBookmarkNote].forEach((input) => {
    if (input !== sourceInput) {
      input.value = value;
    }
  });
  persist();
  renderHomeBookmarkSummary();
  if (currentView === "bookmarks") {
    renderBookmarksView();
  }
}

function renderRecords() {
  const records = [...(state.records[selectedDate] || [])].sort((a, b) => a.time.localeCompare(b.time));
  elements.dayRecordCount.textContent = records.length;
  elements.recordList.innerHTML = "";

  if (!records.length) {
    elements.recordList.innerHTML = `<p class="empty-state">No records yet. Add walks, meals, potty breaks, weight, or vet visits for this day.</p>`;
    return;
  }

  records.forEach((record) => {
    const item = createRecordListItem(record, selectedDate);
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
  if (currentView === "calendar") {
    renderCalendarView();
  }
  if (currentView === "bookmarks") {
    renderBookmarksView();
  }
  renderCategory();
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
  updateFoodEstimateDisplay();
}

function renderQuickLogButtons() {
  document.querySelectorAll(".quick-log-button").forEach((button) => {
    const session = getActiveSession(button.dataset.action);
    button.classList.toggle("active", Boolean(session));
    if (timedQuickTypes.includes(button.dataset.action)) {
      const label = typeConfig[button.dataset.action].label;
      button.textContent = session ? `Stop ${label} ${getElapsedSessionText(session)}` : label;
    }
  });
  const sessions = Object.entries(state.activeSessions || {})
    .map(([type, value]) => [type, normalizeActiveSession(type, value)])
    .filter(([, session]) => session?.start);
  elements.activeSessionCount.textContent = sessions.length;
  elements.activeSessionTimers.innerHTML = sessions
    .map(
      ([type, session]) => `
        <span>${escapeHtml(typeConfig[type]?.label || type)} ${escapeHtml(getElapsedSessionText(session))}</span>
      `
    )
    .join("");
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

  addQuickRecord(type, "", "");
}

function addQuickRecord(type, amount, note, time = new Date(), extra = {}) {
  const dateKey = toKey(time);
  const durationMinutes = timedRecordTypes.includes(type) ? parseDurationMinutes(amount) : 0;
  const record = {
    id: createId(),
    type,
    time: time.toTimeString().slice(0, 5),
    amount,
    note,
    ...extra,
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
  elements.quickLogStatus.textContent = `${typeConfig[type].label} saved.`;
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
  state.stoppedSessionIds = Array.from(new Set([...(state.stoppedSessionIds || []), existing.id]));
  delete state.activeSessions[type];
  renderQuickLogButtons();
  addQuickRecord(type, amount, "", start);
  elements.quickLogStatus.textContent = `${typeConfig[type].label} ended. ${amount} saved.`;
}

function getActiveSession(type) {
  return normalizeActiveSession(type, state.activeSessions?.[type]);
}

function startActiveSessionTimer() {
  window.clearInterval(activeTimerInterval);
  activeTimerInterval = window.setInterval(() => {
    if (currentView === "main" && Object.keys(state.activeSessions || {}).length) {
      renderQuickLogButtons();
    }
  }, 1000);
}

function getElapsedSessionText(session) {
  const start = new Date(session.start);
  if (!Number.isFinite(start.getTime())) {
    return "0:00";
  }
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  if (hours) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function recordFoodNow() {
  const meal = getCurrentMealSetting();
  const components = [
    { name: state.foodSettings.type || "Food 1", amount: meal.amount || "" },
    { name: state.foodSettings.type2 || "Food 2", amount: meal.amount2 || "" },
  ].filter((component) => component.amount);
  const totalGrams = components.reduce((total, component) => total + parseAmountForUnit(component.amount, "g"), 0);
  const amount = totalGrams > 0 ? `${formatFoodGrams(totalGrams)}g` : components.map((component) => component.amount).join(" + ") || "Food";
  const mixture = components.map((component) => `${component.amount} ${component.name}`.trim()).join(" + ");
  const note = [mixture, meal.label].filter(Boolean).join(" - ");
  addQuickRecord("food", amount, note || "Food", new Date(), { foodKind: "food", foodComponents: components });
}

function getCurrentMealSetting() {
  const now = new Date();
  const options = [
    {
      key: "morning",
      label: "Morning",
      time: state.foodTimes.morning,
      amount: state.foodSettings.amounts.morning,
      amount2: state.foodSettings.secondAmounts.morning,
    },
    {
      key: "afternoon",
      label: "Afternoon",
      time: state.foodTimes.afternoon,
      amount: state.foodSettings.amounts.afternoon,
      amount2: state.foodSettings.secondAmounts.afternoon,
    },
    {
      key: "evening",
      label: "Evening",
      time: state.foodTimes.evening,
      amount: state.foodSettings.amounts.evening,
      amount2: state.foodSettings.secondAmounts.evening,
    },
  ].filter((item) => item.time);

  if (!options.length) {
    return { label: "Food", amount: "" };
  }

  return options
    .map((item) => ({ ...item, distance: Math.abs(minutesOfDay(item.time) - (now.getHours() * 60 + now.getMinutes())) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function formatFoodGrams(value) {
  return Number.isInteger(value) ? String(value) : Number(value.toFixed(1)).toString();
}

function getFoodComponents(record) {
  return Array.isArray(record?.foodComponents)
    ? record.foodComponents
        .map((component) => ({ name: String(component?.name || "").trim(), amount: String(component?.amount || "").trim() }))
        .filter((component) => component.name || component.amount)
        .slice(0, 2)
    : [];
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
  return formatDurationHoursMinutes(total);
}

function formatDurationClock(minutes) {
  const totalSeconds = Math.max(0, Math.round((minutes || 0) * 60));
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(mins).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDurationHoursMinutes(minutes) {
  const total = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${String(hours).padStart(2, "0")}hr ${String(mins).padStart(2, "0")}min`;
}

function renderCategory() {
  if (activeCategory === "accident") {
    activeCategory = "potty";
    document.querySelectorAll(".category-tab").forEach((button) => {
      button.classList.toggle("selected", button.dataset.category === activeCategory);
    });
  }

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
    const range = ["accident", "vaccine"].includes(activeCategory) ? "yet" : "today";
    elements.categoryList.innerHTML = `<p class="empty-state">No ${category.label.toLowerCase()} records ${range}.</p>`;
    return;
  }

  records.forEach((entry) => {
    const item = document.createElement("article");
    item.className = "category-item";
    const detail = getCategoryDetail(entry, activeCategory);
    item.innerHTML = `
      <div class="category-date">${escapeHtml(getCategoryTimeLabel(entry))}</div>
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
  showCalendarView(entry.date);
  const record = (state.records[entry.date] || []).find((item) => item.id === entry.id);
  if (record) {
    startCalendarEditRecord(record);
  }
}

function getCategoryTimeLabel(record) {
  if (timedRecordTypes.includes(record.type)) {
    return formatTimeRange(record) || formatTime(record.time);
  }
  return formatTime(record.time);
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
        showCalendarView(date);
        startCalendarEditRecord(record);
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
  if (record.type === "vaccine") {
    maybeRequestNotificationPermission({ allowPrompt: true });
  }
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
  if (activeType === "vaccine") {
    record.amount = elements.vetKind.value || "Visit";
    record.reminderMinutes = getSelectedReminderMinutes(elements.vetReminderMinutes);
  }
  if (activeType === "food") {
    record.foodKind = elements.foodKind.value || "food";
    record.snackName = record.foodKind === "snack" && !elements.snackName.disabled ? elements.snackName.value || "" : "";
    if (record.foodKind === "snack") {
      record.note = "";
    }
  }
  if (["pee", "poop"].includes(activeType)) {
    record.accident = elements.recordAccident.checked;
  }
  if (timedRecordTypes.includes(activeType)) {
    const startTime = elements.recordStartTime.value || record.time;
    const durationMinutes = Math.max(1, durationFromTimes(startTime, elements.recordEndTime.value) || Number(elements.recordDuration.value) || parseDurationMinutes(record.amount) || 1);
    const endTime = elements.recordEndTime.value || addMinutesToTime(startTime, durationMinutes);
    record.time = startTime;
    record.startTime = startTime;
    record.endTime = endTime;
    record.durationMinutes = durationMinutes;
    record.amount = `${durationMinutes} min`;
    record.note = "";
  }

  return record;
}

function clearFormAfterSave() {
  elements.recordAmount.value = "";
  elements.foodKind.value = "food";
  populateSnackSelect(elements.snackName);
  elements.vetKind.value = "Visit";
  elements.vetReminderMinutes.value = "60";
  elements.recordAccident.checked = false;
  elements.recordNote.value = "";
  syncFoodKindFields();
  resetRecordTimeToNow();
}

function startEditRecord(record) {
  editingRecordId = record.id;
  activeType = record.type;
  elements.recordTime.value = record.time;
  elements.recordStartTime.value = record.startTime || record.time;
  elements.recordEndTime.value = record.endTime || "";
  elements.recordDuration.value = record.durationMinutes || parseDurationMinutes(record.amount) || "";
  elements.recordAmount.value = record.amount || "";
  elements.foodKind.value = getFoodKind(record);
  populateSnackSelect(elements.snackName, getSnackName(record));
  elements.vetKind.value = getVetKind(record);
  elements.vetReminderMinutes.value = String(getVetReminderMinutes(record));
  elements.recordAccident.checked = Boolean(record.accident);
  elements.recordNote.value = record.note || "";
  document.querySelectorAll(".type-button").forEach((button) => {
    button.classList.toggle("selected", button.dataset.type === activeType);
  });
  updateAmountField();
  syncFoodKindFields();
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
  if (record.type === "vaccine") {
    maybeRequestNotificationPermission({ allowPrompt: true });
  }
  persist();
  clearEditMode();
  renderDayView();
}

function clearEditMode() {
  editingRecordId = null;
  elements.recordAmount.value = "";
  elements.foodKind.value = "food";
  populateSnackSelect(elements.snackName);
  elements.recordAccident.checked = false;
  elements.recordNote.value = "";
  syncFoodKindFields();
  resetRecordTimeToNow();
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
    accident: ["pee", "poop"],
    activity: ["play", "train"],
    note: ["note", "shower", "tooth", "vaccine", "school"],
  };
  const matchedTypes = typeMap[type] || [type];
  const entries = Object.entries(state.records).flatMap(([date, records]) =>
    records
      .filter((record) => matchedTypes.includes(record.type))
      .filter((record) => type !== "accident" || isAccidentRecord(record))
      .map((record) => ({ ...record, date }))
  );

  let filtered = entries;
  if (type === "accident") {
    filtered = entries.filter((entry) => entry.date >= analyticsStartKey && entry.date <= toKey(today));
  } else if (type !== "vaccine") {
    filtered = entries.filter((entry) => {
      if (["potty", "activity", "sleep", "walk", "food", "water", "school", "box", "note"].includes(type)) {
        return entry.date === toKey(today);
      }
      const [year, month] = entry.date.split("-").map(Number);
      return year === visibleMonth.getFullYear() && month === visibleMonth.getMonth() + 1;
    });
  }

  const sorted = filtered.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  return type === "accident" ? sorted.reverse() : sorted;
}

function getCategoryMeta(type) {
  if (type === "potty") {
    return { label: "Pee & Poop" };
  }
  if (type === "accident") {
    return { label: "Accident" };
  }
  if (type === "activity") {
    return { label: "Play & Train" };
  }
  if (type === "sleep") {
    return { label: "Sleep" };
  }
  if (type === "note") {
    return { label: "Notes" };
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
  if (["note", "shower", "tooth", "vaccine", "school"].includes(type)) {
    return "note";
  }
  return categoryTypes.includes(type) ? type : "";
}

function getCategoryDetail(entry, activeCategoryType = "") {
  const typeLabel = typeConfig[entry.type]?.label || entry.type;
  if (activeCategoryType === "potty" || activeCategoryType === "accident") {
    return {
      primary: [entry.amount || formatTime(entry.time), typeLabel, entry.accident ? "Accident" : ""].filter(Boolean).join(" - "),
      secondary: entry.note,
    };
  }

  if (activeCategoryType === "activity") {
    return {
      primary: [entry.amount || formatTime(entry.time), typeLabel].filter(Boolean).join(" - "),
      secondary: entry.note,
    };
  }

  if (entry.type === "walk") {
    return {
      primary: formatDurationHoursMinutes(getRecordDuration(entry)),
      secondary: formatTimeRange(entry),
    };
  }

  if (timedRecordTypes.includes(entry.type)) {
    return {
      primary: `${formatDurationHoursMinutes(getRecordDuration(entry))} - ${typeLabel}`,
      secondary: formatTimeRange(entry),
    };
  }

  if (entry.type === "vaccine") {
    return {
      primary: [entry.amount || "Regular visit", "Vet"].join(" - "),
      secondary: [entry.note, formatVetReminderText(entry.date, entry)].filter(Boolean).join(" - "),
    };
  }

  if (entry.type === "weight") {
    return {
      primary: entry.amount || "Weight check",
      secondary: entry.note,
    };
  }

  if (entry.type === "food") {
    const detail = getFoodKind(entry) === "snack" ? [getSnackName(entry), snackMatchesCurrentFood(entry) ? "same as current food" : ""].filter(Boolean).join(" - ") : entry.note;
    return {
      primary: [entry.amount || "Food", getFoodKindLabel(entry)].join(" - "),
      secondary: detail,
    };
  }

  if (entry.type === "school") {
    return {
      primary: entry.amount || "Hundeschule",
      secondary: entry.note || "Training notes",
    };
  }

  if (entry.type === "note") {
    return {
      primary: entry.amount || entry.note || "Side note",
      secondary: entry.amount ? entry.note : "",
    };
  }

  if (entry.type === "shower" || entry.type === "tooth") {
    return {
      primary: entry.amount ? `${entry.amount} - ${typeLabel}` : typeLabel,
      secondary: entry.note,
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
      <p>Pee ${stats.peeText}</p>
      <p>Poop ${stats.poopText}</p>
      <p>Accident ${stats.accidentText}</p>
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
    ["Pee", stats.peeText],
    ["Poop", stats.poopText],
    ["Accident", stats.accidentText],
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
  const accidentCount = records.filter(isAccidentRecord).length;
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
    accidentPerDay: formatAverage(accidentCount / days),
    peeText: formatTimesPerDay(count("pee"), days),
    poopText: formatTimesPerDay(count("poop"), days),
    accidentText: formatTimesPerDay(accidentCount, days),
    peeInterval: formatAverageInterval(records, "pee"),
    poopInterval: formatAverageInterval(records, "poop"),
    sleepPerDay: formatDuration(duration("sleep") / days),
    walkPerDay: formatDuration(duration("walk") / days),
    boxPerDay: formatDuration(duration("box") / days),
    weightText: latestWeight ? `${latestWeight.value.toFixed(1)}kg${firstWeight && firstWeight !== latestWeight ? ` from ${firstWeight.value.toFixed(1)}kg` : ""}` : "No data",
  };
}

function isAccidentRecord(record) {
  return ["pee", "poop"].includes(record?.type) && Boolean(record.accident);
}

function getAccidentRecordsUntil(endKey = toKey(today)) {
  return Object.entries(state.records || {})
    .filter(([date]) => date >= analyticsStartKey && date <= endKey)
    .flatMap(([date, records]) =>
      (records || [])
        .filter(isAccidentRecord)
        .map((record) => ({ ...record, date }))
    )
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function getWeekStartKey(dateKey = toKey(today)) {
  const date = parseDateKey(dateKey) || today;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const mondayOffset = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayOffset);
  return toKey(start);
}

function getAccidentStats(endKey = toKey(today)) {
  const accidents = getAccidentRecordsUntil(endKey);
  const weekStart = maxDateKey(getWeekStartKey(endKey), analyticsStartKey);
  const weeks = Math.max(1, Math.ceil(countDaysInclusive(analyticsStartKey, endKey) / 7));
  return {
    total: accidents.length,
    thisWeek: accidents.filter((record) => record.date >= weekStart && record.date <= endKey).length,
    perWeek: accidents.length / weeks,
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

function formatTimesPerDay(total, days) {
  return `${formatAverage(total / Math.max(1, days))} times/day (${total} total)`;
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
    const stats = getAccidentStats(dateKey);
    return renderSummaryRows([
      [`${pee} pee`, `${poop} poop`],
      [`Pee interval ${formatAverageInterval(records, "pee")}`, `Poop interval ${formatAverageInterval(records, "poop")}`],
      [`${stats.thisWeek} accidents this week`, `${formatAverage(stats.perWeek)} accidents per week`],
    ]);
  } else if (type === "accident") {
    const stats = getAccidentStats();
    parts.push(`${stats.total} accidents total`);
    parts.push(`${stats.thisWeek} this week`);
    parts.push(`${formatAverage(stats.perWeek)} per week`);
  } else if (type === "food") {
    parts.push(formatFoodProgress(records, dateKey));
  } else if (type === "water") {
    parts.push(`${records.length} times today`);
    parts.push(`${sumAmount(records, "ml")}mL total`);
  } else if (type === "box") {
    parts.push(`${formatDuration(duration)} in box`);
  } else if (type === "note") {
    const notes = records.filter((record) => record.type === "note").length;
    const showers = records.filter((record) => record.type === "shower").length;
    const teeth = records.filter((record) => record.type === "tooth").length;
    const vetVisits = records.filter((record) => record.type === "vaccine").length;
    const schools = records.filter((record) => record.type === "school").length;
    parts.push(`${records.length} side notes today`);
    parts.push(`${showers} shower`, `${teeth} teeth`, `${vetVisits} vet`, `${schools} school`, `${notes} notes`);
  } else if (type !== "weight" && type !== "vaccine") {
    parts.push(`${records.length} records today`);
  }

  if (type === "weight") {
    const latest = getWeightRecords().at(-1);
    parts.push(latest ? `Latest ${latest.value.toFixed(1)}kg` : "No weight yet");
  }

  return parts.length ? renderSummaryChips(parts) : "<span>No records today</span>";
}

function renderSummaryChips(parts) {
  return parts.map((part) => `<span>${escapeHtml(part)}</span>`).join("");
}

function renderSummaryRows(rows) {
  return rows
    .map((row) => `<div class="category-summary-row">${renderSummaryChips(row)}</div>`)
    .join("");
}

function getRecordsForSummary(dateKey, type) {
  const typeMap = {
    potty: ["pee", "poop"],
    accident: ["pee", "poop"],
    activity: ["play", "train"],
    note: ["note", "shower", "tooth", "vaccine", "school"],
  };
  const matchedTypes = typeMap[type] || [type];
  return (state.records[dateKey] || [])
    .filter((record) => matchedTypes.includes(record.type))
    .filter((record) => type !== "accident" || isAccidentRecord(record));
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

function getFoodSummary(records, dateKey = toKey(today)) {
  const foodRecords = records.filter((record) => record.type === "food");
  const mealRecords = foodRecords.filter((record) => getFoodKind(record) !== "snack");
  const snackRecords = foodRecords.filter((record) => getFoodKind(record) === "snack");
  const countedSnackRecords = snackRecords.filter(snackMatchesCurrentFood);
  const consumed = sumAmount(mealRecords, "g") + sumAmount(countedSnackRecords, "g");
  const snacks = sumAmount(snackRecords, "g");
  const countedSnacks = sumAmount(countedSnackRecords, "g");
  const needed = getFoodDailyTarget(dateKey);
  return { consumed, snacks, countedSnacks, needed };
}

function formatFoodProgress(records, dateKey = toKey(today)) {
  const { consumed, snacks, countedSnacks, needed } = getFoodSummary(records, dateKey);
  const progress = needed ? `${consumed}g / ${needed}g consumed` : `${consumed}g consumed`;
  if (!snacks) {
    return progress;
  }
  return countedSnacks ? `${progress} (${countedSnacks}g matching snack counted)` : `${progress} (${snacks}g snack separate)`;
}

function getFoodDailyTarget(dateKey = toKey(today)) {
  const manualTarget = Number(state.foodSettings?.dailyTargetGrams);
  const recommendation = getJoseraRecommendation(dateKey);
  if (getFoodTargetMode() === "josera" && recommendation) {
    return recommendation.targetGrams;
  }
  if (Number.isFinite(manualTarget) && manualTarget > 0) {
    return Math.round(manualTarget);
  }
  return recommendation ? recommendation.targetGrams : 0;
}

function refreshFoodRecommendationIfNeeded(force = false) {
  updateEstimatedAdultWeightSetting();
  if (getFoodTargetMode() !== "josera") {
    renderFoodRecommendationStatus();
    return false;
  }
  const recommendation = getJoseraRecommendation(toKey(today));
  if (!recommendation) {
    renderFoodRecommendationStatus();
    return false;
  }
  const weekKey = getWeekKey(today);
  const recommendationKey = `${weekKey}-${recommendation.product.key}-${recommendation.ageWeeks}w-${recommendation.adultWeightKg}kg-${recommendation.targetGrams}g`;
  const productLabel = recommendation.product.label;
  let changed = false;
  if (
    force ||
    state.foodSettings.recommendationWeek !== recommendationKey ||
    Number(state.foodSettings.dailyTargetGrams) !== recommendation.targetGrams
  ) {
    state.foodSettings.dailyTargetGrams = recommendation.targetGrams;
    state.foodSettings.recommendationWeek = recommendationKey;
    state.foodSettings.recommendationRange = `${recommendation.targetGrams}g`;
    state.foodSettings.recommendationSource = `Josera ${productLabel} calculator`;
    if (elements.foodDailyTarget) {
      elements.foodDailyTarget.value = recommendation.targetGrams;
    }
    changed = true;
  }
  renderFoodRecommendationStatus();
  return changed;
}

function renderFoodRecommendationStatus() {
  if (!elements.foodRecommendationStatus) {
    return;
  }
  updateFoodEstimateDisplay();
  updateFoodTargetModeUI();
  const targetMode = getFoodTargetMode();
  const recommendation = getJoseraRecommendation(toKey(today));
  if (!recommendation) {
    elements.foodRecommendationStatus.textContent =
      targetMode === "manual"
        ? `Manual target: ${getFoodDailyTarget()}g/day.`
        : "Josera recommendation unavailable for the current age/weight setting.";
    return;
  }
  const mode = targetMode === "josera" ? "Josera weekly" : "Manual";
  const target = getFoodDailyTarget();
  if (targetMode === "josera" && elements.foodDailyTarget) {
    elements.foodDailyTarget.value = target || "";
  }
  const estimate = getAdultWeightEstimate();
  const estimateText = estimate ? ` Growth estimate: ${estimate.value.toFixed(1)}kg${state.foodSettings.useEstimatedAdultWeight ? " used" : ""}.` : "";
  const parsedText =
    recommendation.enteredAdultWeightKg !== recommendation.adultWeightKg
      ? ` Calculator uses ${recommendation.adultWeightKg}kg from ${recommendation.enteredAdultWeightKg.toFixed(1)}kg.`
      : "";
  const mixtureText = state.foodSettings.type2 ? " Mixed foods can have different calorie densities, so confirm the combined target with the food labels or your vet." : "";
  const referenceText = targetMode === "manual" ? ` Josera reference for the current settings: ${recommendation.targetGrams}g/day.` : "";
  elements.foodRecommendationStatus.innerHTML = `${escapeHtml(mode)} target: ${escapeHtml(String(target))}g/day.${escapeHtml(referenceText)} Josera ${escapeHtml(recommendation.product.label)} calculator estimate for ${escapeHtml(String(recommendation.ageWeeks))} weeks and ${escapeHtml(String(recommendation.adultWeightKg))}kg expected grown weight: ${escapeHtml(String(recommendation.targetGrams))}g/day.${escapeHtml(parsedText)}${escapeHtml(estimateText)}${escapeHtml(mixtureText)} <a href="${joseraFeedingSourceUrl}" target="_blank" rel="noreferrer">Josera calculator</a> - <a href="${recommendation.product.guideUrl}" target="_blank" rel="noreferrer">${escapeHtml(recommendation.product.label)} guide</a>`;
}

function getFoodTargetMode() {
  return state.foodSettings?.targetMode === "manual" ? "manual" : "josera";
}

function updateFoodTargetModeUI() {
  if (!elements.foodTargetMode || !elements.foodDailyTarget) {
    return;
  }
  const isJosera = getFoodTargetMode() === "josera";
  elements.foodTargetMode.value = isJosera ? "josera" : "manual";
  elements.foodDailyTarget.readOnly = isJosera;
  document.querySelectorAll(".josera-target-field").forEach((field) => {
    field.hidden = !isJosera;
  });
}

function getJoseraRecommendation(dateKey = toKey(today)) {
  const ageWeeks = getJoseraCalculatorAgeWeeks(dateKey);
  const enteredAdultWeightKg = getFoodTargetAdultWeight();
  const adultWeightKg = getJoseraCalculatorAdultWeight(enteredAdultWeightKg);
  const product = getJoseraProductConfig();
  if (!ageWeeks || !adultWeightKg) {
    return null;
  }
  const grownPercent = getJoseraGrowthPercent(ageWeeks, adultWeightKg);
  const currentWeightKg = adultWeightKg * (grownPercent / 100);
  const energyFactor = getJoseraJuniorEnergyFactor(grownPercent);
  const targetGrams = Math.round((70 * energyFactor * currentWeightKg ** 0.75) / (product.kcalPerKg / 1000));
  return {
    product,
    adultWeightKg,
    enteredAdultWeightKg,
    ageWeeks,
    bucketLabel: `${ageWeeks} weeks`,
    currentWeightKg: Number(currentWeightKg.toFixed(1)),
    grownPercent: Number(grownPercent.toFixed(1)),
    kcalPerKg: product.kcalPerKg,
    min: targetGrams,
    max: targetGrams,
    midpoint: targetGrams,
    targetGrams,
  };
}

function getJoseraCalculatorAgeWeeks(dateKey) {
  const birthday = parseDateKey(state.profile.birthday);
  const date = parseDateKey(dateKey);
  if (!birthday || !date) {
    return 8;
  }
  const ageDays = Math.max(0, Math.ceil((date - birthday) / 86400000));
  return Math.max(8, Math.min(52, Math.ceil(ageDays / 7)));
}

function getJoseraCalculatorAdultWeight(weightKg) {
  const value = Number(weightKg) || 30;
  return Math.max(5, Math.min(90, Math.trunc(value)));
}

function getJoseraGrowthClass(adultWeightKg) {
  if (adultWeightKg <= 7) {
    return 7;
  }
  if (adultWeightKg <= 15) {
    return 15;
  }
  if (adultWeightKg <= 27.5) {
    return 27.5;
  }
  if (adultWeightKg <= 47.5) {
    return 47.5;
  }
  return "class5";
}

function getJoseraGrowthPercent(ageWeeks, adultWeightKg) {
  const model = joseraGrowthModel[getJoseraGrowthClass(adultWeightKg)];
  const percent = model.a * Math.log(ageWeeks) + model.b;
  return Math.max(0, Math.min(100, percent));
}

function getJoseraJuniorEnergyFactor(grownPercent) {
  if (grownPercent <= 40) {
    return 2.9;
  }
  if (grownPercent <= 80) {
    return 2.87 - ((grownPercent - 40) / 40) * (2.87 - 2);
  }
  return 2;
}

function getFoodTargetAdultWeight() {
  const estimate = getAdultWeightEstimate();
  if (state.foodSettings?.useEstimatedAdultWeight && estimate) {
    return estimate.value;
  }
  return Number(state.foodSettings?.expectedAdultWeightKg) || 30;
}

function updateEstimatedAdultWeightSetting() {
  const estimate = getAdultWeightEstimate();
  state.foodSettings.estimatedAdultWeightKg = estimate ? Number(estimate.value.toFixed(1)) : 0;
  state.foodSettings.estimatedAdultWeightConfidence = estimate?.confidence || "";
  return estimate;
}

function updateFoodEstimateDisplay() {
  if (!elements.foodEstimatedWeight) {
    return;
  }
  const estimate = updateEstimatedAdultWeightSetting();
  elements.foodEstimatedWeight.value = estimate ? `${estimate.value.toFixed(1)} kg (${estimate.confidence})` : "Need weight record";
}

function getAdultWeightEstimate() {
  const estimates = getWeightRecords()
    .map((record) => {
      const ageMonths = getAgeMonthsOnDate(record.date);
      const ratio = getLargeBreedGrowthRatio(ageMonths);
      if (!ratio || ageMonths < 1.3 || ageMonths > 18) {
        return null;
      }
      const value = record.value / ratio;
      if (!Number.isFinite(value) || value < 5 || value > 90) {
        return null;
      }
      return { value, date: record.date, ageMonths };
    })
    .filter(Boolean)
    .slice(-6);

  if (!estimates.length) {
    return null;
  }

  const weightedTotal = estimates.reduce((total, estimate, index) => total + estimate.value * (index + 1), 0);
  const weightTotal = estimates.reduce((total, estimate, index) => total + index + 1, 0);
  const value = weightedTotal / weightTotal;
  const values = estimates.map((estimate) => estimate.value);
  const spread = Math.max(...values) - Math.min(...values);
  const confidence = estimates.length >= 4 && spread < 6 ? "medium" : estimates.length >= 2 ? "early trend" : "early";
  return { value, confidence, records: estimates.length };
}

function getLargeBreedGrowthRatio(ageMonths) {
  const curve = [
    [1.5, 0.16],
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
  const age = Math.max(1.5, Math.min(18, ageMonths || 1.5));
  for (let index = 0; index < curve.length - 1; index += 1) {
    const [fromAge, fromRatio] = curve[index];
    const [toAge, toRatio] = curve[index + 1];
    if (age >= fromAge && age <= toAge) {
      const progress = (age - fromAge) / (toAge - fromAge);
      return fromRatio + progress * (toRatio - fromRatio);
    }
  }
  return 1;
}

function getAgeMonthsOnDate(dateKey) {
  const birthday = parseDateKey(state.profile.birthday);
  const date = parseDateKey(dateKey);
  if (!birthday || !date) {
    return 2;
  }
  return Math.max(0, (date - birthday) / 2629800000);
}

function getWeekKey(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day + 3);
  const firstThursday = new Date(copy.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((copy - firstThursday) / 604800000);
  return `${copy.getFullYear()}-W${String(week).padStart(2, "0")}`;
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
  elements.currentMonth.textContent = formatLongDate(today);
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
  elements.foodTargetMode.value = getFoodTargetMode();
  elements.foodType.value = state.foodSettings.type;
  elements.foodType2.value = state.foodSettings.type2;
  if (document.activeElement !== elements.snackList) {
    elements.snackList.value = getSnackOptions().join("\n");
  }
  elements.foodDailyTarget.value = state.foodSettings.dailyTargetGrams || "";
  elements.foodExpectedWeight.value = state.foodSettings.expectedAdultWeightKg || 30;
  elements.foodUseEstimatedWeight.checked = Boolean(state.foodSettings.useEstimatedAdultWeight);
  elements.foodReminderMinutes.value = state.foodSettings.reminderMinutes;
  elements.foodTimeMorning.value = state.foodTimes.morning;
  elements.foodTimeAfternoon.value = state.foodTimes.afternoon;
  elements.foodTimeEvening.value = state.foodTimes.evening;
  elements.foodAmountMorning.value = state.foodSettings.amounts.morning;
  elements.foodAmountMorning2.value = state.foodSettings.secondAmounts.morning;
  elements.foodAmountAfternoon.value = state.foodSettings.amounts.afternoon;
  elements.foodAmountAfternoon2.value = state.foodSettings.secondAmounts.afternoon;
  elements.foodAmountEvening.value = state.foodSettings.amounts.evening;
  elements.foodAmountEvening2.value = state.foodSettings.secondAmounts.evening;
  populateSnackSelect(elements.snackName, elements.snackName.value);
  populateSnackSelect(elements.calendarSnackName, elements.calendarSnackName.value);
  renderFoodRecommendationStatus();
  elements.syncCode.value = state.sync.code;
  elements.firebaseConfig.value = state.sync.firebaseConfig;
  renderSyncStatus(state.sync.lastSync ? `Last sync: ${state.sync.lastSync}` : "Use the same sync code and Firebase config on each phone. Auto-sync runs after edits.");
}

function syncProfileFromForm() {
  const before = {
    owner: getComparableSection(state.owner),
    profile: getComparableSection(state.profile),
    school: getComparableSection(state.school),
    schoolSchedule: getComparableSection(state.schoolSchedule),
    vaccination: getComparableSection(state.vaccination),
    foodTimes: getComparableSection(state.foodTimes),
    foodSettings: getComparableSection(state.foodSettings),
  };
  const updatedAt = new Date().toISOString();
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
  state.foodSettings.targetMode = elements.foodTargetMode.value === "manual" ? "manual" : "josera";
  state.foodSettings.autoTarget = state.foodSettings.targetMode === "josera";
  state.foodSettings.type = elements.foodType.value.trim();
  state.foodSettings.type2 = elements.foodType2.value.trim();
  const nextSnacks = normalizeSnackList(elements.snackList.value);
  if (JSON.stringify(nextSnacks) !== JSON.stringify(normalizeSnackList(state.foodSettings.snacks))) {
    state.foodSettings.snacksUpdatedAt = new Date().toISOString();
  }
  state.foodSettings.snacks = nextSnacks;
  populateSnackSelect(elements.snackName, elements.snackName.value);
  populateSnackSelect(elements.calendarSnackName, elements.calendarSnackName.value);
  state.foodSettings.dailyTargetGrams = Math.max(0, Number(elements.foodDailyTarget.value) || 0);
  state.foodSettings.expectedAdultWeightKg = Math.max(5, Number(elements.foodExpectedWeight.value) || 30);
  state.foodSettings.useEstimatedAdultWeight = elements.foodUseEstimatedWeight.checked;
  state.foodSettings.reminderMinutes = Math.max(0, Math.min(180, Number(elements.foodReminderMinutes.value) || 0));
  state.foodSettings.amounts.morning = elements.foodAmountMorning.value.trim();
  state.foodSettings.secondAmounts.morning = elements.foodAmountMorning2.value.trim();
  state.foodSettings.amounts.afternoon = elements.foodAmountAfternoon.value.trim();
  state.foodSettings.secondAmounts.afternoon = elements.foodAmountAfternoon2.value.trim();
  state.foodSettings.amounts.evening = elements.foodAmountEvening.value.trim();
  state.foodSettings.secondAmounts.evening = elements.foodAmountEvening2.value.trim();
  refreshFoodRecommendationIfNeeded();
  markSectionUpdatedAt(state.owner, before.owner, updatedAt);
  markSectionUpdatedAt(state.profile, before.profile, updatedAt);
  markSectionUpdatedAt(state.school, before.school, updatedAt);
  markSectionUpdatedAt(state.schoolSchedule, before.schoolSchedule, updatedAt);
  markSectionUpdatedAt(state.vaccination, before.vaccination, updatedAt);
  markSectionUpdatedAt(state.foodTimes, before.foodTimes, updatedAt);
  markSectionUpdatedAt(state.foodSettings, before.foodSettings, updatedAt);
}

function saveProfileFormChanges() {
  syncProfileFromForm();
  persist();
  hydrateMainProfile();
  renderAge();
  renderInsight();
  renderReminderSections();
  updateFoodTargetModeUI();
}

function getComparableSection(section = {}) {
  const clone = makeJsonSafe(section || {});
  delete clone.updatedAt;
  return clone;
}

function markSectionUpdatedAt(section, before, updatedAt) {
  if (JSON.stringify(getComparableSection(section)) !== JSON.stringify(before)) {
    section.updatedAt = updatedAt;
  }
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
    elements.foodTargetMode,
    elements.foodType,
    elements.foodType2,
    elements.snackList,
    elements.foodDailyTarget,
    elements.foodExpectedWeight,
    elements.foodUseEstimatedWeight,
    elements.foodReminderMinutes,
    elements.foodTimeMorning,
    elements.foodTimeAfternoon,
    elements.foodTimeEvening,
    elements.foodAmountMorning,
    elements.foodAmountMorning2,
    elements.foodAmountAfternoon,
    elements.foodAmountAfternoon2,
    elements.foodAmountEvening,
    elements.foodAmountEvening2,
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

function getVetRecordReminders() {
  return Object.entries(state.records || {})
    .flatMap(([dateKey, records]) =>
      (records || [])
        .filter((record) => record.type === "vaccine")
        .map((record) => {
          const visitDate = getVetVisitDate(dateKey, record);
          const reminderDate = getVetReminderDate(dateKey, record);
          if (!visitDate || !reminderDate) {
            return null;
          }
          const kind = record.amount || "Visit";
          const detail = record.note ? ` - ${record.note}` : "";
          return {
            date: reminderDate,
            visitDate,
            title: `Vet reminder: ${kind}`,
            body: `Visit ${formatDateKey(dateKey)} ${formatTime(record.time || "09:00")} - ${formatReminderLead(getVetReminderMinutes(record))}${detail}`,
            urgent: minutesUntil(reminderDate) >= 0 && minutesUntil(reminderDate) <= 1,
          };
        })
        .filter(Boolean)
    )
    .filter((reminder) => minutesUntil(reminder.visitDate) >= -60)
    .sort((a, b) => a.date - b.date);
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
  const reminderMinutes = getFoodReminderMinutes();
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
    const reminderTime = new Date(nextMeal.getTime() - reminderMinutes * 60000);
    const reminderText = reminderMinutes ? `${reminderMinutes} minutes before` : "At food time";
    return {
      title: `${label}: ${formatTime(time)}`,
      body: `Reminder ${reminderText}: ${formatDateKey(toKey(reminderTime))} ${formatTime(reminderTime.toTimeString().slice(0, 5))}`,
      urgent: minutesUntil(reminderTime) <= 1,
    };
  });
}

function getFoodReminderMinutes() {
  const minutes = Number(state.foodSettings.reminderMinutes);
  return Number.isFinite(minutes) ? Math.max(0, Math.min(180, Math.round(minutes))) : 5;
}

function maybeRequestNotificationPermission({ allowPrompt = false } = {}) {
  if (!anyAlarmEnabled() || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "default") {
    if (allowPrompt) {
      Notification.requestPermission().then(() => showDueVaccinationNotification());
    }
    return;
  }

  showDueVaccinationNotification();
}

function showDueVaccinationNotification() {
  if (!anyAlarmEnabled() || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const urgent = [
    ...getVetRecordReminders(),
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
    body: [urgent.title, urgent.body].filter(Boolean).join(" - "),
  });
}

function anyAlarmEnabled() {
  return getVetRecordReminders().length > 0 || state.settings.vaccineAlarmEnabled || state.settings.schoolAlarmEnabled || state.settings.foodAlarmEnabled;
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
  syncProfileWeightFromRecords();
  return buildSyncPayload(state);
}

function buildSyncPayload(sourceState) {
  const syncState = {
    ...sourceState,
    photos: [],
    activeSessions: normalizeActiveSessions(sourceState.activeSessions),
    stoppedSessionIds: sourceState.stoppedSessionIds || [],
    sync: {
      code: sourceState.sync?.code || state.sync.code,
      lastSync: sourceState.sync?.lastSync || state.sync.lastSync,
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

function getRecoverySignature(sourceState = state) {
  return [
    ...getRecordSignatures(sourceState.records || {}),
    ...getActiveSessionSignatures(sourceState.activeSessions || {}),
    ...(sourceState.deletedRecordIds || []).map((id) => `deleted|${id}`),
    ...(sourceState.stoppedSessionIds || []).map((id) => `stopped|${id}`),
    ...Object.entries(sourceState.bookmarks || {}).map(([date, value]) => `bookmark|${date}|${JSON.stringify(value)}`),
  ]
    .sort()
    .join("\n");
}

function createLocalBackup(reason) {
  try {
    const backups = JSON.parse(localStorage.getItem(backupStorageKey) || "[]");
    const signature = getRecoverySignature(state);
    if (Array.isArray(backups) && backups[0]?.signature === signature) {
      return;
    }
    const backup = {
      reason,
      savedAt: new Date().toISOString(),
      signature,
      state: makeJsonSafe({ ...state, photos: [] }),
    };
    const nextBackups = [backup, ...(Array.isArray(backups) ? backups : [])].slice(0, 20);
    localStorage.setItem(backupStorageKey, JSON.stringify(nextBackups));
  } catch {
    // Backup failure must never block logging.
  }
}

function getLocalBackups() {
  try {
    const backups = JSON.parse(localStorage.getItem(backupStorageKey) || "[]");
    return Array.isArray(backups) ? backups : [];
  } catch {
    return [];
  }
}

function countBackupRecords(backup) {
  return Object.values(backup?.state?.records || {}).reduce((total, records) => total + (Array.isArray(records) ? records.length : 0), 0);
}

function countBackupTodayRecords(backup) {
  const records = backup?.state?.records?.[toKey(today)];
  return Array.isArray(records) ? records.length : 0;
}

function getBestLocalBackup() {
  return getLocalBackups()
    .filter((backup) => backup?.state)
    .sort((a, b) => {
      const todayDifference = countBackupTodayRecords(b) - countBackupTodayRecords(a);
      if (todayDifference) {
        return todayDifference;
      }
      const recordDifference = countBackupRecords(b) - countBackupRecords(a);
      if (recordDifference) {
        return recordDifference;
      }
      return String(b.savedAt || "").localeCompare(String(a.savedAt || ""));
    })[0];
}

function recoverLatestLocalBackup() {
  const backups = getLocalBackups().filter((backup) => backup?.state);
  if (backups.length > 1) {
    renderBackupRecoveryList(backups);
    renderSyncStatus("Choose the backup with the highest record count, then restore it.");
    showToast("Backup list opened. Choose the backup with the most records.", 9000);
    return;
  }
  recoverLocalBackup(getBestLocalBackup());
}

function renderBackupRecoveryList(backups = getLocalBackups()) {
  const validBackups = backups
    .filter((backup) => backup?.state)
    .sort((a, b) => {
      const recordDifference = countBackupRecords(b) - countBackupRecords(a);
      if (recordDifference) {
        return recordDifference;
      }
      return String(b.savedAt || "").localeCompare(String(a.savedAt || ""));
    });
  if (!validBackups.length) {
    elements.backupRecoveryList.hidden = false;
    elements.backupRecoveryList.innerHTML = `<p class="empty-state">No local backups found on this device.</p>`;
    return;
  }

  elements.backupRecoveryList.hidden = false;
  elements.backupRecoveryList.innerHTML = `
    <h3>Local Recovery Backups</h3>
    <p>Choose the backup with the most records, usually before the data disappeared.</p>
    ${validBackups
      .map((backup, index) => {
        const savedAt = backup.savedAt ? new Date(backup.savedAt).toLocaleString() : "Unknown time";
        const recordCount = countBackupRecords(backup);
        const todayCount = countBackupTodayRecords(backup);
        return `
          <button type="button" class="backup-recovery-item" data-backup-index="${index}">
            <strong>${escapeHtml(String(recordCount))} records</strong>
            <span>${escapeHtml(String(todayCount))} today - ${escapeHtml(savedAt)}</span>
            <small>${escapeHtml(backup.reason || "local backup")}</small>
          </button>
        `;
      })
      .join("")}
  `;
  elements.backupRecoveryList.querySelectorAll(".backup-recovery-item").forEach((button) => {
    button.addEventListener("click", () => {
      const backup = validBackups[Number(button.dataset.backupIndex)];
      recoverLocalBackup(backup);
    });
  });
}

function recoverLocalBackup(backup) {
  if (!backup?.state) {
    renderSyncStatus("No local recovery backup found on this device.");
    showToast("No local recovery backup found on this device.", 6000);
    return;
  }

  createLocalBackup("before recovery restore");
  const localPhotos = state.photos;
  const localSync = state.sync;
  const backupState = migrateState(backup.state);
  const backupRecordIds = new Set(
    Object.values(backupState.records || {})
      .flat()
      .map((record) => record.id)
      .filter(Boolean)
  );
  const local = makeJsonSafe(state);
  local.deletedRecordIds = (local.deletedRecordIds || []).filter((id) => !backupRecordIds.has(id));
  backupState.deletedRecordIds = (backupState.deletedRecordIds || []).filter((id) => !backupRecordIds.has(id));
  const merged = mergeStates(local, backupState);
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, merged);
  state.photos = localPhotos;
  state.sync = localSync;
  syncProfileWeightFromRecords();
  persist();
  refreshCurrentView();
  renderReminderSections();
  const recordCount = countBackupRecords(backup);
  const todayCount = countBackupTodayRecords(backup);
  elements.backupRecoveryList.hidden = true;
  renderSyncStatus(`Recovered local backup from ${new Date(backup.savedAt).toLocaleString()}: ${recordCount} records, ${todayCount} today.`);
  showToast(`Recovered backup: ${recordCount} records, ${todayCount} today.`, 9000);
}

function applySyncedPayload(payload, options = {}) {
  mergeSyncedPayload(payload, options);
}

function exportExcelData() {
  const rows = [["Date", "Type", "Food kind", "Snack", "Time", "Start", "End", "Duration minutes", "Amount", "Food 1", "Food 1 amount", "Food 2", "Food 2 amount", "Accident", "Note"]];
  Object.entries(state.records)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, records]) => {
      records
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time))
        .forEach((record) => {
          const foodComponents = getFoodComponents(record);
          rows.push([
            date,
            typeConfig[record.type]?.label || record.type,
            record.type === "food" ? getFoodKindLabel(record) : "",
            record.type === "food" && getFoodKind(record) === "snack" ? getSnackName(record) : "",
            record.time || "",
            record.startTime || "",
            record.endTime || "",
            getRecordDuration(record) || "",
            record.amount || "",
            foodComponents[0]?.name || "",
            foodComponents[0]?.amount || "",
            foodComponents[1]?.name || "",
            foodComponents[1]?.amount || "",
            record.accident ? "yes" : "",
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

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  importInProgress = true;
  try {
    const rows = await readImportRows(file);
    const imported = importExcelRows(rows);
    renderSyncStatus(`Imported ${imported} records from Excel.`);
  } catch (error) {
    renderSyncStatus(`Import failed: ${error.message || "use the same format as Excel export."}`);
  } finally {
    importInProgress = false;
    elements.importDataInput.value = "";
    scheduleAutoFirebaseSync();
  }
}

async function readImportRows(file) {
  const signature = await readFileSignature(file);
  if (signature === "PK") {
    if (!window.XLSX) {
      throw new Error("Excel importer is still loading. Try again in a moment.");
    }
    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return window.XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false, defval: "" });
  }
  const csvText = await file.text();
  return parseCsv(csvText.replace(/^\ufeff/, ""));
}

function readFileSignature(file) {
  return file.slice(0, 2).text();
}

function importExcelRows(rows) {
  if (rows.length < 2) {
    throw new Error("no record rows found.");
  }
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const columns = ["date", "type", "food kind", "snack", "snack counts as food", "time", "start", "end", "duration minutes", "amount", "food 1", "food 1 amount", "food 2", "food 2 amount", "accident", "note"];
  const indexes = Object.fromEntries(columns.map((header) => [header, headers.indexOf(header)]));
  if (["date", "type", "time"].some((header) => indexes[header] < 0)) {
    throw new Error("CSV must use the exported columns.");
  }

  let imported = 0;
  rows.slice(1).forEach((row) => {
    const date = normalizeImportDate(row[indexes.date]);
    const type = normalizeImportType(row[indexes.type]);
    if (!date || !type) {
      return;
    }
    const startTime = normalizeImportTime(row[indexes.start]) || normalizeImportTime(row[indexes.time]);
    const endTime = normalizeImportTime(row[indexes.end]);
    const duration = Number(row[indexes["duration minutes"]]) || (startTime && endTime ? durationFromTimes(startTime, endTime) : 0);
    const record = {
      id: createId(),
      type,
      time: normalizeImportTime(row[indexes.time]) || startTime || "00:00",
      amount: row[indexes.amount] || "",
      note: row[indexes.note] || "",
    };
    if (type === "food" && indexes["food kind"] >= 0) {
      record.foodKind = normalizeFoodKind(row[indexes["food kind"]]);
      if (record.foodKind === "snack" && indexes.snack >= 0) {
        record.snackName = String(row[indexes.snack] || "").trim();
        if (record.snackName) {
          state.foodSettings.snacks = normalizeSnackList([...(state.foodSettings.snacks || []), record.snackName]);
          state.foodSettings.snacksUpdatedAt = new Date().toISOString();
        }
      }
      const components = [
        { name: row[indexes["food 1"]] || "", amount: row[indexes["food 1 amount"]] || "" },
        { name: row[indexes["food 2"]] || "", amount: row[indexes["food 2 amount"]] || "" },
      ].filter((component) => String(component.name || component.amount).trim());
      if (components.length) {
        record.foodComponents = components;
      }
    }
    if (["pee", "poop"].includes(type) && indexes.accident >= 0) {
      record.accident = normalizeImportBoolean(row[indexes.accident]);
    }
    if (timedRecordTypes.includes(type)) {
      record.startTime = startTime || record.time;
      record.durationMinutes = Math.max(1, duration || parseDurationMinutes(record.amount) || 1);
      record.endTime = endTime || addMinutesToTime(record.startTime, record.durationMinutes);
      record.amount = `${record.durationMinutes} min`;
    }
    if (isDuplicateImportedRecord(date, record)) {
      return;
    }
    state.records[date] = [...(state.records[date] || []), record];
    imported += 1;
  });

  if (!imported) {
    throw new Error("no new records found.");
  }
  syncProfileWeightFromRecords();
  persist();
  refreshCurrentView();
  return imported;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      if (row.some((value) => value.trim())) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) {
    rows.push(row);
  }
  return rows;
}

function normalizeImportType(value) {
  const normalized = String(value || "").trim().toLowerCase();
  const aliases = {
    teeth: "tooth",
    tooth: "tooth",
    "brush teeth": "tooth",
    "brushing teeth": "tooth",
    toothbrush: "tooth",
    "tooth brushing": "tooth",
    sidenote: "note",
    "side note": "note",
    notes: "note",
  };
  if (aliases[normalized]) {
    return aliases[normalized];
  }
  return Object.keys(typeConfig).find((type) => type === normalized || typeConfig[type].label.toLowerCase() === normalized) || "";
}

function normalizeFoodKind(value) {
  return String(value || "").trim().toLowerCase() === "snack" ? "snack" : "food";
}

function normalizeImportBoolean(value) {
  return /^(yes|y|true|1|accident)$/i.test(String(value || "").trim());
}

function normalizeImportDate(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }
  const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    return `${slash[3]}-${slash[1].padStart(2, "0")}-${slash[2].padStart(2, "0")}`;
  }
  return "";
}

function normalizeImportTime(value) {
  const text = String(value || "").trim();
  const time24 = text.match(/^(\d{1,2}):(\d{2})$/);
  if (time24) {
    return `${time24[1].padStart(2, "0")}:${time24[2]}`;
  }
  const time12 = text.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (time12) {
    let hour = Number(time12[1]);
    if (time12[3].toUpperCase() === "PM" && hour < 12) hour += 12;
    if (time12[3].toUpperCase() === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${time12[2]}`;
  }
  return "";
}

function isDuplicateImportedRecord(date, record) {
  return (state.records[date] || []).some(
    (entry) =>
      entry.type === record.type &&
      entry.time === record.time &&
      (entry.amount || "") === (record.amount || "") &&
      Boolean(entry.accident) === Boolean(record.accident) &&
      (entry.snackName || "") === (record.snackName || "") &&
      (entry.note || "") === (record.note || "")
  );
}

function renderSyncStatus(message) {
  elements.syncStatus.textContent = message;
}

function showToast(message, duration = 3200) {
  elements.appToast.textContent = message;
  elements.appToast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.appToast.hidden = true;
  }, duration);
}

async function pushFirebaseSync() {
  const settings = validateFirebaseSettings();
  if (!settings) {
    return false;
  }

  const syncingRevision = localChangeRevision;
  renderSyncStatus("Pushing to Firebase...");
  try {
    const services = await getFirebaseServices(settings);
    const ref = services.doc(services.db, "puppy_books", state.sync.code);
    const payload = await writeMergedFirebasePayload(services, ref);
    await verifyFirebaseWrite(services, ref, payload);
    state.sync.lastSync = new Date().toLocaleString();
    persist({ skipAutoSync: true });
    finishSuccessfulFirebaseOperation(syncingRevision);
    renderSyncStatus(`Pushed to Firebase sync code "${state.sync.code}".`);
    return true;
  } catch (error) {
    queueFirebaseRetry(`Firebase push failed: ${getFirebaseErrorMessage(error)}`);
    return false;
  }
}

async function pullFirebaseSync({ confirmPending = true } = {}) {
  const settings = validateFirebaseSettings();
  if (!settings) {
    return false;
  }
  const pendingLocalPush = hasPendingFirebasePush();
  const syncingRevision = localChangeRevision;
  if (pendingLocalPush && confirmPending) {
    const shouldMerge = window.confirm(
      "This device has local changes that failed to push. Pulling now will compare this device with Firebase, keep local-only records, keep Firebase-only records, and write the merged puppy book back to Firebase. Continue?"
    );
    if (!shouldMerge) {
      renderSyncStatus("Pull cancelled. Local records are still kept on this device.");
      return false;
    }
  }

  renderSyncStatus(pendingLocalPush ? "Merging this device with Firebase..." : "Pulling and comparing Firebase...");
  try {
    const services = await getFirebaseServices(settings);
    const ref = services.doc(services.db, "puppy_books", state.sync.code);
    const firstPull = !state.sync.lastSync;
    const result = await mergeFirebasePull(services, ref, {
      preferRemoteDefaults: firstPull,
      firstPull,
      preserveRemoteRecords: firstPull,
    });
    if (!result.found) {
      renderSyncStatus("No Firebase puppy book found for this sync code. Push first from one phone.");
      return false;
    }
    await verifyFirebaseWrite(services, ref, result.payload);
    state.sync.lastSync = new Date().toLocaleString();
    persist({ skipAutoSync: true });
    finishSuccessfulFirebaseOperation(syncingRevision);
    renderSyncStatus(
      firstPull
        ? "First Firebase pull complete. Profile and default settings came from Firebase; starter sample records were removed."
        : `Merge complete. Added ${result.summary.localOnly} local-only records and kept ${result.summary.remoteOnly} Firebase-only records.`
    );
    return true;
  } catch (error) {
    const message = `Firebase pull failed: ${getFirebaseErrorMessage(error)}`;
    if (pendingLocalPush) {
      queueFirebaseRetry(message);
    } else {
      renderSyncStatus(message);
      showToast(message, 9000);
    }
    return false;
  }
}

function scheduleAutoFirebaseSync(delay = 900) {
  if (importInProgress || persistOptions.skipAutoSync || !hasFirebaseSettings()) {
    return;
  }
  if (autoSyncInProgress) {
    autoSyncQueued = true;
    return;
  }
  window.clearTimeout(autoSyncTimer);
  autoSyncTimer = window.setTimeout(autoFirebaseSync, delay);
}

async function autoFirebaseSync() {
  if (importInProgress || !hasFirebaseSettings()) {
    return;
  }
  if (autoSyncInProgress) {
    autoSyncQueued = true;
    return;
  }
  autoSyncTimer = null;
  autoSyncInProgress = true;
  autoSyncQueued = false;
  const syncingRevision = localChangeRevision;
  let syncSucceeded = false;
  renderSyncStatus("Auto-syncing with Firebase...");
  try {
    const settings = validateFirebaseSettings();
    if (!settings) {
      return;
    }
    const services = await getFirebaseServices(settings);
    const ref = services.doc(services.db, "puppy_books", state.sync.code);
    const payload = await writeMergedFirebasePayload(services, ref);
    await verifyFirebaseWrite(services, ref, payload);
    state.sync.lastSync = new Date().toLocaleString();
    persist({ skipAutoSync: true });
    syncSucceeded = true;
    finishSuccessfulFirebaseOperation(syncingRevision);
    renderSyncStatus(`Auto-synced Firebase at ${state.sync.lastSync}.`);
    showToast("Saved and synced with Firebase.", 1800);
  } catch (error) {
    queueFirebaseRetry(`Auto-sync failed: ${getFirebaseErrorMessage(error)}`);
  } finally {
    autoSyncInProgress = false;
    if (syncSucceeded && (autoSyncQueued || localChangeRevision > syncingRevision || hasStoredPendingFirebasePush())) {
      scheduleAutoFirebaseSync(350);
    }
  }
}

function queueFirebaseRetry(message) {
  markFirebasePushPending();
  if (!hasFirebaseSettings()) {
    renderSyncStatus(`${message} Add sync settings, then try again.`);
    showToast(`${message}. Add sync settings, then try again.`, 9000);
    return;
  }
  firebaseRetryCount += 1;
  const delay = Math.min(60000, 5000 * firebaseRetryCount);
  const retryMessage = `${message}. Local records are kept here. Auto-pulls are paused; tap Pull to compare and merge now, or auto-retry will push in ${Math.round(delay / 1000)} sec.`;
  renderSyncStatus(retryMessage);
  showToast(retryMessage, 9000);
  window.clearTimeout(firebaseRetryTimer);
  firebaseRetryTimer = window.setTimeout(() => {
    firebaseRetryTimer = null;
    renderSyncStatus(`Retrying Firebase push (${firebaseRetryCount})...`);
    autoFirebaseSync();
  }, delay);
}

function hasPendingFirebasePush() {
  return hasStoredPendingFirebasePush() || firebaseRetryCount > 0 || Boolean(firebaseRetryTimer);
}

function clearFirebaseRetry() {
  firebaseRetryCount = 0;
  window.clearTimeout(firebaseRetryTimer);
  firebaseRetryTimer = null;
}

function hasStoredPendingFirebasePush() {
  try {
    return localStorage.getItem(pendingSyncStorageKey) === "1";
  } catch {
    return false;
  }
}

function markFirebasePushPending() {
  try {
    localStorage.setItem(pendingSyncStorageKey, "1");
  } catch {
    // The main state save reports storage failures separately.
  }
}

function markFirebasePushComplete() {
  try {
    localStorage.removeItem(pendingSyncStorageKey);
  } catch {
    // A later app resume will safely retry if this flag cannot be cleared.
  }
}

function finishSuccessfulFirebaseOperation(syncingRevision) {
  clearFirebaseRetry();
  if (localChangeRevision === syncingRevision) {
    markFirebasePushComplete();
    return true;
  }
  markFirebasePushPending();
  autoSyncQueued = true;
  return false;
}

async function writeMergedFirebasePayload(services, ref) {
  let writtenPayload = null;
  await services.runTransaction(services.db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    let mergedState = makeJsonSafe(state);
    if (snapshot.exists()) {
      const remoteState = migrateState(getPayloadData(snapshot.data().bookData));
      mergedState = mergeStates(makeJsonSafe(state), remoteState);
    }
    writtenPayload = buildSyncPayload(mergedState);
    transaction.set(ref, {
      bookData: writtenPayload,
      updatedAt: new Date().toISOString(),
    });
  });
  if (!writtenPayload) {
    throw new Error("Firebase transaction did not prepare data");
  }
  mergeSyncedPayload(writtenPayload);
  return writtenPayload;
}

async function mergeFirebasePull(services, ref, options = {}) {
  let writtenPayload = null;
  let found = false;
  let summary = { localOnly: 0, remoteOnly: 0 };
  await services.runTransaction(services.db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) {
      return;
    }
    found = true;
    const rawRemote = getPayloadData(snapshot.data().bookData);
    const remoteState = migrateState(rawRemote);
    const localState = options.firstPull ? removeStarterSampleRecords(makeJsonSafe(state)) : makeJsonSafe(state);
    summary = getRecordMergeSummary(localState, remoteState);
    const mergedState = mergeStates(localState, remoteState, { ...options, rawRemote });
    writtenPayload = buildSyncPayload(mergedState);
    transaction.set(ref, {
      bookData: writtenPayload,
      updatedAt: new Date().toISOString(),
    });
  });
  if (!found) {
    return { found: false, payload: null, summary };
  }
  if (!writtenPayload) {
    throw new Error("Firebase merge did not prepare data");
  }
  mergeSyncedPayload(writtenPayload, options);
  return { found: true, payload: writtenPayload, summary };
}

async function verifyFirebaseWrite(services, ref, expectedPayload) {
  const snapshot = await services.getDoc(ref);
  if (!snapshot.exists()) {
    throw new Error("Firebase write verification failed: puppy book was not found after push");
  }
  const remotePayload = snapshot.data().bookData;
  const missing = findMissingSyncData(expectedPayload, remotePayload);
  if (missing.length) {
    throw new Error(`Firebase write verification failed: missing ${missing.slice(0, 4).join(", ")}`);
  }
}

function findMissingSyncData(expectedPayload, remotePayload) {
  const expected = getPayloadData(expectedPayload);
  const remote = getPayloadData(remotePayload);
  const missing = [];
  const remoteRecordSignatures = new Set(getRecordSignatures(remote.records || {}));
  getRecordSignatures(expected.records || {}).forEach((signature) => {
    if (!remoteRecordSignatures.has(signature)) {
      missing.push(`record ${signature.split("|")[0]}`);
    }
  });
  const remoteSessions = new Set(getActiveSessionSignatures(remote.activeSessions || {}));
  const remoteStopped = new Set(remote.stoppedSessionIds || []);
  Object.entries(normalizeActiveSessions(expected.activeSessions || {})).forEach(([, session]) => {
    if (remoteStopped.has(session.id)) {
      return;
    }
    const signature = [session.id || "", session.type || "", session.start || "", session.updatedAt || ""].join("|");
    if (!remoteSessions.has(signature)) {
      missing.push(`active ${signature.split("|")[0]}`);
    }
  });
  (expected.stoppedSessionIds || []).forEach((id) => {
    if (!remoteStopped.has(id)) {
      missing.push(`stopped ${id}`);
    }
  });
  return missing;
}

function getPayloadData(payload) {
  return payload?.data || payload || {};
}

function getRecordSignatures(records) {
  return Object.entries(records || {}).flatMap(([date, list]) =>
    (list || []).map((record) =>
      [
        record.id || "",
        date,
        record.type || "",
        record.time || "",
        record.amount || "",
        record.note || "",
        record.startTime || "",
        record.endTime || "",
        record.durationMinutes || 0,
        record.reminderMinutes || 0,
        record.foodKind || "",
        record.snackName || "",
        JSON.stringify(getFoodComponents(record)),
        record.accident ? "1" : "0",
      ].join("|")
    )
  );
}

function getRecordMergeSummary(localState, remoteState) {
  const localRecords = new Set(getRecordSignatures(localState.records || {}));
  const remoteRecords = new Set(getRecordSignatures(remoteState.records || {}));
  let localOnly = 0;
  let remoteOnly = 0;
  localRecords.forEach((signature) => {
    if (!remoteRecords.has(signature)) {
      localOnly += 1;
    }
  });
  remoteRecords.forEach((signature) => {
    if (!localRecords.has(signature)) {
      remoteOnly += 1;
    }
  });
  return { localOnly, remoteOnly };
}

function getActiveSessionSignatures(activeSessions) {
  return Object.entries(normalizeActiveSessions(activeSessions || {})).map(([type, session]) =>
    [session.id || "", type, session.start || "", session.updatedAt || ""].join("|")
  );
}

function hasFirebaseSettings() {
  return Boolean(state.sync.code && state.sync.code.length >= 12 && state.sync.firebaseConfig);
}

function startFirebaseSyncLifecycle() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (currentView === "profile") {
        saveProfileFormChanges();
      }
      appWasHidden = true;
    } else if (appWasHidden) {
      appWasHidden = false;
      handleAppResume();
    }
  });
  window.addEventListener("pageshow", (event) => handleAppResume({ force: Boolean(event.persisted) }));
  window.addEventListener("online", () => {
    if (hasPendingFirebasePush()) {
      scheduleAutoFirebaseSync(150);
    }
  });
  window.setTimeout(() => handleAppResume({ force: true }), 0);
}

async function handleAppResume({ force = false } = {}) {
  refreshAppForCurrentDay();
  const now = Date.now();
  if (resumeSyncInProgress || autoSyncInProgress || (!force && now - lastResumeSyncAt < 2500)) {
    return;
  }
  lastResumeSyncAt = now;
  if (!hasFirebaseSettings()) {
    return;
  }
  if (hasPendingFirebasePush()) {
    scheduleAutoFirebaseSync(100);
    return;
  }
  resumeSyncInProgress = true;
  try {
    await pullFirebaseSync({ confirmPending: false });
  } finally {
    resumeSyncInProgress = false;
  }
}

function mergeSyncedPayload(payload, options = {}) {
  const localPhotos = state.photos;
  const local = options.firstPull ? removeStarterSampleRecords(makeJsonSafe(state)) : makeJsonSafe(state);
  const rawRemote = getPayloadData(payload);
  const remote = migrateState(rawRemote);
  const mergeOptions = { ...options, rawRemote };
  const merged = mergeStates(local, remote, mergeOptions);
  if (hasMergedStateChanges(local, merged)) {
    createLocalBackup("before Firebase merge");
  }
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, merged);
  state.photos = localPhotos;
  syncProfileWeightFromRecords();
  persist({ skipAutoSync: true });
  hydrateMainProfile();
  hydrateProfileForm();
  refreshCurrentView();
  renderReminderSections();
}

function refreshCurrentView() {
  if (currentView === "day") {
    renderDayView();
    renderCategory();
    return;
  }
  if (currentView === "calendar") {
    renderCalendarView();
    renderCategory();
    return;
  }
  if (currentView === "bookmarks") {
    renderBookmarksView();
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

function mergeStates(local, remote, options = {}) {
  const preferRemoteDefaults = Boolean(options.preferRemoteDefaults);
  const remoteHasSection = (sectionName) => Object.prototype.hasOwnProperty.call(options.rawRemote || {}, sectionName);
  const chooseDefaultSection = (sectionName, localSection, remoteSection) =>
    preferRemoteDefaults && remoteHasSection(sectionName) ? chooseRemoteSection(localSection, remoteSection) : chooseLatestSection(localSection, remoteSection);
  const merged = migrateState({ ...remote, ...local, photos: local.photos });
  const deletedRecordIds = options.preserveRemoteRecords ? [] : Array.from(new Set(local.deletedRecordIds || []));
  const stoppedSessionIds = Array.from(new Set([...(remote.stoppedSessionIds || []), ...(local.stoppedSessionIds || [])]));
  merged.owner = chooseDefaultSection("owner", local.owner, remote.owner);
  merged.profile = chooseDefaultSection("profile", local.profile, remote.profile);
  merged.school = chooseDefaultSection("school", local.school, remote.school);
  merged.schoolSchedule = chooseDefaultSection("schoolSchedule", local.schoolSchedule, remote.schoolSchedule);
  merged.foodTimes = chooseDefaultSection("foodTimes", local.foodTimes, remote.foodTimes);
  merged.foodSettings = chooseDefaultSection("foodSettings", local.foodSettings, remote.foodSettings);
  const localSnackTime = Date.parse(local.foodSettings?.snacksUpdatedAt || "") || 0;
  const remoteSnackTime = Date.parse(remote.foodSettings?.snacksUpdatedAt || "") || 0;
  const snackSource = (preferRemoteDefaults && remoteHasSection("foodSettings")) || remoteSnackTime > localSnackTime ? remote.foodSettings : local.foodSettings;
  merged.foodSettings.snacks = normalizeSnackList(snackSource?.snacks || []);
  merged.foodSettings.snacksUpdatedAt = snackSource?.snacksUpdatedAt || "";
  merged.settings = chooseDefaultSection("settings", local.settings, remote.settings);
  merged.vaccination = chooseDefaultSection("vaccination", local.vaccination, remote.vaccination);
  merged.sync = { ...remote.sync, ...local.sync };
  merged.bookmarks = mergeBookmarks(local.bookmarks || {}, remote.bookmarks || {});
  merged.deletedRecordIds = deletedRecordIds;
  merged.stoppedSessionIds = stoppedSessionIds;
  merged.records = mergeRecords(local.records || {}, remote.records || {}, deletedRecordIds);
  merged.activeSessions = mergeActiveSessions(local.activeSessions || {}, remote.activeSessions || {}, stoppedSessionIds);
  return merged;
}

function chooseLatestSection(localSection = {}, remoteSection = {}) {
  const localTime = Date.parse(localSection?.updatedAt || "") || 0;
  const remoteTime = Date.parse(remoteSection?.updatedAt || "") || 0;
  if (remoteTime > localTime) {
    return { ...localSection, ...remoteSection };
  }
  return { ...remoteSection, ...localSection };
}

function chooseRemoteSection(localSection = {}, remoteSection = {}) {
  return { ...remoteSection };
}

function removeStarterSampleRecords(sourceState) {
  const starterIds = new Set(["sample-1", "sample-2", "sample-3", "sample-4", "sample-5", "sample-6"]);
  const records = Object.fromEntries(
    Object.entries(sourceState.records || {})
      .map(([date, list]) => [date, (list || []).filter((record) => !starterIds.has(record.id))])
      .filter(([, list]) => list.length)
  );
  return {
    ...sourceState,
    records,
    deletedRecordIds: (sourceState.deletedRecordIds || []).filter((id) => !starterIds.has(id)),
  };
}

function hasMergedStateChanges(local, merged) {
  return JSON.stringify(local.records || {}) !== JSON.stringify(merged.records || {}) ||
    JSON.stringify(normalizeActiveSessions(local.activeSessions || {})) !== JSON.stringify(normalizeActiveSessions(merged.activeSessions || {})) ||
    JSON.stringify(local.bookmarks || {}) !== JSON.stringify(merged.bookmarks || {}) ||
    JSON.stringify(local.profile || {}) !== JSON.stringify(merged.profile || {}) ||
    JSON.stringify(local.owner || {}) !== JSON.stringify(merged.owner || {}) ||
    JSON.stringify(local.school || {}) !== JSON.stringify(merged.school || {}) ||
    JSON.stringify(local.schoolSchedule || {}) !== JSON.stringify(merged.schoolSchedule || {}) ||
    JSON.stringify(local.foodTimes || {}) !== JSON.stringify(merged.foodTimes || {}) ||
    JSON.stringify(local.foodSettings || {}) !== JSON.stringify(merged.foodSettings || {}) ||
    JSON.stringify(local.vaccination || {}) !== JSON.stringify(merged.vaccination || {}) ||
    JSON.stringify(local.settings || {}) !== JSON.stringify(merged.settings || {}) ||
    JSON.stringify(local.deletedRecordIds || []) !== JSON.stringify(merged.deletedRecordIds || []) ||
    JSON.stringify(local.stoppedSessionIds || []) !== JSON.stringify(merged.stoppedSessionIds || []);
}

function mergeBookmarks(localBookmarks, remoteBookmarks) {
  const merged = {};
  const dates = new Set([...Object.keys(remoteBookmarks || {}), ...Object.keys(localBookmarks || {})]);
  dates.forEach((date) => {
    const local = normalizeBookmark(localBookmarks[date]);
    const remote = normalizeBookmark(remoteBookmarks[date]);
    if (!local) {
      merged[date] = remote;
      return;
    }
    if (!remote) {
      merged[date] = local;
      return;
    }
    const latest = local.updatedAt >= remote.updatedAt ? local : remote;
    const other = latest === local ? remote : local;
    merged[date] = {
      ...latest,
      note: latest.note || (latest.bookmarked && other.bookmarked ? other.note : ""),
    };
  });
  return Object.fromEntries(Object.entries(merged).filter(([, value]) => value));
}

function normalizeBookmark(value) {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value === "boolean") {
    return { bookmarked: value, note: "", updatedAt: "" };
  }
  return {
    bookmarked: Boolean(value.bookmarked),
    note: typeof value.note === "string" ? value.note : "",
    updatedAt: value.updatedAt || "",
  };
}

function normalizeBookmarks(bookmarks) {
  return Object.fromEntries(
    Object.entries(bookmarks || {})
      .map(([date, value]) => [date, normalizeBookmark(value)])
      .filter(([date, value]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && value)
  );
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
    getDoc: firestoreModule.getDoc,
    runTransaction: firestoreModule.runTransaction,
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
  if (event.touches.length !== 1 || pullRefreshInProgress) {
    touchGestureActive = false;
    touchTrackingPull = false;
    return;
  }
  touchGestureActive = true;
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartScrollY = Math.max(0, window.scrollY || document.scrollingElement?.scrollTop || document.documentElement.scrollTop || 0);
  touchMaxPullY = 0;
  touchMaxHorizontal = 0;
  touchTrackingPull = touchStartScrollY <= 8 && !isEditableElement(event.target);
}

function handleTouchMove(event) {
  if (!touchTrackingPull || event.touches.length !== 1) {
    return;
  }
  const touch = event.touches[0];
  const pullDistance = touch.clientY - touchStartY;
  const horizontalDistance = Math.abs(touch.clientX - touchStartX);
  touchMaxPullY = Math.max(touchMaxPullY, pullDistance);
  touchMaxHorizontal = Math.max(touchMaxHorizontal, horizontalDistance);

  if (touchMaxHorizontal > 96) {
    hidePullRefreshIndicator();
    return;
  }
  if (touchMaxPullY >= 44) {
    touchTrackingPull = false;
    touchGestureActive = false;
    elements.pullRefreshIndicator.textContent = "Refreshing and merging...";
    elements.pullRefreshIndicator.classList.add("ready");
    elements.pullRefreshIndicator.hidden = false;
    refreshFromPullGesture();
    return;
  }
  if (touchMaxPullY < 14) {
    hidePullRefreshIndicator();
    return;
  }
  elements.pullRefreshIndicator.textContent = "Pull a little farther";
  elements.pullRefreshIndicator.classList.remove("ready");
  elements.pullRefreshIndicator.hidden = false;
}

function handleTouchEnd(event) {
  if (!touchGestureActive) {
    return;
  }
  touchGestureActive = false;
  if (!touchTrackingPull && isEditableElement(event.target)) {
    return;
  }

  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const rawDeltaY = touch.clientY - touchStartY;
  const deltaY = Math.abs(rawDeltaY);
  const pullDown = touchTrackingPull && Math.max(rawDeltaY, touchMaxPullY) >= 44 && Math.max(Math.abs(deltaX), touchMaxHorizontal) < 96;
  hidePullRefreshIndicator();
  touchTrackingPull = false;

  if (pullDown) {
    refreshFromPullGesture();
    return;
  }

  if (currentView === "main") {
    return;
  }

  const edgeSwipe = touchStartX <= 48 && deltaX > 80 && deltaY < 55;
  const broadSwipe = deltaX > 130 && deltaY < 45;

  if (edgeSwipe || broadSwipe) {
    showMainView();
  }
}

function cancelPullGesture() {
  touchGestureActive = false;
  touchTrackingPull = false;
  hidePullRefreshIndicator();
}

function hidePullRefreshIndicator() {
  elements.pullRefreshIndicator.hidden = true;
  elements.pullRefreshIndicator.classList.remove("ready");
}

async function refreshFromPullGesture() {
  if (pullRefreshInProgress) {
    return;
  }
  pullRefreshInProgress = true;
  refreshAppForCurrentDay();
  try {
    if (!hasFirebaseSettings()) {
      refreshCurrentView();
      showToast("Refreshed this phone. Add Firebase sync settings to pull shared data.");
      return;
    }

    showToast(hasPendingFirebasePush() ? "Merging saved phone data with Firebase..." : "Pulling latest puppy book...");
    const refreshed = await pullFirebaseSync({ confirmPending: false });
    refreshTodayContext({ resetMainDate: currentView === "main" });
    refreshCurrentView();
    if (refreshed) {
      showToast("Refresh and sync complete.");
    }
  } finally {
    pullRefreshInProgress = false;
    hidePullRefreshIndicator();
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

function getCurrentTimeValue() {
  return new Date().toTimeString().slice(0, 5);
}

function resetRecordTimeToNow() {
  const now = getCurrentTimeValue();
  elements.recordTime.value = now;
  elements.recordStartTime.value = now;
  elements.recordEndTime.value = "";
  elements.recordDuration.value = "";
  updateVetReminderPreview();
}

function resetCalendarEditorTimeToNow() {
  const now = getCurrentTimeValue();
  elements.calendarEditorTime.value = now;
  elements.calendarEditorStartTime.value = now;
  elements.calendarEditorEndTime.value = "";
  elements.calendarEditorDuration.value = "";
  updateCalendarVetReminderPreview();
}

function syncFoodKindFields() {
  const isSnack = activeType === "food" && elements.foodKind.value === "snack";
  elements.snackNameField.hidden = !isSnack;
  populateSnackSelect(elements.snackName, elements.snackName.value);
  if (isSnack) {
    elements.recordNote.value = "";
  }
  elements.recordNote.placeholder = isSnack ? "" : notePlaceholder;
}

function syncCalendarFoodKindFields() {
  const isSnack = activeCalendarType === "food" && elements.calendarFoodKind.value === "snack";
  elements.calendarSnackNameField.hidden = !isSnack;
  populateSnackSelect(elements.calendarSnackName, elements.calendarSnackName.value);
  if (isSnack) {
    elements.calendarEditorNote.value = "";
  }
  elements.calendarEditorNote.placeholder = isSnack ? "" : notePlaceholder;
}

function populateSnackSelect(select, preferred = "") {
  if (!select) {
    return;
  }
  const snacks = getSnackOptions();
  const normalizedPreferred = String(preferred || "").trim();
  const options = snacks.length
    ? normalizedPreferred && !snacks.includes(normalizedPreferred)
      ? [normalizedPreferred, ...snacks]
      : snacks
    : normalizedPreferred
      ? [normalizedPreferred]
      : ["Add snacks in settings"];
  select.innerHTML = options.map((snack) => `<option value="${escapeHtml(snack)}">${escapeHtml(snack)}</option>`).join("");
  select.disabled = !snacks.length && !normalizedPreferred;
  if (normalizedPreferred && options.includes(normalizedPreferred)) {
    select.value = normalizedPreferred;
  } else {
    select.value = snacks[0] || "";
  }
}

function getSnackOptions() {
  return normalizeSnackList(state.foodSettings?.snacks);
}

function normalizeSnackList(value) {
  const raw = Array.isArray(value) ? value : String(value || "").split(/[\n,]/);
  const seen = new Set();
  return raw
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 30);
}

function updateAmountField() {
  elements.amountField.childNodes[0].nodeValue = `${typeConfig[activeType].amount} `;
  elements.recordAmount.placeholder = typeConfig[activeType].placeholder;
  elements.amountField.hidden = activeType === "vaccine";
  elements.foodKindField.hidden = activeType !== "food";
  elements.vetKindField.hidden = activeType !== "vaccine";
  elements.vetReminderField.hidden = activeType !== "vaccine";
  updateVetReminderPreview();
  syncFoodKindFields();
  syncAccidentFieldVisibility();
  syncDurationVisibility();
  if (timedRecordTypes.includes(activeType)) {
    elements.recordStartTime.value = elements.recordStartTime.value || elements.recordTime.value || new Date().toTimeString().slice(0, 5);
  }
}

function syncAccidentFieldVisibility() {
  const show = ["pee", "poop"].includes(activeType);
  elements.accidentField.hidden = !show;
  if (!show) {
    elements.recordAccident.checked = false;
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
        .map((record) => ({ date, time: record.time || "", id: record.id, value: parseWeight(record.amount) }))
    )
    .filter((record) => Number.isFinite(record.value))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
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
      updatedAt: "",
    },
    owner: { name: "", updatedAt: "" },
    school: { name: "", trainer: "", contact: "", notes: "", updatedAt: "" },
    schoolSchedule: { weekday: 6, time: "18:00", startDate: key, endDate: "", updatedAt: "" },
    foodTimes: { morning: "07:30", afternoon: "", evening: "18:30", updatedAt: "" },
    foodSettings: {
      targetMode: "josera",
      type: "Josera YoungStar dry food",
      type2: "",
      snacks: defaultSnackList,
      snacksUpdatedAt: "",
      reminderMinutes: 5,
      dailyTargetGrams: 223,
      expectedAdultWeightKg: 30,
      estimatedAdultWeightKg: 0,
      estimatedAdultWeightConfidence: "",
      useEstimatedAdultWeight: false,
      autoTarget: true,
      recommendationWeek: "",
      recommendationRange: "205-240g",
      recommendationSource: "Josera YoungStar",
      amounts: { morning: "110g", afternoon: "", evening: "120g" },
      secondAmounts: { morning: "", afternoon: "", evening: "" },
      updatedAt: "",
    },
    sync: { code: "", firebaseConfig: "", lastSync: "" },
    activeSessions: {},
    stoppedSessionIds: [],
    deletedRecordIds: [],
    bookmarks: {},
    vaccination: { rabiesDate: "", rabiesValidUntil: "", updatedAt: "" },
    settings: { vaccineAlarmEnabled: false, schoolAlarmEnabled: false, foodAlarmEnabled: false, lastNotificationKey: "", updatedAt: "" },
    photos: [],
    records: {
      [key]: [
        { id: "sample-1", type: "food", time: "07:30", amount: "110g", note: "Breakfast", foodKind: "food" },
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
  const hasSnackSettings = Boolean(value.foodSettings) && Object.prototype.hasOwnProperty.call(value.foodSettings, "snacks");
  const migratedSnacks = hasSnackSettings ? normalizeSnackList(value.foodSettings.snacks) : defaultSnackList;

  return {
    profile: {
      name: migratedName,
      birthday: migratedBirthday || shiftMonthKey(today, -ageMonths),
      breed: profile.breed || "",
      weightKg: legacyWeight,
      notes: profile.notes || "",
      updatedAt: profile.updatedAt || "",
    },
    owner: {
      name: value.owner?.name || "",
      updatedAt: value.owner?.updatedAt || "",
    },
    school: {
      name: value.school?.name || "",
      trainer: value.school?.trainer || "",
      contact: value.school?.contact || "",
      notes: value.school?.notes || "",
      updatedAt: value.school?.updatedAt || "",
    },
    schoolSchedule: {
      weekday: Number(value.schoolSchedule?.weekday ?? 6),
      time: value.schoolSchedule?.time || "18:00",
      startDate: value.schoolSchedule?.startDate || "",
      endDate: value.schoolSchedule?.endDate || "",
      updatedAt: value.schoolSchedule?.updatedAt || "",
    },
    foodTimes: {
      morning: value.foodTimes?.morning || "07:30",
      afternoon: value.foodTimes?.afternoon || "",
      evening: value.foodTimes?.evening || "18:30",
      updatedAt: value.foodTimes?.updatedAt || "",
    },
    foodSettings: {
      targetMode: value.foodSettings?.targetMode === "manual" || value.foodSettings?.autoTarget === false ? "manual" : "josera",
      type: value.foodSettings?.type || "",
      type2: value.foodSettings?.type2 || "",
      snacks: migratedSnacks,
      snacksUpdatedAt: value.foodSettings?.snacksUpdatedAt || "",
      reminderMinutes: Number.isFinite(Number(value.foodSettings?.reminderMinutes)) ? Number(value.foodSettings.reminderMinutes) : 5,
      dailyTargetGrams: Number.isFinite(Number(value.foodSettings?.dailyTargetGrams)) ? Number(value.foodSettings.dailyTargetGrams) : 223,
      expectedAdultWeightKg: Number.isFinite(Number(value.foodSettings?.expectedAdultWeightKg)) ? Number(value.foodSettings.expectedAdultWeightKg) : 30,
      estimatedAdultWeightKg: Number.isFinite(Number(value.foodSettings?.estimatedAdultWeightKg)) ? Number(value.foodSettings.estimatedAdultWeightKg) : 0,
      estimatedAdultWeightConfidence: value.foodSettings?.estimatedAdultWeightConfidence || "",
      useEstimatedAdultWeight: Boolean(value.foodSettings?.useEstimatedAdultWeight),
      autoTarget: value.foodSettings?.targetMode ? value.foodSettings.targetMode !== "manual" : value.foodSettings?.autoTarget !== false,
      recommendationWeek: value.foodSettings?.recommendationWeek || "",
      recommendationRange: value.foodSettings?.recommendationRange || "",
      recommendationSource: value.foodSettings?.recommendationSource || "Josera YoungStar",
      amounts: {
        morning: value.foodSettings?.amounts?.morning || "",
        afternoon: value.foodSettings?.amounts?.afternoon || "",
        evening: value.foodSettings?.amounts?.evening || "",
      },
      secondAmounts: {
        morning: value.foodSettings?.secondAmounts?.morning || "",
        afternoon: value.foodSettings?.secondAmounts?.afternoon || "",
        evening: value.foodSettings?.secondAmounts?.evening || "",
      },
      updatedAt: value.foodSettings?.updatedAt || "",
    },
    sync: {
      code: value.sync?.code || "",
      firebaseConfig: value.sync?.firebaseConfig || "",
      lastSync: value.sync?.lastSync || "",
    },
    activeSessions: normalizeActiveSessions(value.activeSessions || {}),
    stoppedSessionIds: Array.isArray(value.stoppedSessionIds) ? value.stoppedSessionIds : [],
    deletedRecordIds: Array.isArray(value.deletedRecordIds) ? value.deletedRecordIds : [],
    bookmarks: normalizeBookmarks(value.bookmarks || {}),
    vaccination: {
      rabiesDate: value.vaccination?.rabiesDate || "",
      rabiesValidUntil: value.vaccination?.rabiesValidUntil || "",
      updatedAt: value.vaccination?.updatedAt || "",
    },
    settings: {
      vaccineAlarmEnabled: Boolean(value.settings?.vaccineAlarmEnabled),
      schoolAlarmEnabled: Boolean(value.settings?.schoolAlarmEnabled),
      foodAlarmEnabled: Boolean(value.settings?.foodAlarmEnabled),
      lastNotificationKey: value.settings?.lastNotificationKey || "",
      updatedAt: value.settings?.updatedAt || "",
    },
    photos: photos.slice(0, 1),
    records: value.records || {},
  };
}

function persist(options = {}) {
  persistOptions = options;
  let serializedState = JSON.stringify(state);
  if (!options.force && serializedState === lastPersistedStateJson) {
    persistOptions = {};
    return true;
  }
  let saved = false;
  try {
    localStorage.setItem(storageKey, serializedState);
    saved = true;
  } catch (error) {
    if (state.photos.length) {
      state.photos = [];
      elements.heroPhoto.src = defaultPhoto;
      try {
        serializedState = JSON.stringify(state);
        localStorage.setItem(storageKey, serializedState);
        saved = true;
        showToast("Local storage was full, so the profile photo was removed. Records were kept.", 9000);
      } catch {
        saved = false;
      }
    }
  }
  if (!saved) {
    renderSyncStatus("Local save failed. Do not close the app; export your records and free device storage.");
    showToast("Local save failed. Do not close the app; export your records first.", 12000);
  } else {
    lastPersistedStateJson = serializedState;
    if (!options.skipAutoSync) {
      localChangeRevision += 1;
      markFirebasePushPending();
    }
    if (!options.skipRecoveryBackup) {
      createLocalBackup("local save");
    }
    scheduleAutoFirebaseSync();
  }
  persistOptions = {};
  return saved;
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

function formatLongDate(date) {
  return date.toLocaleDateString("en", {
    month: "long",
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

  navigator.serviceWorker
    .register("./sw.js", { updateViaCache: "none" })
    .then((registration) => registration.update())
    .catch(() => {
      // Offline support is a nice-to-have; the app should still run without it.
    });
}
