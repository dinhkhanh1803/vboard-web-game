# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-8: connect the Match route to official match reads. BE-7 now starts a match from the Waiting Room through the callable intent boundary and lands on `/matches/{matchId}`.

## Exact First Task

For non-demo `/matches/{matchId}` routes, subscribe to `matches/{matchId}` through `getRoomMatchReadClient().subscribeToMatch(matchId)` and render the official match status/public state path without adding client writes yet.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep `/matches/demo-caro` and local demo match behavior intact.
- Client code may read room/match documents only through the Firebase read boundary.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Do not wire `submitMove` yet; keep this phase focused on official Match route reads.

## Expected Files

- `src/features/match/` for Match route official-read state and tests.
- `src/firebase/` only if the existing read boundary needs a missing helper.
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
