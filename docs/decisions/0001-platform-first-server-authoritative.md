# ADR 0001: Platform-First Server-Authoritative Architecture

## Status

Accepted for foundation scaffold.

## Context

The product blueprint calls for multiple turn-based games, shared rooms, quick match, ranking, match history, admin controls, Firebase deploys, and future monetization. If each game owns its own backend and data shape, the project will become hard to test and hard to extend.

## Decision

Build VBoard Arena as a platform first. Shared systems own users, rooms, matches, ranking, analytics, reports, and config. Each game plugs into a common game engine interface. Clients submit intent, while Cloud Functions validate and write official state.

## Consequences

- Adding a new game should mostly mean adding a game module, tests, and UI adapter.
- Anti-cheat starts from the architecture instead of being patched on later.
- Early setup takes more discipline, but MVP risk drops once Connect 4 proves the path.
- Firebase reads and writes can be controlled through compact match documents and narrow listeners.
