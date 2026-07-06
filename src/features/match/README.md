# Match Feature

## Responsibility

Own the realtime match screen, player panels, timer display, move log, action bar, and PixiJS board mounting boundary.

## Boundaries

- PixiJS renders official public state and emits move intent only.
- Game rules belong in `game-engine/`.
- Official match writes belong in Cloud Functions.
- Match listeners must target one match document, not broad collections.

## Next Task

Next, replace the local source with a Firebase-backed realtime source only after the owner approves Firebase project configuration. Caro should start in `game-engine/` before joining this match UI.

## Current Local Gameplay

`connect4LocalMatch.ts` provides the local realtime-like source used by `MatchPage`. It keeps the UI on the same `MatchDocument.publicState` shape that Cloud Functions will write later, while `Connect4PixiBoard.tsx` owns the PixiJS board rendering and column move intents.
