# Firebase Client Boundary

This folder is the only frontend place that should initialize Firebase SDK services.

- `config.ts` reads safe public Vite env keys and emulator toggles.
- `clientApp.ts` initializes the browser Firebase app and local emulator connections.
- `index.ts` exports the approved boundary for future frontend code.

No feature should import Firebase SDK modules directly until there is a clear reason and matching tests.
