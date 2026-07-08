# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-16: add a completed-match realtime emulator smoke for the official Connect 4 path. BE-15 now proves two signed-in Firebase Web SDK clients can create, join, start, submit one official move through callable Functions, and observe the official match plus move-log updates through read-only subscriptions.

## Exact First Task

Create the smallest Auth + Firestore + Functions emulator smoke that signs in two anonymous browser clients, creates and starts a Connect 4 match, submits a legal winning move sequence through callable endpoints only, keeps both clients reading through match and move-log subscriptions, and verifies both clients observe the completed official match state, winner/result, and final move log.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep existing local demo routes working without Firebase Auth.
- Keep clients submitting official room/match intent only through callable wrappers.
- Keep clients reading room, match, and move-log documents only through Firebase read boundaries.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Avoid adding browser automation dependencies unless the task explicitly needs them; prefer Firebase Web SDK emulator clients and existing Vitest coverage first.
- Keep the smoke focused on Connect 4 completion; do not wire ranking/progression writes in this step.

## Expected Files

- `tests/` for the completed-match realtime emulator smoke.
- Reuse `tests/realtimeTwoClientRoomMatchHarness.ts` unless the harness needs a small focused extension.
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run test:smoke:callable-endpoints
npm run test:smoke:realtime-two-client
npm run test:smoke:auth-flow
npm run test:rules
npm run typecheck
npm run lint
npm run build
npm run test
```
