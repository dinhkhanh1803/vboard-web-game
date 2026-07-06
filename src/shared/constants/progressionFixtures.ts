import {
  createLeaderboardEntry,
  createMatchHistoryEntry,
  type LeaderboardEntry,
  type MatchHistoryEntry,
} from "@contracts/progression";
import type { GameId } from "@contracts/userProfile";

import { demoPublicProfile } from "@/shared/constants/profileFixtures";

const updatedAtMs = 1_725_000_300_000;

export const demoLeaderboardEntries: LeaderboardEntry[] = [
  createLeaderboardEntry({
    gameId: "connect-4",
    nowMs: updatedAtMs,
    profile: demoPublicProfile,
    rank: 1,
  }),
  {
    avatarUrl: null,
    displayName: "Arena Bot",
    draws: 0,
    elo: 1195,
    gameId: "caro",
    gamesPlayed: 13,
    losses: 5,
    rank: 2,
    uid: "arena-bot",
    updatedAtMs,
    winRatePercent: 62,
    wins: 8,
  },
  {
    avatarUrl: null,
    displayName: "Guest Pilot",
    draws: 1,
    elo: 1130,
    gameId: "connect-4",
    gamesPlayed: 11,
    losses: 4,
    rank: 3,
    uid: "guest-pilot",
    updatedAtMs,
    winRatePercent: 55,
    wins: 6,
  },
];

export const demoMatchHistoryEntries: MatchHistoryEntry[] = [
  createMatchHistoryEntry({
    completedAtMs: 1_725_000_200_000,
    createdAtMs: updatedAtMs,
    eloAfter: 1240,
    eloBefore: 1224,
    gameId: "connect-4",
    matchId: "demo-history-1",
    opponentDisplayName: "Arena Bot",
    opponentUid: "arena-bot",
    playerDisplayName: "Khanh",
    playerUid: demoPublicProfile.uid,
    reason: "win",
    result: "win",
  }),
  createMatchHistoryEntry({
    completedAtMs: 1_725_000_100_000,
    createdAtMs: updatedAtMs,
    eloAfter: 1195,
    eloBefore: 1203,
    gameId: "caro",
    matchId: "demo-history-2",
    opponentDisplayName: "Guest Pilot",
    opponentUid: "guest-pilot",
    playerDisplayName: "Khanh",
    playerUid: demoPublicProfile.uid,
    reason: "win",
    result: "loss",
  }),
];

export function getDisplayNameForGame(gameId: GameId): string {
  return gameId === "connect-4" ? "Connect 4" : "Caro";
}

export function formatRecord(input: { wins: number; losses: number; draws: number }): string {
  return `${input.wins}W ${input.losses}L ${input.draws}D`;
}

export function formatEloDelta(eloDelta: number): string {
  return `${eloDelta > 0 ? "+" : ""}${eloDelta} Elo`;
}
