# Next Task

## Current Recommended Next Step

Start Phase 6 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: define shared product contracts before writing Firebase workflows.

## Exact First Task

Define user/profile contracts that match the Firebase data model and can be shared by frontend and functions code later.

## Scope

- Define `users` and `profilesPublic` TypeScript shapes.
- Keep this contract-only; do not write Firestore documents yet.
- Do not create or configure any real Firebase project yet.
- Keep gameplay, auth provider wiring, and Cloud Functions callables out of scope.

## Expected Files

- `src/features/auth/`
- `functions/src/core/` or a shared contract folder chosen before implementation
- `docs/firebase-model.md`
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run build
npm run test
```
