# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-9: submit Connect 4 moves from the official Match route through the callable intent boundary. BE-8 now reads official match state for non-demo `/matches/{matchId}` routes.

## Exact First Task

Wire official Connect 4 board column selection to `getRoomMatchIntentClient().submitMove({ matchId, payload: { column } })`, then rely on the existing `subscribeToMatch(matchId)` read path to refresh public state.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep `/matches/demo-match` and `/matches/demo-caro` local demo behavior intact.
- Client code may submit official move intent only through callable wrappers.
- Client code may read room/match documents only through the Firebase read boundary.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Keep this focused on Connect 4 official move submission; Caro official moves can follow later.

## Expected Files

- `src/features/match/` for official Match move intent UI and tests.
- `src/firebase/` only if the existing intent boundary needs a missing helper.
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
