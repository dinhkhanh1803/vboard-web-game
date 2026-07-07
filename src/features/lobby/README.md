# Lobby Feature

## Responsibility

Own quick match entry, public room listing, room code join, and waiting room UI.

## Boundaries

- May submit room intent only through `src/firebase/roomMatchIntents.ts` callable wrappers.
- Must not write room status, player slots, or match creation directly from the client.
- Presence and room reads must go through `src/firebase/roomMatchSubscriptions.ts`.

## Current Backend Integration Status

Lobby create/join and Waiting Room start-match flows now submit through callable intent wrappers and route by returned ids. The next backend integration step moves to `src/features/match/` for official match reads.
