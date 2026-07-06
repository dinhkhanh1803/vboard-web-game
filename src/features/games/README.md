# Games Feature

## Responsibility

Own the game catalog, game detail pages, and metadata for Connect 4, Caro, and future games.

## Boundaries

- May show enabled/disabled state from config later.
- Must not implement game rules; pure rules belong in `game-engine/`.
- Must not render the live match board; match gameplay belongs in `src/features/match/`.

## Next Task

Add catalog data contracts for Connect 4 and Caro before the lobby depends on game metadata.
