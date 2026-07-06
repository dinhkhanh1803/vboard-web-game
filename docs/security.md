# Security Foundation

## Default Posture

Firebase rules start closed. Every future read or write path should be opened only with a matching emulator rules test.

## Client Permissions

| Data | Client May Do | Client Must Not Do |
| --- | --- | --- |
| Profile | Update own safe display fields. | Change role, coins, level, ban status, or admin flags. |
| Room | Request create, join, leave, or ready through functions. | Directly set room status or player slots. |
| Match | Read own active match state. | Write board, winner, turn, timer, or result directly. |
| Move | Submit intent through functions. | Write moves subcollections directly. |
| Leaderboard | Read public ranking data. | Update Elo, rank, wins, losses, or rewards. |
| Private state | Read only own private state when needed. | Read opponent hidden data. |

## Abuse Controls To Add With Implementation

- Rate limits for room creation, quick match, move submission, chat, and reports.
- App Check enforcement in production.
- Firestore transactions for move submission and room state changes.
- `stateVersion` checks to reject stale client writes.
- Audit logs for match results, admin actions, and moderation decisions.
- Scheduled cleanup for expired rooms, abandoned matches, and stale queues.
