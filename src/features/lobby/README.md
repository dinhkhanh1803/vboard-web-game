# Lobby Feature

## Responsibility

Own quick match entry, public room listing, room code join, and waiting room UI.

## Boundaries

- May submit room intent through callable Cloud Functions after Phase 8.
- Must not write room status, player slots, or match creation directly from the client.
- Presence wiring should go through `src/firebase/` after Firebase local foundation exists.

## Next Task

Add lobby and waiting room shells after route stubs are approved.
