# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-7: start a match from the Waiting Room through the callable intent boundary. BE-6 now routes successful Lobby create/join results into `/rooms/{roomId}`, and BE-5 keeps the Waiting Room subscribed to official room state.

## Exact First Task

Wire the Waiting Room start-match action to `getRoomMatchIntentClient().startMatch({ roomId })`, then navigate to `/matches/{matchId}` after callable success or when the subscribed room state exposes `matchId`.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Client code may submit room/match write intent only through callable wrappers.
- Client code may read room/match documents only through the Firebase read boundary.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Keep Waiting Room UI layout intact; focus on the start-match intent flow, loading/error state, and route transition.
- Do not connect full online gameplay yet.

## Expected Files

- `src/features/lobby/` for Waiting Room start-match UI and tests.
- `src/firebase/` only if an existing intent helper is missing.
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
