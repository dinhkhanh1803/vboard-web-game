# Next Task

## Current Recommended Next Step

Continue the backend integration track with BE-11: add the Firebase Auth identity boundary for local/emulator gameplay. BE-10 now reads official move logs from `matches/{matchId}/moves` and renders official Match history.

## Exact First Task

Create a small frontend auth boundary that can expose the current Firebase user and support local anonymous/guest sign-in against the emulator, then use that boundary only where official room/match callable intents need an authenticated user.

## Scope

- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Do not deploy.
- Keep existing local demo routes working without Firebase Auth.
- Keep the current local Auth UI shell intact unless a minimal integration point is needed.
- Client code may submit official room/match intent only through callable wrappers.
- Client code may read room, match, and move-log documents only through Firebase read boundaries.
- Client code must not write official room, match, result, turn, timer, ranking, or move-log state directly.
- Keep this focused on emulator/local identity plumbing, not full production account UX.

## Expected Files

- `src/firebase/` for the Firebase Auth client boundary and tests.
- `src/features/auth/` only if the existing Auth shell needs a minimal entrypoint.
- `src/features/lobby/` or `src/features/match/` only if official intents need a small authenticated-state guard.
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
