# Lobby Feature

## Responsibility

Own quick match entry, public room listing, room code join, and waiting room UI.

## Boundaries

- May submit room intent only through `src/firebase/roomMatchIntents.ts` callable wrappers.
- Official create/join/start-match intent requires the Firebase Auth identity boundary to have a current user.
- Must not write room status, player slots, or match creation directly from the client.
- Presence and room reads must go through `src/firebase/roomMatchSubscriptions.ts`.

## Current Backend Integration Status

Lobby create/join and Waiting Room start-match flows submit through callable intent wrappers and route by returned ids. BE-11 added the auth identity guard before these official intents; the next backend integration step is an authenticated local/emulator smoke flow.
