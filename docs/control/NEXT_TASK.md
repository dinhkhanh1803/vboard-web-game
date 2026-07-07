# Next Task

## Current Recommended Next Step

Start Phase 14 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: prepare content, policy pages, ads config contracts, deploy checklist, and staging planning without creating production Firebase config yet.

## Exact First Task

Replace placeholder policy/contact content with final-ready privacy policy, terms, and contact page copy that still avoids legal overreach.

## Scope

- Keep content static and reviewable in React routes.
- Add ad placement config as a contract only; do not add ad SDKs yet.
- Prepare deploy and CI checklists, but do not create Firebase dev/staging/prod project mapping until the owner explicitly approves that step.
- Do not create, select, or configure any real Firebase project until the owner explicitly approves that step.

## Expected Files

- `src/features/content/`
- `contracts/`
- `docs/control/PROGRESS.md`
- `docs/firebase-model.md`

## Verification

Make these commands pass:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run build
npm run test
```
