# Cross-Package Tests

This folder owns tests that span app, functions, Firebase rules, or future emulator workflows.

## Current Tests

- `tests/firebaseRules.test.ts` checks Storage and Realtime Database stay closed and contains emulator-backed Firestore tests for room/match reads and client write denial.

Run all tests with:

```bash
npm run test
```

Run Firestore emulator rules tests with Java on `PATH`:

```bash
npm run test:rules
```

Run the Firebase foundation tests only with:

```bash
npm run test -- src/firebase/config.test.ts functions/test/firebaseAdmin.test.ts tests/firebaseRules.test.ts
```

## Later Emulator Tests

Near-term candidates:

- End-to-end room lifecycle tests.
- Realtime two-client match tests.
- Production readiness smoke tests.

Do not point these tests at a real Firebase project unless the owner explicitly approves that setup.
