# Game Engine

This folder contains pure TypeScript game rules. It should be easy to test without React, Firebase, or network state.

## Responsibilities

- Define game module contracts.
- Validate legal and illegal moves.
- Apply moves to immutable state.
- Detect win, draw, timeout, and resignation outcomes.
- Keep public state compact for Firestore writes.

## Boundaries

- No React imports.
- No Firebase imports.
- No browser APIs.
- Unit tests first for every rule change.

## Planned Layout

```text
src/core/             GameModule contracts and shared helpers
src/games/connect4/   Connect 4 rules
src/games/caro/       Caro rules
test/                 Unit tests for pure rules
```

Future games such as O an quan, Sea Battle, Chess, and Color Cards should stay in documentation until Connect 4 and Caro are stable.