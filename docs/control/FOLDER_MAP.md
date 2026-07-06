# Folder Map

This is the source of truth for where code belongs.

## Top-Level Folders

| Folder          | Purpose                       | Rule                                                                  |
| --------------- | ----------------------------- | --------------------------------------------------------------------- |
| `src/`          | React web client              | UI, routes, hooks, Firebase client reads, and intent submission only. |
| `functions/`    | Firebase Cloud Functions      | Server-authoritative validation and official writes.                  |
| `game-engine/`  | Pure game rules               | No React imports, no Firebase imports, deterministic unit tests.      |
| `firebase/`     | Firebase rules and indexes    | Start closed; open access only with tests.                            |
| `docs/control/` | Owner and AI control panel    | Must stay short, current, and easy to scan.                           |
| `docs/`         | Product and architecture docs | Longer background and decisions.                                      |
| `ops/`          | Operations notes              | Deploy, monitoring, backups, production readiness.                    |
| `scripts/`      | Local automation              | Add only when repeated manual work exists.                            |
| `tests/`        | Cross-area tests              | Emulator, e2e, and smoke tests that span areas.                       |

## Web Feature Layout

Use `src/features/<feature>` for product work:

```text
src/features/auth/
src/features/games/
src/features/lobby/
src/features/match/
src/features/leaderboard/
src/features/admin/
src/features/content/
```

Each feature should keep its own components, hooks, types, and README until something is truly shared.

## Backend Layout

```text
functions/src/callable/     Client-called workflows
functions/src/core/         Backend-only domain helpers
functions/src/integrations/ Firebase Admin SDK boundaries
functions/src/scheduled/    Cleanup and batch jobs
functions/src/triggers/     Firebase event triggers
functions/test/             Emulator-backed tests
```

## Game Engine Layout

```text
game-engine/src/core/          GameModule contracts and shared helpers
game-engine/src/games/connect4/
game-engine/src/games/caro/
game-engine/test/
```

Future games should stay in docs until the platform path is stable.
