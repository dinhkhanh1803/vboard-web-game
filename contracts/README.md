# Shared Product Contracts

This folder owns TypeScript contracts that describe product data before Firebase workflows write it.

## Rules

- Contracts are framework-neutral and should not import React, Firebase SDK clients, or Cloud Functions handlers.
- Add tests next to each contract file before changing a shape.
- Update `docs/firebase-model.md` whenever collection or field names change.
- Do not write Firestore documents from this folder; it only describes data.

## Current Contracts

- `userProfile.ts`: `users/{uid}` private account documents and `profilesPublic/{uid}` public profile documents.
- `gameCatalog.ts`: `games/{gameId}` metadata for Connect 4, Caro, route contracts, player counts, renderer, and availability.
- `roomMatch.ts`: `rooms/{roomId}`, `matches/{matchId}`, and `matches/{matchId}/moves/{moveId}` lifecycle contracts.
- `progression.ts`: Elo rating helper, public leaderboard row shape, and per-player match history entry shape.
- `moderationSafety.ts`: moderation report shape, admin preview role gate helper, and game feature flag preview shape.
- `analyticsEvents.ts`: stable product analytics event names, categories, payload contracts, and event envelope helper.
