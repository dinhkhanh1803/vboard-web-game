# Lobby Feature

## Responsibility

Own quick match entry, public room listing, room code join, and waiting room UI.

## Boundaries

- May submit room intent only through `src/firebase/roomMatchIntents.ts` callable wrappers.
- Must not write room status, player slots, or match creation directly from the client.
- Presence and room reads must go through `src/firebase/roomMatchSubscriptions.ts`.

## Next Task

Wire Waiting Room start-match intent through the callable boundary and route successful starts to `/matches/{matchId}`.
