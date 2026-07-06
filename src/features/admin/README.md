# Admin Feature

## Responsibility

Own operational screens for users, reports, game config, feature flags, and ads config.

## Boundaries

- Admin UI must remain role-gated once auth exists.
- Admin actions must go through Cloud Functions or tested rules.
- Keep MVP admin minimal; do not build a large back office before moderation needs are real.

## Next Task

Add an admin route shell only after auth and role boundaries exist.
