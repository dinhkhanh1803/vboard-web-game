import type { GameId } from "./gameCatalog";
import type { MatchResultReason } from "./roomMatch";
import type { PublicProfile } from "./userProfile";

export const progressionCollectionPaths = {
  leaderboardEntries: "leaderboardEntries",
  matchHistoryEntries: "matchHistoryEntries",
} as const;

export const progressionResults = ["win", "loss", "draw"] as const;
export type ProgressionResult = (typeof progressionResults)[number];

export type EloRatingChangeInput = {
  playerElo: number;
  opponentElo: number;
  result: ProgressionResult;
  kFactor?: number;
};

export type EloRatingChange = {
  playerDelta: number;
  opponentDelta: number;
  playerNextElo: number;
  opponentNextElo: number;
};

export type LeaderboardEntry = {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  gameId: GameId;
  rank: number;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  winRatePercent: number;
  updatedAtMs: number;
};

export type CreateLeaderboardEntryInput = {
  profile: PublicProfile;
  gameId: GameId;
  rank: number;
  nowMs: number;
};

export type MatchHistoryEntry = {
  id: string;
  matchId: string;
  gameId: GameId;
  playerUid: string;
  playerDisplayName: string;
  opponentUid: string;
  opponentDisplayName: string;
  result: ProgressionResult;
  reason: MatchResultReason;
  eloBefore: number;
  eloAfter: number;
  eloDelta: number;
  completedAtMs: number;
  createdAtMs: number;
};

export type CreateMatchHistoryEntryInput = Omit<MatchHistoryEntry, "eloDelta" | "id">;

const defaultKFactor = 32;

export function calculateEloRatingChange(input: EloRatingChangeInput): EloRatingChange {
  const kFactor = input.kFactor ?? defaultKFactor;
  const playerScore = getScoreForResult(input.result);
  const opponentScore = 1 - playerScore;
  const playerExpectedScore = calculateExpectedScore(input.playerElo, input.opponentElo);
  const opponentExpectedScore = calculateExpectedScore(input.opponentElo, input.playerElo);
  const playerDelta = Math.round(kFactor * (playerScore - playerExpectedScore));
  const opponentDelta = Math.round(kFactor * (opponentScore - opponentExpectedScore));

  return {
    opponentDelta,
    opponentNextElo: input.opponentElo + opponentDelta,
    playerDelta,
    playerNextElo: input.playerElo + playerDelta,
  };
}

export function createLeaderboardEntry(input: CreateLeaderboardEntryInput): LeaderboardEntry {
  const stats = input.profile.statsByGame[input.gameId];

  return {
    avatarUrl: input.profile.avatarUrl,
    displayName: input.profile.displayName,
    draws: stats.draws,
    elo: stats.elo,
    gameId: input.gameId,
    gamesPlayed: stats.gamesPlayed,
    losses: stats.losses,
    rank: input.rank,
    uid: input.profile.uid,
    updatedAtMs: input.nowMs,
    winRatePercent: calculateWinRatePercent(stats.wins, stats.gamesPlayed),
    wins: stats.wins,
  };
}

export function createMatchHistoryEntry(input: CreateMatchHistoryEntryInput): MatchHistoryEntry {
  return {
    ...input,
    eloDelta: input.eloAfter - input.eloBefore,
    id: `${input.matchId}_${input.playerUid}`,
  };
}

export function calculateWinRatePercent(wins: number, gamesPlayed: number): number {
  if (gamesPlayed <= 0) {
    return 0;
  }

  return Math.round((wins / gamesPlayed) * 100);
}

function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + 10 ** ((opponentElo - playerElo) / 400));
}

function getScoreForResult(result: ProgressionResult): number {
  if (result === "win") {
    return 1;
  }

  if (result === "loss") {
    return 0;
  }

  return 0.5;
}
