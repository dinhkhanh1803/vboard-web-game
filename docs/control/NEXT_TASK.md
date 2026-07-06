# Next Task

## Current Recommended Next Step

Start Phase 12 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: add ranking, history, and progression after Connect 4 and Caro both have local playable paths.

## Exact First Task

Add Elo helper tests before implementing ranking writes, match history writes, or leaderboard persistence.

## Scope

- Keep Phase 12 contract/helper-first, with pure tests before UI or Firebase writes.
- Reuse existing `contracts/`, `functions/`, and feature README boundaries.
- Do not create, select, or configure any real Firebase project until the owner explicitly approves that step.
- Do not add reward economy or monetization logic in this phase.
- Keep leaderboard/profile stats compatible with current local UI and future Cloud Functions writes.

## Expected Files

- `contracts/`
- `functions/src/domain/`
- `functions/test/`
- `src/features/leaderboard/`
- `src/features/auth/`
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
