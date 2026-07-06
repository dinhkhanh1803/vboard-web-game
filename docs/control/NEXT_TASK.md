# Next Task

## Current Recommended Next Step

Continue Phase 6 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: define room and match contracts before any Firebase writes exist.

## Exact First Task

Define TypeScript contracts for `rooms/{roomId}`, `matches/{matchId}`, and match move log entries.

## Scope

- Define room status, player slot, match status, turn metadata, result metadata, `stateVersion`, and move log shapes.
- Keep this contract-only; do not write Firestore documents yet.
- Do not create or configure any real Firebase project yet.
- Keep Cloud Functions callables, matchmaking writes, realtime listeners, and gameplay rules implementation out of scope.

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
