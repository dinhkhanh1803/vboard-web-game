# Next Task

## Current Recommended Next Step

Continue the backend integration track with read-only room and match state wiring. BE-4 now lets the Lobby submit `createRoom` and `joinRoom` intents through callable wrappers; the next step is to let frontend screens read official state without granting client writes.

## Exact First Task

Create a read-only Firebase subscription boundary for room and match documents, then wire the Waiting Room route to read `rooms/{roomId}` from that boundary. Keep all writes behind callable intent wrappers.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Client code may read room/match documents through the Firebase boundary only.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Keep Waiting Room UI layout intact; only add data/loading/error wiring slots.
- Do not connect full online gameplay yet.

## Expected Files

- `src/firebase/` for a read-only subscription boundary.
- `src/features/lobby/` for Waiting Room read wiring.
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
