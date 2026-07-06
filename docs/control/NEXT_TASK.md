# Next Task

## Current Recommended Next Step

Start Phase 10 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: connect the first playable Connect 4 web gameplay path.

## Exact First Task

Connect the match UI to a local official public-state adapter first, then use the same state shape that Phase 9 writes before adding realtime Firebase subscriptions.

## Scope

- Keep the first pass UI/local-state driven.
- Reuse `game-engine/src/games/connect4/connect4Module.ts` and the Phase 9 match public state shape.
- Add the PixiJS board interaction behind the existing match board boundary.
- Do not connect live Firebase realtime listeners until the UI path is stable.
- Do not create, select, or configure any real Firebase project until the owner explicitly approves that step.

## Expected Files

- `src/features/match/`
- `src/features/games/`
- `game-engine/src/games/connect4/`
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
