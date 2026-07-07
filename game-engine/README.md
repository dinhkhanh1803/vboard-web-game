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

## Current Core Contract

`src/core/gameModule.ts` defines the shared `GameModule<TState, TMove>` contract. Game modules own metadata, initial state creation, move validation, immutable move application, result evaluation, and compact public state serialization.

Current modules:

- `src/games/connect4/connect4Module.ts`: pure Connect 4 state, validation, move application, win/draw evaluation, public-state serialization, and a document-safe row-major board codec for Firestore-compatible official state.
- `src/games/caro/caroModule.ts`: pure 15x15 Caro state, move validation, immutable stone placement, five-in-row win detection, draw evaluation, and public-state serialization.

## Planned Layout

```text
src/core/             GameModule contracts and shared helpers
src/games/connect4/   Connect 4 rules
src/games/caro/       Caro rules
test/                 Unit tests for pure rules
```

Future games such as O an quan, Sea Battle, Chess, and Color Cards should stay in documentation until Connect 4 and Caro are stable.
