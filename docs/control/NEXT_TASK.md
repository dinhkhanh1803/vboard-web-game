# Next Task

## Current Recommended Next Step

Continue Phase 8 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: add Connect 4 initial state tests before implementing full move validation.

## Exact First Task

Define the Connect 4 state shape and initial state factory under `game-engine/src/games/connect4/`, with tests covering board dimensions, empty cells, starting turn, and compact public state serialization.

## Scope

- Keep logic pure and framework-neutral.
- Use the `GameModule` contract from `game-engine/src/core/gameModule.ts`.
- Do not connect PixiJS rendering, Firebase, Cloud Functions, or realtime listeners yet.
- Do not implement full win detection or illegal move validation in this task unless the test requires a minimal placeholder boundary.
- Do not create or configure any real Firebase project yet.

## Expected Files

- `game-engine/src/games/connect4/`
- `game-engine/test/`
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
