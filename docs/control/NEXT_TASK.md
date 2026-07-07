# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-15: add a realtime two-client emulator smoke for the official Connect 4 path. BE-14 now proves the real web app routes can move from Lobby to Waiting Room to Match using guest-ready callable intent clients and read-only subscriptions.

## Exact First Task

Create the smallest Auth + Firestore + Functions emulator smoke that signs in two anonymous browser clients, creates a Connect 4 room, joins it from the second client, starts the match, subscribes to the official match and move-log documents from both clients, submits one move through the callable endpoint, and verifies both read clients observe the official state.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep existing local demo routes working without Firebase Auth.
- Keep clients submitting official room/match intent only through callable wrappers.
- Keep clients reading room, match, and move-log documents only through Firebase read boundaries.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Avoid adding browser automation dependencies unless the task explicitly needs them; prefer Firebase Web SDK emulator clients and existing Vitest coverage first.

## Expected Files

- `tests/` for the two-client emulator smoke.
- `src/firebase/` only if the read/intent boundary needs a small reusable harness helper.
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run test:smoke:callable-endpoints
npm run test:smoke:auth-flow
npm run test:rules
npm run typecheck
npm run lint
npm run build
npm run test
```
