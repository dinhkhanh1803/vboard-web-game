# Cross-Package Tests

This folder owns tests that span app, functions, Firebase rules, or future emulator workflows.

## Current Tests

- `tests/firebaseRules.test.ts` checks Storage and Realtime Database stay closed and contains emulator-backed Firestore tests for room/match reads and client write denial.
- `tests/authenticatedRoomMatchSmokeFlow.test.ts` checks the local smoke-flow contract without starting emulators.
- `tests/authenticatedRoomMatchSmoke.emulator.test.ts` runs only when Auth and Firestore emulator env vars exist. It signs in anonymous host/guest users through the Auth emulator, runs the room/match callable handlers against Firestore emulator transactions, and verifies the written room, match, and move log.
- `tests/roomMatchCallableEndpointSmoke.emulator.test.ts` runs through the frontend Firebase Auth, callable intent, and read boundaries against Auth, Firestore, and Functions emulators.

Run all tests with:

```bash
npm run test
```

Run Firestore emulator rules tests with Java on `PATH`:

```bash
npm run test:rules
```

Run the authenticated room/match smoke flow with Java on `PATH`:

```bash
npm run test:smoke:auth-flow
```

Run the callable endpoint smoke flow with Java on `PATH`:

```bash
npm run test:smoke:callable-endpoints
```

The Firebase Admin SDK may print a local metadata lookup warning after emulator shutdown on Windows; the smoke result is controlled by the command exit code and Vitest pass/fail output.

Run the Firebase foundation tests only with:

```bash
npm run test -- src/firebase/config.test.ts functions/test/firebaseAdmin.test.ts tests/firebaseRules.test.ts
```

## Later Emulator Tests

Near-term candidates:

- Realtime two-client match tests.
- Production readiness smoke tests.

Do not point these tests at a real Firebase project unless the owner explicitly approves that setup.
