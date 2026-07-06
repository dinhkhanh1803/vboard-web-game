# Firebase Workspace

This folder owns Firebase rules, indexes, and local emulator wiring.

## Files

- `firestore.rules`: closed-by-default Firestore rules.
- `storage.rules`: closed-by-default Storage rules.
- `database.rules.json`: closed-by-default Realtime Database rules.
- `firestore.indexes.json`: empty index baseline.

## Local-First Rule

No real Firebase project is configured in this repository yet. Do not create `.firebaserc`, commit production project IDs, or deploy until the owner explicitly approves that setup.

Copy `.firebaserc.example` to `.firebaserc` only after real Firebase project IDs are created for dev, staging, and production.

## Emulator Commands

```bash
npm run firebase:emulators
npm run firebase:emulators:ui
```

The web app reads emulator host settings from `.env.example` / `.env.local` keys such as `VITE_USE_FIREBASE_EMULATORS`, `VITE_FIRESTORE_EMULATOR_HOST`, and `VITE_AUTH_EMULATOR_HOST`.

Rules are currently locked down and covered by `tests/firebaseRules.test.ts`.
