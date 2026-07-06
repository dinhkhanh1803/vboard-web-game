# Firebase Functions

This folder contains the server-authoritative backend for VBoard Arena.

## Responsibilities

- Validate room actions.
- Validate moves.
- Write official match state.
- Update ranking, history, rewards, and moderation data.
- Run cleanup and maintenance jobs.

## Boundaries

- Functions may import pure rules from `game-engine/`.
- Functions may use Firebase Admin SDK after the toolchain is installed.
- Functions should not import React or browser code from `src/`.

## Planned Layout

```text
src/callable/       createRoom, joinRoom, startMatch, submitMove
src/core/           backend-only domain helpers
src/integrations/   Firebase Admin SDK wrappers
src/scheduled/      cleanup and leaderboard batches
src/triggers/       Auth, Firestore, Storage triggers
test/               emulator-backed tests
```