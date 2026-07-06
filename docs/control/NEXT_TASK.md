# Next Task

## Current Recommended Next Step

Start Phase 13 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: add admin, moderation, and safety controls without overbuilding a full back office.

## Exact First Task

Add admin route behavior tests for a minimal role-gated preview before any live Firebase Auth or custom claims wiring.

## Scope

- Keep admin behavior local/contract-first until Firebase Auth setup is explicitly approved.
- Add report-user contract and UI only after the admin route behavior is covered by tests.
- Add feature flag contracts for games without changing production availability or deploy config.
- Do not create, select, or configure any real Firebase project until the owner explicitly approves that step.

## Expected Files

- `contracts/`
- `src/features/admin/`
- `src/features/auth/`
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
