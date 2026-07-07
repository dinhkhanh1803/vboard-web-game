# Next Task

## Current Recommended Next Step

Continue the backend integration track by connecting the completed create/join intent flow to the Waiting Room route. BE-5 now provides read-only subscriptions for `rooms/{roomId}` and `matches/{matchId}`, and the Waiting Room can read official room state.

## Exact First Task

Wire successful Lobby `createRoom` and `joinRoom` results to navigate to `/rooms/{roomId}`. Keep the Waiting Room subscribed through `getRoomMatchReadClient()` and do not add direct Firestore writes.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Client code may submit room/match write intent only through callable wrappers.
- Client code may read room/match documents only through the Firebase read boundary.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Keep Waiting Room UI layout intact; focus on route flow and local loading/error behavior.
- Do not connect full online gameplay yet.

## Expected Files

- `src/features/lobby/` for navigation after create/join success.
- `src/firebase/` only if the existing intent/read boundaries need a missing helper.
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
