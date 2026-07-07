# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-10: add an official move-log subscription boundary for Match history. BE-9 now lets non-demo `/matches/{matchId}` Connect 4 boards submit move intent through the callable `submitMove` boundary and wait for subscribed match state refresh.

## Exact First Task

Add a read-only client subscription for `matches/{matchId}/moves`, ordered by move sequence, then render official Connect 4 move history on non-demo Match routes without direct client writes.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep `/matches/demo-match` and `/matches/demo-caro` local demo behavior intact.
- Client code may submit official move intent only through callable wrappers.
- Client code may read room, match, and move-log documents only through Firebase read boundaries.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Keep this focused on Connect 4 official move history; Caro official moves can follow later.

## Expected Files

- `src/firebase/roomMatchSubscriptions.ts` and tests for the move-log read boundary.
- `src/features/match/` for official Match move-history UI and tests.
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
