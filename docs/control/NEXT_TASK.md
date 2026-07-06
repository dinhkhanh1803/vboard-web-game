# Next Task

## Current Recommended Next Step

Continue Phase 6 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: define analytics event names before gameplay or Firebase writes depend on tracking language.

## Exact First Task

Define TypeScript contracts for analytics event names and minimal event payload shapes.

## Scope

- Define stable event names for auth, lobby, room, match, game catalog, and UI navigation milestones.
- Keep analytics contract-only; do not wire Firebase Analytics or any tracking SDK calls yet.
- Do not create or configure any real Firebase project yet.
- Keep gameplay implementation, Cloud Functions writes, and realtime listeners out of scope.

## Expected Files

- `contracts/`
- `docs/firebase-model.md`
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
