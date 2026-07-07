# Lobby Feature

## Responsibility

Own quick match entry, public room listing, room code join, and waiting room UI.

## Boundaries

- May submit room intent only through `src/firebase/roomMatchIntents.ts` callable wrappers.
- Must not write room status, player slots, or match creation directly from the client.
- Presence wiring should go through `src/firebase/` after Firebase local foundation exists.

## Next Task

Add read-only room subscriptions for waiting room state after BE-4 intent wiring.
