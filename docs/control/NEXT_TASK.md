# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-14: prove the official web app flow can use the callable endpoint boundary locally. BE-13 now builds the Functions emulator entrypoint and proves `createRoom`, `joinRoom`, `startMatch`, and `submitMove` through Auth, Firestore, and Functions emulators.

## Exact First Task

Add the smallest UI/local smoke path that signs into the Firebase Auth emulator, creates or joins a Connect 4 room from the existing frontend route boundary, starts the match, submits one official move, and reads the official match/move-log state back through the existing read boundary.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep existing local demo routes working without Firebase Auth.
- Keep clients submitting official room/match intent only through callable wrappers.
- Keep clients reading room, match, and move-log documents only through Firebase read boundaries.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Avoid adding browser automation dependencies unless the task explicitly needs them; prefer existing Vitest/React Testing Library coverage first.

## Expected Files

- `src/features/lobby/` and `src/features/match/` only if the existing route flow needs small wiring fixes.
- `src/firebase/` only if the local Auth/emulator boundary needs a focused helper.
- `tests/` for a cross-area smoke or integration test if route-level verification is practical.
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run test:smoke:callable-endpoints
npm run test:smoke:auth-flow
npm run test:rules
npm run typecheck
npm run lint
npm run build
npm run test
```
