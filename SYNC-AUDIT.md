# Sync and Data-Safety Audit

Reviewed: 2026-10-27. Scope: the iPhone/iPad PWA, browser quick widget, and Windows native mini app, focusing on local saves, Firestore transactions, merges, recovery, and record editing. This is a focused code and synthetic-test audit, not a guarantee that every app feature or all production conditions are safe.

## Fixed In This Workspace

1. Windows previously deserialized only known record fields, silently skipping malformed records and stripping unknown fields when it rewrote the shared Firestore document. The new client validates its input and stops with an error instead of overwriting unsupported data. It also updates only `bookData` and `updatedAt`, preserving unrelated Firestore document fields.
2. Windows now merges record IDs across dates, preserves locally edited first-sync settings, queues local-only data discovered by a pull, and verifies profile, settings and bookmark content in its write receipt. Its local-save failure is visible and leaves the change pending. Recovery does not replace a good `.bak` with a corrupt primary file.
3. Browser sync now checks the confirmed server copy for record dates, active-timer IDs, profile, food settings and bookmarks as well as records and tombstones. Changing Firebase settings during a request prevents the old target's response from being applied to the new one.
4. The browser quick widget no longer overwrites an unreadable saved book with an empty one. The main app refuses to overwrite an unreadable save from another window. A failed quick-widget local confirmation remains pending and cannot be reported as synced.
5. First sync retains newer locally edited settings and deletion markers. Blank feeding times and a puppy named Mochi are no longer silently changed during migration. Windows keeps decimal weight and feeding targets under German regional settings.
6. A large-book warning uses JSON UTF-8 bytes as an approximate indicator; it is not an exact Firestore-size measurement.
7. The main app can export a private JSON book backup and merge it back later. The file preserves records, profile, bookmarks and settings but excludes credentials, sync code and thumbnail. Restored missing records receive new IDs to survive old deletion markers; this can create duplicates. Restore deliberately keeps current running timers and deletion markers instead of applying stale ones from the backup.

## Important Remaining Risks

- **One-document storage:** the complete book is rewritten as one Firestore document. Firestore's [document limit is 1 MiB](https://firebase.google.com/docs/firestore/quotas). More records and tombstones can eventually prevent writes; contention and transfer size also grow. A multi-document design needs a migration that remains compatible with all devices and includes a recovery plan. It was not attempted against real user data in this audit.
- **Backups are manual and have limits:** Excel/CSV export includes records, but not profile, bookmarks, timers, deletion markers, settings or thumbnail. The JSON book backup covers profile, bookmarks and settings as well, but excludes credentials and thumbnail; its restore deliberately does not reapply old timers or deletion history. It must be exported and stored outside the app. Device-local snapshots can be lost with browser storage. Do not treat a CSV export as a complete backup.
- **Concurrent edits and device clocks:** the current model uses device timestamps and one running timer per category. Clock skew, simultaneous offline edits, and simultaneous starts of the same timer can produce conflicts or duplicates, and two offline starts of the same category cannot both be represented as active timers. It is not a conflict-free data model.
- **Deletion markers are permanent:** older clients may reapply them to old records. The new recovery flow re-IDs missing records, but can introduce duplicates when another device already has them; recovery must be tested with the cloud and all clients before relying on it.
- **Authentication:** the example rules in `PWA-SYNC.md` rely on anonymous authentication plus knowledge of the shared sync code. Anyone with access to the project and that code could read or modify the book. Those example rules are not a per-user authorization system; the actual deployed rules were not inspected during this audit.
- **Old clients:** previously installed desktop widgets or stale PWA versions can continue to sync with older logic. Keep all devices updated; don't assume a changed server document alone upgrades every client.
- **Independent recovery:** this audit did not access the user's local book or live Firestore data and cannot recover records that have already been deleted. Existing local snapshots, CSV exports, and any Firebase backups must be inspected separately, without overwriting them.

## Verification And Release

Tests use synthetic fixtures only: `node --test tests/sync.test.cjs`, and `dotnet NativeWidget/bin/Release/native-widget-v30/PuppyQuickLog.dll --self-test` after building. They simulate concurrency and failures but do not test the real Firestore service, deployed rules, real credentials, physical iPhone/iPad, or the Windows GUI. The Firebase emulator was unavailable on this machine (Java/Firebase CLI were not installed).

Web v109 and Windows v30 are local changes; publishing GitHub Pages or replacing a running widget is a separate step. Export records from each device first, keep unsynced devices intact, and do not uninstall the PWA or clear storage. After deployment, update all clients and verify a test record in both directions while preserving backups. Never assume a successful build proves that no future data loss can occur.
