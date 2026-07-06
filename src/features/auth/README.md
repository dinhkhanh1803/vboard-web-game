# Auth Feature

## Responsibility

Own sign-in, sign-out, guest entry, profile shell, and protected route state from the web client perspective.

## Boundaries

- May read authentication state through the Firebase client boundary after owner approval for real provider setup.
- Must not write roles, coins, level, ban state, ranking, or match history directly.
- Keep profile UI here; shared user/profile contracts live in `contracts/userProfile.ts`.
- The Phase 7 auth shell is UI/local-state only; Firebase Auth wiring is still out of scope.

## Next Task

Connect the profile summary and stats UI to a typed local `PublicProfile` fixture from the shared profile contract before any live Firebase reads.
