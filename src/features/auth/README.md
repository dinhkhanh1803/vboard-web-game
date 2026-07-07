# Auth Feature

## Responsibility

Own sign-in, sign-out, guest entry, profile shell, and protected route state from the web client perspective.

## Boundaries

- May read authentication state through `src/firebase/authIdentity.ts`.
- May trigger local/emulator anonymous guest sign-in through `src/firebase/authIdentity.ts` after a UI entrypoint is added.
- Must not write roles, coins, level, ban state, ranking, or match history directly.
- Keep profile UI here; shared user/profile contracts live in `contracts/userProfile.ts`.
- Protected route behavior is represented by local preview guards until real route-level auth state is wired.

## Current State

- BE-11 added the Firebase Auth identity boundary in `src/firebase/`; the profile dashboard still uses local UI fixtures.
- Real email/Google provider UX, production Firebase project setup, and profile persistence remain out of scope until owner approval.
- Profile now renders the high-fidelity player dashboard from local UI fixtures.
- Admin route is protected by local preview state and links back to the auth shell.
- Phase 12 profile stats and recent matches read contract-backed local progression fixtures; no live Firebase writes exist yet.
- Report-player safety contracts remain available for moderation work, but the current profile dashboard does not write reports or live profile state.
