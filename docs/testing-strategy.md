# Testing Strategy

## Required Test Layers

| Layer | Purpose |
| --- | --- |
| Game engine unit tests | Validate rules, legal moves, illegal moves, result detection, and compact state transitions. |
| Functions integration tests | Validate `createRoom`, `joinRoom`, `startMatch`, `submitMove`, `claimTimeout`, ranking updates, and race handling. |
| Security rules tests | Prove users cannot write official match state, leaderboard data, roles, or private opponent data. |
| Realtime tests | Confirm two clients receive correct room and match updates without broad listeners. |
| Responsive UI checks | Confirm lobby and match screens fit mobile first. |
| Cost checks | Estimate Firestore reads and writes per match before production. |

## Completion Bar Before Production

- Emulator tests cover every opened Firebase rule path.
- Game rules have deterministic unit tests before UI integration.
- Functions use transactions for turn-sensitive writes.
- Match timers use deadlines, not per-second writes.
- Build, lint, typecheck, and tests run in CI before deploy preview.
