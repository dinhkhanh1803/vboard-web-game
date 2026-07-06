# Foundation Scope

## What This Scaffold Establishes

- Solo-friendly layout for web, functions, and shared game engine code.
- Firebase configuration placeholders with closed-by-default rules.
- Documentation for architecture, data model, security, roadmap, test strategy, and AI control.
- Strict TypeScript base settings for future packages.
- Environment variable template without secrets.
- VS Code and AI instruction files for controlled assisted coding.

## What This Scaffold Avoids

- No React components.
- No Firebase SDK initialization.
- No Cloud Function implementations.
- No Connect 4 or Caro rules.
- No generated lockfile or installed dependencies.
- No production Firebase project IDs.

## Package Ownership

| Path           | Owner                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| `src`          | Browser UI, Firebase client reads, and intent submission.              |
| `functions`    | Server-side validation and official state writes.                      |
| `game-engine`  | Pure game rules, state transitions, result detection, and Elo helpers. |
| `firebase`     | Firebase rules, indexes, emulator config, and deployment wiring.       |
| `docs/control` | Owner and AI workflow control.                                         |

## MVP Guardrails

- Build Connect 4 before Caro to prove the engine with simpler rules.
- Add Caro after the shared turn, timeout, and result patterns are stable.
- Defer hidden-state games until `publicState` and `privateState` access paths are tested.
- Defer ads until policy pages and natural ad placements exist.
