# Puppy Record Book PWA and Sync

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

## Manual Sync

On the settings gear > `App & Sync` section:

- `Export` saves a JSON backup.
- `Import` loads that JSON backup on another phone.

This is the easiest sync method without a cloud database.

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
