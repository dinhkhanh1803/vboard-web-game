# Match Feature

## Responsibility

Own the realtime match screen, player panels, timer display, move log, action bar, and PixiJS board mounting boundary.

## Boundaries

- PixiJS renders official public state and emits move intent only.
- Game rules belong in `game-engine/`.
- Official match writes belong in Cloud Functions.
- Match listeners must target one match document, not broad collections.

## Next Task

After Connect 4 rules and server-authoritative submit flow exist, add the Connect 4 PixiJS board UI.
