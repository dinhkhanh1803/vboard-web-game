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

## User/Profile Contracts

Phase 6.1 pins the account/profile data language in `contracts/userProfile.ts`. These contracts are TypeScript-only for now; no Firestore writes exist yet.

### `users/{userId}`

Private account document. Client UI must not write role, status, progression, or moderation fields directly.

| Field           | Type                                   | Notes                                                |
| --------------- | -------------------------------------- | ---------------------------------------------------- |
| `uid`           | `string`                               | Firebase Auth UID and document ID.                   |
| `email`         | `string \| null`                       | Private account email, absent for guest profiles.    |
| `emailVerified` | `boolean`                              | Mirrors auth state at profile creation/update time.  |
| `providerIds`   | `("email" \| "google" \| "guest")[]`   | Supported sign-in methods for this account.          |
| `role`          | `"player" \| "moderator" \| "admin"`   | Defaults to `player`; server/admin controlled later. |
| `status`        | `"active" \| "suspended" \| "deleted"` | Defaults to `active`; server/admin controlled later. |
| `createdAtMs`   | `number`                               | Unix epoch milliseconds.                             |
| `updatedAtMs`   | `number`                               | Unix epoch milliseconds.                             |
| `lastLoginAtMs` | `number \| null`                       | Unix epoch milliseconds or null before first login.  |

### `profilesPublic/{userId}`

Public profile document for lobbies, leaderboards, match panels, and profile pages.

| Field         | Type                                                    | Notes                                         |
| ------------- | ------------------------------------------------------- | --------------------------------------------- |
| `uid`         | `string`                                                | Firebase Auth UID and document ID.            |
| `displayName` | `string`                                                | Normalized and capped for compact UI cards.   |
| `avatarUrl`   | `string \| null`                                        | Storage-backed avatar later; null by default. |
| `countryCode` | `string \| null`                                        | Optional profile metadata.                    |
| `bio`         | `string \| null`                                        | Optional profile metadata.                    |
| `level`       | `number`                                                | Defaults to `1`.                              |
| `xp`          | `number`                                                | Defaults to `0`.                              |
| `statsByGame` | `Record<"connect-4" \| "caro", PublicProfileGameStats>` | Per-game public ranking summary.              |
| `createdAtMs` | `number`                                                | Unix epoch milliseconds.                      |
| `updatedAtMs` | `number`                                                | Unix epoch milliseconds.                      |

Default per-game stats start with Elo `1000`, zero wins/losses/draws, zero games played, and zero streaks.
