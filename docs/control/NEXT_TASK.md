# Next Task

## Current Recommended Next Step

Continue Phase 7 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: connect the profile view more directly to the shared profile contract while staying local/static.

## Exact First Task

Refactor the profile summary and stats UI to read from a typed local `PublicProfile` fixture created through the shared contract helpers.

## Scope

- Keep Firebase Auth provider wiring out of scope until the owner approves real provider setup.
- Keep profile data local/static; do not read or write Firestore yet.
- Use `contracts/userProfile.ts` as the source of truth for profile shape and defaults.
- Preserve the new Auth UI shell and existing profile route.
- Do not create or configure any real Firebase project yet.

## Expected Files

- `src/features/auth/`
- `src/shared/constants/` if a reusable fixture boundary is useful
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
