# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-17: wire completed-match progression writes behind the server-authoritative boundary. BE-16 now proves two signed-in Firebase Web SDK clients can play a Connect 4 match to completion through callable Functions and both observe the official completed result plus final move log through read-only subscriptions.

Latest hotfix: Waiting Room now copies raw room codes and Lobby join normalizes display-formatted invite codes before calling the backend.
Latest hotfix: Waiting Room invite links now expose a direct Join Room action for non-participants before the room is full.
Latest hotfix: Waiting Room now uses the official `leaveRoom` callable. Guest leave releases the opponent slot so the room code can be joined again, duplicate joins return the existing room instead of `already-in-room`, and host/in-match leave closes the room so subscribers exit to Lobby.

## Exact First Task

Add the smallest Functions-side integration that turns a completed official match into progression write data using the existing pure `functions/src/domain/progressionCommands.ts` helper, then prove it locally with tests. Start with a focused backend/domain or integration test before wiring any client UI.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep existing local demo routes working without Firebase Auth.
- Keep clients submitting official room/match intent only through callable wrappers.
- Keep clients reading room, match, move-log, profile, leaderboard, and history documents through approved read boundaries only.
- Client code must not write official room, match, result, ranking, profile stats, leaderboard, or match-history state directly.
- Prefer server-side tests first; only add frontend reads after progression writes are proven locally.

## Expected Files

- `functions/src/integrations/` if progression writes need a Firestore adapter.
- `functions/src/callable/` only if `submitMove` needs to invoke the progression write path after completion.
- `functions/test/` or `tests/` for focused progression integration coverage.
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run test:smoke:completed-connect4
npm run test:smoke:callable-endpoints
npm run test:smoke:realtime-two-client
npm run test:smoke:auth-flow
npm run test:rules
npm run typecheck
npm run lint
npm run build
npm run test
```
