# Match Feature

## Responsibility

Own the realtime match screen, player panels, timer display, move log, action bar, and PixiJS board mounting boundary.

## Boundaries

- PixiJS renders official public state and emits move intent only.
- Game rules belong in `game-engine/`.
- Official match writes belong in Cloud Functions.
- Match listeners must target one match document, not broad collections.
- Do not connect live Firebase listeners until the owner approves Firebase project configuration.

## Current Local Gameplay

`connect4LocalMatch.ts` provides the local realtime-like source used by the default `MatchPage` route. It keeps the UI on the same `MatchDocument.publicState` shape that Cloud Functions will write later, while `Connect4PixiBoard.tsx` owns the PixiJS board rendering and column move intents.

`caroLocalMatch.ts` mirrors that source shape for Caro. It uses the pure `caroModule`, writes `place-stone` move log entries, and powers the `/matches/demo-caro` route through `CaroPixiBoard.tsx` with 15x15 cell move intents.

## Next Task

Next, Phase 12 should add ranking/history/progression helpers and tests. Firebase-backed realtime sources remain deferred until the owner explicitly approves Firebase project setup.
