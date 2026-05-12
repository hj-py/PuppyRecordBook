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

On the `T > App & Sync` section:

- `Export` saves a JSON backup.
- `Import` loads that JSON backup on another phone.

This is the easiest sync method without a cloud database.

## Real Multi-User Cloud Sync With Supabase

Create a Supabase project, then run this SQL in the Supabase SQL editor:

```sql
create table puppy_books (
  sync_code text primary key,
  book_data jsonb not null,
  updated_at timestamptz default now()
);

alter table puppy_books enable row level security;

create policy "Anyone can read puppy books by anon key"
on puppy_books for select
to anon
using (true);

create policy "Anyone can insert puppy books by anon key"
on puppy_books for insert
to anon
with check (true);

create policy "Anyone can update puppy books by anon key"
on puppy_books for update
to anon
using (true)
with check (true);
```

Then in the app:

1. Open `T > App & Sync`.
2. Enter the same `Sync code` on each phone, for example `mochi-family`.
3. Enter the Supabase project URL.
4. Enter the Supabase anon key.
5. Tap `Push` on the phone with the latest data.
6. Tap `Pull` on another phone.

Important: this simple shared-code model is convenient for family use, but anyone with the Supabase URL, anon key, and sync code can access that puppy book. Use a private/random sync code.

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

13. In Puppy Record Book, open `T > App & Sync`.
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

The main puppy thumbnail stays only on each phone and is not pushed or pulled with Firebase sync.
