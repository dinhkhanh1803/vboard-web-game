# Admin Feature

## Responsibility

Own operational screens for users, reports, game config, feature flags, and ads config.

## Boundaries

- Admin UI must remain role-gated once auth exists.
- Admin actions must go through Cloud Functions or tested rules.
- Keep MVP admin minimal; do not build a large back office before moderation needs are real.
- Phase 13 admin screens are contract-backed local previews only; no live Firebase Auth claims, reads, or writes exist yet.

## Current State

- `RequireAdminPreview` represents signed-out, non-admin, and admin-allowed route states locally.
- `AdminPage` shows a moderation queue preview from `contracts/moderationSafety.ts` fixtures.
- Game feature flag previews show catalog visibility and matchmaking availability without changing deploy config.
