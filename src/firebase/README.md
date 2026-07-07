# Firebase Client Boundary

This folder is the only frontend place that should initialize Firebase SDK services.

- `config.ts` reads safe public Vite env keys and emulator toggles.
- `clientApp.ts` initializes the browser Firebase app and local emulator connections.
- `authIdentity.ts` owns frontend Firebase Auth identity reads plus anonymous guest sign-in/sign-out.
- `index.ts` exports the approved boundary for future frontend code.

No feature should import Firebase SDK modules directly until there is a clear reason and matching tests.

## Auth Identity Boundary

- `authIdentity.ts` is the approved frontend entrypoint for reading the current Firebase user and signing in locally as an anonymous guest.
- Frontend features may use this boundary to show authenticated-state messaging or local/emulator guest sign-in controls.
- The auth boundary must not write profile, ranking, match history, room, match, or moderation documents directly.

## Room/Match Intent Boundary

- `roomMatchIntents.ts` is the approved frontend entrypoint for room and match write intent.
- Frontend features may call `createRoom`, `joinRoom`, `startMatch`, and `submitMove` through this boundary.
- The real `getRoomMatchIntentClient()` client requires a current Firebase Auth identity before sending official callable intent.
- Frontend features must not write official `rooms`, `matches`, match result, turn, timer, ranking, or move-log state directly.

## Room/Match Read Boundary

- `roomMatchSubscriptions.ts` is the approved frontend entrypoint for realtime room, match, and match move-log reads.
- Frontend features may subscribe to `rooms/{roomId}`, `matches/{matchId}`, and ordered `matches/{matchId}/moves` through this boundary.
- Frontend features must not import Firestore SDK modules directly or write official room/match state.
