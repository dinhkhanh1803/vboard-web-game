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
src/domain/         pure server-authoritative room and match commands
src/integrations/   Firebase Admin SDK wrappers
src/scheduled/      cleanup and leaderboard batches
src/triggers/       Auth, Firestore, Storage triggers
test/               local domain tests first, emulator-backed tests later
```

## Current Domain Boundary

`src/domain/roomMatchCommands.ts` contains the Phase 9 local command layer for `createRoom`, `joinRoom`, `startMatch`, and `submitMove`. It returns official room, match, and move-log documents without calling Firestore directly, so callable Cloud Functions can later wrap the same logic in transactions.
