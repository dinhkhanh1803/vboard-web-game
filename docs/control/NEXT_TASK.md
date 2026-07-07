# Next Task

## Current Recommended Next Step

Finish BE-2 local emulator verification before moving to BE-3. The Firestore rules and emulator test suite are in place, but this machine does not currently have Java on `PATH`, so Firebase Emulator cannot start yet.

## Exact First Task

Install or configure a Java runtime on `PATH`, then run `npm run test:rules`. After that passes, continue to BE-3: client intent boundary for room/match callable calls.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep callable Functions as the only official writer for room/match state.
- Do not change high-fidelity UI except for minimal wiring after rules and callable contracts are verified.

## Expected Files

- No code files should need to change for the Java verification step.
- If the verification exposes a rules bug, update `firebase/firestore.rules` and `tests/firebaseRules.test.ts` only.
- Update `docs/control/PROGRESS.md` after `npm run test:rules` runs successfully.

## Verification

Make these commands pass:

```bash
npm run test:rules
npm run typecheck
npm run lint
npm run build
npm run test
```
