# Project Brief

## Product

VBoard Arena is a web platform for realtime turn-based board games. The MVP focuses on Connect 4 and Caro, with shared auth, lobby, rooms, matches, ranking, history, and admin foundations.

## Working Style

The owner is solo. AI is expected to write most implementation work, while the owner reviews direction, architecture, UX, and important diffs. The project must stay easy to understand in VS Code.

## Non-Negotiables

- Server authoritative: clients submit intent; Cloud Functions validate and write official state.
- Feature-first web code: keep product code under `src/features/<feature>`.
- Pure game engine: `game-engine/` must not import React or Firebase.
- Closed rules first: Firebase read/write paths open only with tests.
- One task at a time: update `PROGRESS.md` and `NEXT_TASK.md`.

## MVP Priority

1. Toolchain.
2. Auth and profile shell.
3. Game catalog and lobby.
4. Room create/join.
5. Connect 4 server-authoritative path.
6. Caro after Connect 4 proves the path.

## Tech Decision

MVP uses React + Vite + TypeScript for the web app, PixiJS for game canvas rendering, Firebase for backend services, Cloud Functions TypeScript for server-authoritative writes, and Vitest for early tests. Next.js is deferred until SEO/content needs justify it.
