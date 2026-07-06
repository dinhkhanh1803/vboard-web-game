# Next Task

## Current Recommended Next Step

Start Phase 7 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: add the Auth UI shell before wiring live Firebase providers.

## Exact First Task

Add an Auth UI shell with email, Google, and guest-mode states using static/local state only.

## Scope

- Build visible auth entry states that match the existing profile/auth route style.
- Use the shared user/profile contracts for labels and future data shape alignment where useful.
- Keep Firebase Auth provider wiring out of scope until the owner approves real provider setup.
- Do not create or configure any real Firebase project yet.
- Keep room, match, and Cloud Functions workflows out of scope.

## Expected Files

- `src/features/auth/`
- `src/app/` or `src/routes/` if route shell needs small support
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
