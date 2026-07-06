# Auth Feature

## Responsibility

Own sign-in, sign-out, guest entry, profile shell, and protected route state from the web client perspective.

## Boundaries

- May read authentication state through the Firebase client boundary after owner approval for real provider setup.
- Must not write roles, coins, level, ban state, ranking, or match history directly.
- Keep profile UI here; shared user/profile contracts live in `contracts/userProfile.ts`.
- The Phase 7 auth shell is UI/local-state only; Firebase Auth wiring is still out of scope.
- Protected route behavior is represented by `RequireAuthPreview` until real auth state exists.

## Current State

- Email, Google, and guest-mode entry states are visible but disabled for real auth actions.
- Profile summary reads from a typed local `PublicProfile` fixture.
- Admin route is protected by local preview state and links back to the auth shell.
