# Next Task

## Current Recommended Next Step

Move to BE-3: client intent boundary for room/match callable calls. BE-1 callable Functions exist, and BE-2 Firestore rules plus emulator rules tests have been verified locally.

## Exact First Task

Add a frontend Firebase intent boundary for room/match workflows. The client should call callable Functions for `createRoom`, `joinRoom`, `startMatch`, and `submitMove`; it must not write official room, match, result, turn, timer, ranking, or move-log state directly.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep the work focused on client callable wrappers and tests.
- Do not change high-fidelity UI except for minimal wiring after the callable client boundary is stable.

## Expected Files

- `src/firebase/`
- `src/features/lobby/` only if a local intent boundary test needs route-level proof
- `src/features/match/` only if a local intent boundary test needs route-level proof
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run test:rules
npm run typecheck
npm run lint
npm run build
npm run test
```
