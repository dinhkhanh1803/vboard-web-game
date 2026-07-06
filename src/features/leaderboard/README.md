# Leaderboard Feature

## Responsibility

Own public ranking screens, season filters, and player stat previews.

## Boundaries

- May read public leaderboard documents after rules tests allow it.
- Must not write Elo, wins, losses, draws, rank, XP, or rewards directly.
- Ranking calculations belong in functions or pure helpers with tests.
- Current UI reads contract-backed local fixtures only; Firebase reads remain deferred.

## Current State

Phase 12 renders leaderboard entries from `contracts/progression.ts` shaped fixtures, including Elo, win rate, and full W/L/D records.

## Next Task

Wait for Firebase project approval and rules tests before adding real leaderboard reads.
