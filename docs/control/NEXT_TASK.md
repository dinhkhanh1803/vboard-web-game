# Next Task

## Current Recommended Next Step

Continue Phase 4 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: add frontend-only empty, loading, and error states before backend/Firebase work begins.

## Exact First Task

Create reusable UI state sections for screens that will later depend on Firebase data, without connecting Firebase.

## Scope

- Add empty/loading/error display contracts for lobby rooms, leaderboard rows, match state, and profile history.
- Keep all backend actions disabled or local-only.
- Do not create or configure any real Firebase project yet.
- Keep PixiJS renderer prototype for a later Phase 4 task unless the owner asks for it next.

## Expected Files

- `src/shared/components/`
- `src/features/*`
- `src/app/App.test.tsx`
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
