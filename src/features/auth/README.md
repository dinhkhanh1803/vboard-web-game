# Auth Feature

## Responsibility

Own sign-in, sign-out, guest entry, profile shell, and protected route state from the web client perspective.

## Boundaries

- May read authentication state through the Firebase client boundary after Phase 3.
- Must not write roles, coins, level, ban state, ranking, or match history directly.
- Keep profile UI here; shared user contracts can move only when functions also need them.

## Next Task

After Firebase local foundation exists, add the auth UI shell with email, Google, and guest-mode stubs.
