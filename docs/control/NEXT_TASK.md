# Next Task

## Current Recommended Next Step

Start backend-to-frontend wiring now that BE-1, BE-2, and BE-3 are in place. The next focus is connecting the Lobby create/join actions to the client intent boundary without adding direct Firestore writes.

## Exact First Task

Wire the Lobby route to `getRoomMatchIntentClient()` for `createRoom` and `joinRoom` intent submission behind local loading/error states. Keep the existing UI layout intact and do not connect match state subscriptions yet.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Client code may call callable intent wrappers only.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Keep UI changes minimal and behavior-focused.

## Expected Files

- `src/features/lobby/`
- `src/firebase/` only if the wiring exposes a missing client helper
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
