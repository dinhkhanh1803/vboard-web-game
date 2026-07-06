# Cross-Package Tests

This folder owns tests that span app, functions, Firebase rules, or future emulator workflows.

## Current Tests

- `tests/firebaseRules.test.ts` checks that Firestore, Storage, and Realtime Database rules stay closed by default.

Run all tests with:

```bash
npm run test
```

Run the Firebase foundation tests only with:

```bash
npm run test -- src/firebase/config.test.ts functions/test/firebaseAdmin.test.ts tests/firebaseRules.test.ts
```

## Later Emulator Tests

Near-term candidates:

- Firebase emulator security rules tests using the official Rules Unit Testing SDK.
- End-to-end room lifecycle tests.
- Realtime two-client match tests.
- Production readiness smoke tests.

Do not point these tests at a real Firebase project unless the owner explicitly approves that setup.
