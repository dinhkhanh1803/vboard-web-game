# Auth Feature

## Responsibility

Own sign-in, sign-out, guest entry, profile shell, and protected route state from the web client perspective.

## Boundaries

- May read authentication state through the Firebase client boundary after owner approval for real provider setup.
- Must not write roles, coins, level, ban state, ranking, or match history directly.
- Keep profile UI here; shared user/profile contracts live in `contracts/userProfile.ts`.
- The Phase 7 auth shell is UI/local-state only; Firebase Auth wiring is still out of scope.
- Protected route behavior is represented by local preview guards until real auth state exists.

## Current State

- Profile now renders the high-fidelity player dashboard from local UI fixtures; real auth actions are still not wired.
- The dashboard includes local hero stats, skill distribution, weekly activity, and recent match history only.
- Admin route is protected by local preview state and links back to the auth shell.
- Phase 12 profile stats and recent matches read contract-backed local progression fixtures; no live Firebase writes or reads exist yet.
- Report-player safety contracts remain available for moderation work, but the current profile dashboard does not write reports or live profile state.
