# Next Task

## Current Recommended Next Step

Start Phase 11 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: add the Caro MVP after Connect 4 has a working local gameplay path.

## Exact First Task

Add Caro state and board-size tests in `game-engine/` before implementing five-in-row result logic or UI.

## Scope

- Keep Caro logic pure and game-engine first.
- Reuse the `GameModule` contract from Phase 8.
- Do not copy Connect 4 code blindly; extract shared helpers only if duplication becomes meaningful.
- Do not connect Caro UI, Firebase, realtime listeners, or Cloud Functions yet.
- Do not create, select, or configure any real Firebase project until the owner explicitly approves that step.

## Expected Files

- `game-engine/src/games/caro/`
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
