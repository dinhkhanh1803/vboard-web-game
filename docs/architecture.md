# Architecture Foundation

## Product Shape

VBoard Arena is a multiplayer board game platform, not a bundle of disconnected games. The shared platform owns identity, game catalog, lobby, room lifecycle, match lifecycle, ranking, analytics, admin controls, and moderation.

## High-Level Flow

```text
Client input
  -> callable Cloud Function
  -> auth, rate limit, room or match validation
  -> game-engine validation
  -> Firestore transaction writes official state
  -> clients receive realtime Firestore updates
```

Clients may preview local UI state for responsiveness, but Firestore state written by Cloud Functions is the source of truth.

## Runtime Responsibilities

| Area | Responsibility |
| --- | --- |
| `src/` React web app | Render UI, subscribe to narrow realtime data, submit intent, never decide official match results. |
| `functions/` Cloud Functions | Validate room actions, moves, timeouts, ranking, moderation, and cleanup. |
| Firestore | Store users, rooms, matches, moves, leaderboards, reports, config, and admin logs. |
| Realtime Database | Presence and disconnect-aware lobby signals. |
| `game-engine/` | Pure rules and state transitions, reusable by functions and web previews. |

## Module Boundaries

- Platform modules should not import game-specific UI.
- Game modules should expose rules through a common interface.
- Backend writes should be transactional when state version or turn order matters.
- Public state and private state must be separate before adding hidden-information games.

## Solo-Friendly Shape

The repository avoids deep nesting so a single owner can understand changes quickly in VS Code. Web feature code lives under `src/features/<feature>`, backend workflows live under `functions/src`, and pure game rules live under `game-engine/src`. Shared types should start close to the feature that needs them; only promote them when two areas truly share them.