# Next Task

## Current Recommended Next Step

Start Phase 8 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: define the pure `GameModule` contract before Connect 4 rules are implemented.

## Exact First Task

Define the `GameModule` contract in `game-engine` with tests for module metadata, initial state creation, move validation, and result evaluation boundaries.

## Scope

- Keep game rules pure and framework-neutral.
- Do not connect PixiJS rendering, Firebase, Cloud Functions, or realtime listeners yet.
- Define the shared interface that Connect 4 and Caro will implement later.
- Keep the first implementation minimal; Connect 4 rule logic comes after the contract is pinned.
- Do not create or configure any real Firebase project yet.

## Expected Files

- `game-engine/src/`
- `game-engine/README.md`
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
