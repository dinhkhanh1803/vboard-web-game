# Match Feature

## Responsibility

Own the realtime match screen, player panels, timer display, move log, action bar, and PixiJS board mounting boundary.

## Boundaries

- PixiJS renders official public state and emits move intent only.
- Game rules belong in `game-engine/`.
- Official match writes belong in Cloud Functions.
- Match listeners must target one match document and its move-log subcollection, not broad collections.
- Non-demo match routes must read through `src/firebase/roomMatchSubscriptions.ts`.
- Client move submissions must go through `src/firebase/roomMatchIntents.ts`.
- Official move submissions require the Firebase Auth identity boundary to have a current user.

## Current Local Gameplay

`connect4LocalMatch.ts` provides the local realtime-like source used by the default `MatchPage` and `/matches/demo-match` route. It keeps the UI on the same `MatchDocument.publicState` shape that Cloud Functions write, decodes document-safe official Connect 4 state for the board UI, and leaves `Connect4PixiBoard.tsx` owning PixiJS rendering and column move intents.

`caroLocalMatch.ts` mirrors that source shape for Caro. It uses the pure `caroModule`, writes `place-stone` move log entries, and powers the `/matches/demo-caro` route through `CaroPixiBoard.tsx` with 15x15 cell move intents.

## Current Backend Integration Status

Non-demo `/matches/{matchId}` routes subscribe to official match state, subscribe to official `matches/{matchId}/moves` entries ordered by sequence, render Connect 4 public state and official Match history, and submit Connect 4 column moves through the guest-ready callable intent helper. BE-14 adds a route-level smoke proving Lobby -> Waiting Room -> Match uses guest-ready intents plus read-only subscriptions.
