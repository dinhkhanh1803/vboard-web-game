# Firebase Client Boundary

This folder is the only frontend place that should initialize Firebase SDK services.

- `config.ts` reads safe public Vite env keys and emulator toggles.
- `clientApp.ts` initializes the browser Firebase app and local emulator connections.
- `index.ts` exports the approved boundary for future frontend code.

No feature should import Firebase SDK modules directly until there is a clear reason and matching tests.

## Room/Match Intent Boundary

- `roomMatchIntents.ts` is the approved frontend entrypoint for room and match write intent.
- Frontend features may call `createRoom`, `joinRoom`, `startMatch`, and `submitMove` through this boundary.
- Frontend features must not write official `rooms`, `matches`, match result, turn, timer, ranking, or move-log state directly.
