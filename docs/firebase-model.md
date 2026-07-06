# Firebase Foundation

## Services

| Service           | Initial Use                                             |
| ----------------- | ------------------------------------------------------- |
| Authentication    | Email, Google, and future guest mode identities.        |
| Firestore         | Primary product data and realtime match state.          |
| Realtime Database | Presence, online status, and disconnect handling.       |
| Cloud Functions   | Server-authoritative room and move workflows.           |
| Storage           | Future avatars, thumbnails, and admin-uploaded assets.  |
| Hosting           | React SPA deploys with preview and production channels. |
| App Check         | Production abuse reduction after web app integration.   |
| Analytics         | Funnel, match, ads, and retention events.               |

## Initial Collections

| Collection                                 | Purpose                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `users/{userId}`                           | Private account, role, progression, and status fields.                  |
| `profilesPublic/{userId}`                  | Public display profile for lobbies and leaderboards.                    |
| `games/{gameId}`                           | Game catalog, enabled flags, player counts, and metadata.               |
| `rooms/{roomId}`                           | Waiting room state before a match starts.                               |
| `matches/{matchId}`                        | Official match status, players, turn, result, and compact public state. |
| `matches/{matchId}/moves/{moveId}`         | Auditable move log with sequence and state versions.                    |
| `matches/{matchId}/privateStates/{userId}` | Hidden per-player state for later games.                                |
| `leaderboards/{seasonId}/entries/{userId}` | Elo and stats by season and game.                                       |
| `reports/{reportId}`                       | User reports and moderation queue.                                      |
| `adminLogs/{logId}`                        | Admin actions and operational audit trail.                              |
| `appConfig/{configId}`                     | Feature flags, ads config, season settings, and limits.                 |
| `matchmakingQueues/{queueId}`              | Quick match queue coordination.                                         |

## Listener Rules

- Listen to a single match document during play.
- Listen to a bounded room query in lobby screens.
- Do not listen to whole `rooms`, `matches`, or leaderboard collections.
- Do not write timers every second. Store `turnStartedAt`, `turnDurationSec`, and `turnDeadlineAt`.
- Store large or replay-oriented move history in subcollections, not directly on the match document.
