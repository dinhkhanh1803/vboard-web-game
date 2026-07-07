# Next Task

## Current Recommended Next Step

Continue backend integration after BE-1. The next backend focus is emulator-backed Firestore rules for room and match reads while keeping official writes server-only.

## Exact First Task

Implement BE-2: add Firestore rules and tests for room/match access. Clients may read the public room/match data they need, but clients must not write official room, match, result, turn, timer, ranking, or move-log state directly.

## Scope

- Backend-first only.
- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Use local rules tests and emulator-ready paths.
- Keep callable Functions as the only official writer for room/match state.
- Do not change high-fidelity UI except for minimal wiring after rules and callable contracts are stable.

## Expected Files

- `firebase/firestore.rules`
- `tests/firebaseRules.test.ts`
- `contracts/roomMatch.ts` only if rule tests expose a missing path constant
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run typecheck
npm run lint
npm run build
npm run test
```
