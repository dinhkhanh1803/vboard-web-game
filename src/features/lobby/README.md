# Lobby Feature

## Responsibility

Own quick match entry, public room listing, room code join, and waiting room UI.

## Boundaries

- May submit room intent only through `src/firebase/roomMatchIntents.ts` callable wrappers.
- Official create/join/start-match intent requires the Firebase Auth identity boundary to have a current user.
- Must not write room status, player slots, or match creation directly from the client.
- Presence and room reads must go through `src/firebase/roomMatchSubscriptions.ts`.

## Current Backend Integration Status

Lobby create/join and Waiting Room start-match flows use the guest-ready room/match intent helper. The helper signs into Firebase anonymous Auth through `src/firebase/authIdentity.ts` when needed, then submits official callable intent. Waiting Room still reads official room state only through `src/firebase/roomMatchSubscriptions.ts`.
