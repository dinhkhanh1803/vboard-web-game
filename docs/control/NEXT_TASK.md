# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-12: run and document an authenticated local/emulator room-to-match smoke flow. BE-11 now provides a Firebase Auth identity boundary, anonymous guest sign-in support, and a client-side authenticated-user guard before official room/match callable intents.

## Exact First Task

Use the local Firebase emulators to prove the official path can run with an authenticated guest user: sign in anonymously against the Auth emulator, create or join a room through callable intent, start a match when the room is full, and submit a Connect 4 move through `submitMove`.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep existing local demo routes working without Firebase Auth.
- Prefer emulator/local smoke helpers or docs before adding broader UI.
- Client code may submit official room/match intent only through callable wrappers.
- Client code may read room, match, and move-log documents only through Firebase read boundaries.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Keep this focused on proving the authenticated emulator flow, not production account UX.

## Expected Files

- `tests/` or `docs/control/` for smoke-run documentation or a small emulator smoke helper.
- `src/features/auth/` only if a tiny local guest sign-in entrypoint is needed for the smoke flow.
- `src/features/lobby/` or `src/features/match/` only if official routes need a small authenticated-state message.
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
