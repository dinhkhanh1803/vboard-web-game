# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-13: make the Cloud Functions emulator expose the callable room/match endpoints as a runnable local endpoint smoke. BE-12 now proves Auth emulator anonymous users plus Firestore transaction-backed callable handlers can create, join, start, and submit one Connect 4 move.

## Exact First Task

Add the smallest Functions emulator packaging/build path needed so `createRoom`, `joinRoom`, `startMatch`, and `submitMove` can be invoked through Firebase callable endpoints locally, then add a smoke command that uses the frontend callable client boundary against the Auth, Firestore, and Functions emulators.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep existing local demo routes working without Firebase Auth.
- Keep clients submitting official room/match intent only through callable wrappers.
- Keep clients reading room, match, and move-log documents only through Firebase read boundaries.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Avoid broad build-system refactors; add only the minimal Functions emulator build/entrypoint path required for local callable endpoint smoke.

## Expected Files

- `functions/` for minimal emulator-build or entrypoint wiring if needed.
- `tests/` for callable endpoint smoke coverage.
- `package.json` for a focused smoke command if needed.
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run test:smoke:auth-flow
npm run test:rules
npm run typecheck
npm run lint
npm run build
npm run test
```
