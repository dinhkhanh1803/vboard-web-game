# Next Task

## Current Recommended Next Step

Continue Phase 6 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: define game catalog contracts before any Firestore writes exist.

## Exact First Task

Define TypeScript contracts for `games/{gameId}` metadata covering Connect 4 and Caro.

## Scope

- Define game IDs, game status, player counts, rules route, enabled flag, and display metadata.
- Keep this contract-only; do not write Firestore documents yet.
- Do not create or configure any real Firebase project yet.
- Keep gameplay rules, PixiJS rendering, matchmaking, and Cloud Functions callables out of scope.

## Expected Files

- `contracts/`
- `docs/firebase-model.md`
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run build
npm run test
```
