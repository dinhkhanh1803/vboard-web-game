# Next Task

## Current Recommended Next Step

Start Phase 3 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: add Firebase local foundation safely through local/emulator-first boundaries.

## Exact First Task

Create the Firebase client initialization boundary under `src/firebase/` without connecting production secrets.

## Scope

- Read config from `.env.example` keys only.
- Keep Firebase rules closed.
- Keep gameplay, auth providers, and Cloud Functions out of scope.
- Do not add production Firebase project IDs.

## Expected Files

- `src/firebase/`
- `.env.example`
- `firebase/README.md`
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run build
npm run lint
npm run test
npm run typecheck
```
