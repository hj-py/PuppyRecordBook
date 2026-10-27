# Puppy Record Book PWA and Sync

## October 2026 Editing Update (Web v108 / Windows v29)

- Windows: select Edit beside a log to change its date, time, amount and note. Press Enter to save, Escape to cancel, or Shift+Enter for a new line in a note. Enter while the date calendar is open selects the date instead of saving.
- Food records support editing grams. Mixed meals show separate amounts for each food and automatically recalculate the total. Snack amounts can remain empty or descriptive, such as `1 piece`.
- Both Windows and the iPhone/iPad web app preserve food-component names and personal notes while editing. Generated mixed-meal descriptions are updated to match the new amounts.
- Both decimal commas and decimal points are supported. Windows no longer treats a decimal point as a thousands separator under German regional settings.
- Calendar edits can move a record to another day without losing its food breakdown. Incoming sync data does not replace an open calendar editing draft. If another device removed the original record, saving asks you to reopen the latest version instead of bringing it back.
- Windows refreshes its Today list when the day changes. The build includes Leo's window/tray icon.

### Install The Update

Windows: exit the old widget using its tray menu, then run `NativeWidget/launch-native-widget.ps1` (or the existing desktop shortcut pointing to it). It selects v29 and keeps the same saved data and Firebase settings. Do not delete the app's data folder. The compiled executable is `NativeWidget/bin/Release/native-widget-v29/PuppyQuickLog.exe`; keep its companion files together.

iPhone/iPad: publish the updated web files to the same GitHub Pages location, including the new `record-editing.js`, `sync-core.js`, and `sw.js`, alongside the HTML, CSS, other JavaScript, manifest and icons. Reopen the existing home-screen app online after deployment completes. If an old screen remains, close and reopen it once more. Do not remove the home-screen app or clear browser storage to update. The iPhone/iPad release remains a PWA, not a compiled native iOS app.

Validation: `node --test tests/sync.test.cjs` (31 tests); build the Windows project and run `dotnet NativeWidget/bin/Release/native-widget-v29/PuppyQuickLog.dll --self-test` (20 checks). These use synthetic records, not your saved book or live Firebase. Physical iPhone/iPad UI behavior and live Firebase access have not been tested in this update.

## September 2026 Sync Update (Web v107 / Windows v28)

- Push, pull, and automatic sync run one at a time; repeated requests are combined.
- Local saves include a pending-change marker. It is cleared only after server confirmation, and not if a newer edit arrived during the request.
- Merges retain records from both devices, honor explicit deletions and timer stops, and prefer newer record versions. Stopping the same timer from two updated devices produces one completed record.
- The browser quick widget preserves profile fields and update timestamps. The Windows widget also merges bookmarks correctly after reopening its saved JSON file.
- Offline changes retry with backoff while the app is running and when it is reopened. A PWA cannot perform reliable background retries while iOS has suspended it. Permission, quota, and configuration errors may require action; retries cannot fix those settings.
- The home-page sync status distinguishes a local save from a Firebase-confirmed save. Do not clear browser storage or reinstall to troubleshoot an unsynced book.

Publish the updated HTML, JavaScript, CSS and service worker together, including `sync-core.js`. Update every phone/browser that shares the book. Exit the Windows widget from its tray menu, then use its launcher to open v28. The current launcher selects the newest built version; it keeps the existing data file.

Validation: `node --test tests/sync.test.cjs`; build the Windows project and run `dotnet NativeWidget/bin/Release/native-widget-v28/PuppyQuickLog.dll --self-test`. Tests use synthetic data only. Live Firebase permissions, remaining quota and iOS background behavior are not covered by these tests.

## Walk Recording

Walk uses manual Start/Stop. The PWA's foreground-only GPS feature has been removed in v107. The app no longer requests or watches location, and removes its old device-only location settings on startup. Existing walk records and running timers are retained.

Reference: [Firebase transactions](https://firebase.google.com/docs/firestore/manage-data/transactions).

## Use On iPhone

1. Host this folder on a web host such as Netlify, Vercel, GitHub Pages, or your own server.
2. Open the hosted URL in Safari on iPhone.
3. Tap `Share`.
4. Tap `Add to Home Screen`.

The app is PWA-ready with:

- `manifest.json`
- `sw.js` offline cache
- home-screen display mode
- local storage for puppy records

## Backup And Import

On the settings gear > `App & Sync` section:

- `Export Excel` saves records for analysis or backup.
- `Import Excel` merges a compatible spreadsheet with existing records.
- `Recover Backup` offers local recovery snapshots when available.

These controls do not replace Firebase sharing or its pending-change queue.

## Free Sync With Firebase Spark

Firebase Spark is Google's no-cost plan. Cloud Firestore has a free quota for one database per project, including daily free reads/writes and 1 GiB stored data. See Firebase's official pricing page for current limits: https://firebase.google.com/pricing

### Firebase Setup

1. Go to https://console.firebase.google.com/
2. Create a project.
3. Open `Build > Firestore Database`.
4. Create a Firestore database.
5. Choose a region.
6. Open `Build > Authentication`.
7. Go to `Sign-in method`.
8. Enable `Anonymous`.
9. Return to Firestore and replace rules with the rules below.
10. Open `Project settings > General`.
11. Under `Your apps`, add a Web app.
12. Copy the Firebase config object. It looks like:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

13. In Puppy Record Book, open the settings gear > `App & Sync`.
14. Put a private `Sync code`, for example `leo-family-8392`.
15. Paste either the full Firebase config snippet or only the JSON object into `Firebase config JSON`.

This app accepts the full snippet:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

It also accepts strict JSON:

```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}
```

16. Tap `Push Firebase` on the phone with the latest data.
17. Tap `Pull Firebase` on the other phone.

After the Firebase config and sync code are saved, the app also auto-syncs after edits. It pulls the shared book first, merges records by record ID, and pushes the merged copy back to Firebase. Photos are not included in Firebase sync.

The Firebase config is not hardcoded in the app files. It is saved locally in the browser/app storage on each phone. It is not included in Firebase sync payloads or Excel/JSON exports.

### Firestore Rules

Use these rules for the simple shared-code version:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /puppy_books/{syncCode} {
      allow read, write: if request.auth != null && syncCode.size() >= 12;
    }
  }
}
```

Important: this keeps the app simple. It uses Firebase Anonymous Authentication, so anyone with the Firebase config and your long sync code could access that shared puppy book. Use a long random sync code.

The main puppy thumbnail stays only on each phone and is not pushed or pulled with Firebase sync. The `Excel` button exports records as an Excel-readable CSV file.
