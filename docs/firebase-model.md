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

## Game Catalog Contracts

Phase 6.2 pins the game catalog data language in `contracts/gameCatalog.ts`. These contracts are TypeScript-only for now; no Firestore writes exist yet.

### `games/{gameId}`

Catalog document for public game discovery, lobby filtering, and feature flag decisions.

| Field                   | Type                                         | Notes                                              |
| ----------------------- | -------------------------------------------- | -------------------------------------------------- |
| `id`                    | `"connect-4" \| "caro"`                      | Firestore document ID and shared game identifier.  |
| `displayName`           | `string`                                     | Full UI label.                                     |
| `shortName`             | `string`                                     | Compact UI label.                                  |
| `summary`               | `string`                                     | Short catalog/lobby copy.                          |
| `status`                | `"available" \| "coming-soon" \| "disabled"` | Public availability state.                         |
| `enabled`               | `boolean`                                    | Whether users may enter matchmaking/lobby flows.   |
| `minPlayers`            | `number`                                     | Minimum seats required to start.                   |
| `maxPlayers`            | `number`                                     | Maximum player seats.                              |
| `estimatedRoundMinutes` | `number`                                     | UI estimate for catalog and lobby cards.           |
| `renderer`              | `"pixi"`                                     | Frontend renderer boundary.                        |
| `rulesEngineKey`        | `string`                                     | Pure rules engine key used later by `game-engine`. |
| `rulesRoute`            | `string`                                     | Public rules/how-to-play route.                    |
| `lobbyRoute`            | `string`                                     | UI entry route for this game.                      |
| `matchRoutePattern`     | `string`                                     | Shared match route pattern.                        |

Current MVP catalog entries:

| Game ID     | Status        | Enabled | Rules Engine | Round      |
| ----------- | ------------- | ------- | ------------ | ---------- |
| `connect-4` | `available`   | `true`  | `connect4`   | 10 minutes |
| `caro`      | `coming-soon` | `false` | `caro`       | 15 minutes |

## Room And Match Contracts

Phase 6.3 pins the lobby and official match data language in `contracts/roomMatch.ts`. These contracts are TypeScript-only for now; no Firestore writes exist yet.

### `rooms/{roomId}`

Waiting room document used before a match starts.

| Field         | Type                                                       | Notes                                             |
| ------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| `id`          | `string`                                                   | Firestore document ID.                            |
| `code`        | `string`                                                   | Short invite/join code shown in UI.               |
| `gameId`      | `"connect-4" \| "caro"`                                    | Shared game identifier.                           |
| `status`      | `"open" \| "full" \| "starting" \| "in-match" \| "closed"` | Room lifecycle before official match state.       |
| `visibility`  | `"public" \| "private"`                                    | Public rooms may appear in lobby queries.         |
| `hostUid`     | `string`                                                   | Host account UID.                                 |
| `maxPlayers`  | `number`                                                   | Player seat capacity; MVP defaults to `2`.        |
| `matchId`     | `string \| null`                                           | Set when the room transitions into a match later. |
| `playerSlots` | `RoomPlayerSlot[]`                                         | Seat order, ready state, host flag, and occupant. |
| `createdAtMs` | `number`                                                   | Unix epoch milliseconds.                          |
| `updatedAtMs` | `number`                                                   | Unix epoch milliseconds.                          |
| `expiresAtMs` | `number`                                                   | Room cleanup deadline.                            |

### `matches/{matchId}`

Official public match document. Server workflows will own writes later.

| Field           | Type                                                              | Notes                                            |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------ |
| `id`            | `string`                                                          | Firestore document ID.                           |
| `roomId`        | `string`                                                          | Source room ID.                                  |
| `gameId`        | `"connect-4" \| "caro"`                                           | Shared game identifier.                          |
| `status`        | `"pending" \| "active" \| "paused" \| "completed" \| "abandoned"` | Official match lifecycle.                        |
| `players`       | `MatchPlayer[]`                                                   | Seat order, UID, display name, connection.       |
| `turn`          | `MatchTurn`                                                       | Active seat, turn number, and deadline fields.   |
| `result`        | `MatchResult`                                                     | Winner and completion reason, null while live.   |
| `publicState`   | `Record<string, unknown> \| null`                                 | Compact renderer/rules state per game.           |
| `stateVersion`  | `number`                                                          | Monotonic version incremented by official moves. |
| `createdAtMs`   | `number`                                                          | Unix epoch milliseconds.                         |
| `updatedAtMs`   | `number`                                                          | Unix epoch milliseconds.                         |
| `startedAtMs`   | `number \| null`                                                  | Null before active play starts.                  |
| `completedAtMs` | `number \| null`                                                  | Null until completion.                           |

### `matches/{matchId}/moves/{moveId}`

Auditable move log entry stored outside the compact match document.

| Field                | Type                      | Notes                                         |
| -------------------- | ------------------------- | --------------------------------------------- |
| `id`                 | `string`                  | Firestore document ID.                        |
| `matchId`            | `string`                  | Parent match ID.                              |
| `gameId`             | `"connect-4" \| "caro"`   | Shared game identifier.                       |
| `sequence`           | `number`                  | Monotonic move order within a match.          |
| `actorUid`           | `string`                  | UID that submitted the move.                  |
| `actorSeatIndex`     | `number`                  | Seat index used by the rules engine.          |
| `moveType`           | `string`                  | Game-specific move verb, such as `drop-disc`. |
| `payload`            | `Record<string, unknown>` | Game-specific move payload.                   |
| `stateVersionBefore` | `number`                  | Match state version before applying the move. |
| `stateVersionAfter`  | `number`                  | Match state version after applying the move.  |
| `createdAtMs`        | `number`                  | Unix epoch milliseconds.                      |

## Analytics Event Contracts

Phase 6.4 pins product analytics event language in `contracts/analyticsEvents.ts`. These contracts are TypeScript-only for now; no Firebase Analytics SDK calls or event writes exist yet.

### Event Envelope

| Field         | Type                     | Notes                                            |
| ------------- | ------------------------ | ------------------------------------------------ |
| `name`        | `AnalyticsEventName`     | Stable snake_case event identifier.              |
| `category`    | `AnalyticsEventCategory` | Broad product area for filtering and dashboards. |
| `payload`     | `AnalyticsEventPayload`  | Event-specific typed payload.                    |
| `createdAtMs` | `number`                 | Unix epoch milliseconds from the caller.         |

### Categories

| Category       | Initial Purpose                        |
| -------------- | -------------------------------------- |
| `navigation`   | Route visibility and app navigation.   |
| `auth`         | Auth entry and provider selection.     |
| `profile`      | Profile visibility.                    |
| `game_catalog` | Catalog views and game selection.      |
| `lobby`        | Lobby view and quick-match intent.     |
| `room`         | Room create, join, and ready state.    |
| `match`        | Match view, start, moves, and results. |

### Initial Event Names

| Event Name               | Category       |
| ------------------------ | -------------- |
| `app_route_viewed`       | `navigation`   |
| `auth_entry_viewed`      | `auth`         |
| `auth_provider_selected` | `auth`         |
| `profile_viewed`         | `profile`      |
| `game_catalog_viewed`    | `game_catalog` |
| `game_selected`          | `game_catalog` |
| `lobby_viewed`           | `lobby`        |
| `quick_match_clicked`    | `lobby`        |
| `room_created`           | `room`         |
| `room_joined`            | `room`         |
| `room_ready_changed`     | `room`         |
| `match_viewed`           | `match`        |
| `match_started`          | `match`        |
| `match_move_submitted`   | `match`        |
| `match_completed`        | `match`        |
