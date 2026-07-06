import {
  calculateEloRatingChange,
  createLeaderboardEntry,
  createMatchHistoryEntry,
  type LeaderboardEntry,
  type MatchHistoryEntry,
  type ProgressionResult,
} from "@contracts/progression";
import type { MatchDocument, MatchPlayer } from "@contracts/roomMatch";
import type { PublicProfile, PublicProfileGameStats } from "@contracts/userProfile";

export type CreateMatchProgressionWritesInput = {
  match: MatchDocument;
  profilesByUid: Record<string, PublicProfile>;
  nowMs: number;
};

export type MatchProgressionWriteSet = {
  profileUpdates: Record<string, PublicProfile>;
  leaderboardEntries: LeaderboardEntry[];
  matchHistoryEntries: MatchHistoryEntry[];
};

export function createMatchProgressionWrites(
  input: CreateMatchProgressionWritesInput,
): MatchProgressionWriteSet {
  assertCompletedMatch(input.match);

  if (input.match.players.length !== 2) {
    throw new Error("progression-requires-two-players");
  }

  const [leftPlayer, rightPlayer] = input.match.players;

  if (leftPlayer === undefined || rightPlayer === undefined) {
    throw new Error("progression-player-missing");
  }

  const leftProfile = getProfile(input.profilesByUid, leftPlayer.uid);
  const rightProfile = getProfile(input.profilesByUid, rightPlayer.uid);
  const leftStats = leftProfile.statsByGame[input.match.gameId];
  const rightStats = rightProfile.statsByGame[input.match.gameId];
  const leftResult = getPlayerResult(input.match, leftPlayer);
  const rightResult = getOppositeResult(leftResult);
  const eloChange = calculateEloRatingChange({
    opponentElo: rightStats.elo,
    playerElo: leftStats.elo,
    result: leftResult,
  });
  const nextLeftProfile = updateProfileStats({
    eloAfter: eloChange.playerNextElo,
    nowMs: input.nowMs,
    profile: leftProfile,
    result: leftResult,
    gameId: input.match.gameId,
  });
  const nextRightProfile = updateProfileStats({
    eloAfter: eloChange.opponentNextElo,
    nowMs: input.nowMs,
    profile: rightProfile,
    result: rightResult,
    gameId: input.match.gameId,
  });
  const updatedProfiles = [nextLeftProfile, nextRightProfile];

  return {
    leaderboardEntries: updatedProfiles
      .map((profile) =>
        createLeaderboardEntry({
          gameId: input.match.gameId,
          nowMs: input.nowMs,
          profile,
          rank: 0,
        }),
      )
      .sort((left, right) => right.elo - left.elo)
      .map((entry, index) => ({ ...entry, rank: index + 1 })),
    matchHistoryEntries: [
      createMatchHistoryEntry({
        completedAtMs: input.match.completedAtMs ?? input.nowMs,
        createdAtMs: input.nowMs,
        eloAfter: eloChange.playerNextElo,
        eloBefore: leftStats.elo,
        gameId: input.match.gameId,
        matchId: input.match.id,
        opponentDisplayName: rightPlayer.displayName,
        opponentUid: rightPlayer.uid,
        playerDisplayName: leftPlayer.displayName,
        playerUid: leftPlayer.uid,
        reason: input.match.result.reason ?? "win",
        result: leftResult,
      }),
      createMatchHistoryEntry({
        completedAtMs: input.match.completedAtMs ?? input.nowMs,
        createdAtMs: input.nowMs,
        eloAfter: eloChange.opponentNextElo,
        eloBefore: rightStats.elo,
        gameId: input.match.gameId,
        matchId: input.match.id,
        opponentDisplayName: leftPlayer.displayName,
        opponentUid: leftPlayer.uid,
        playerDisplayName: rightPlayer.displayName,
        playerUid: rightPlayer.uid,
        reason: input.match.result.reason ?? "win",
        result: rightResult,
      }),
    ],
    profileUpdates: {
      [leftPlayer.uid]: nextLeftProfile,
      [rightPlayer.uid]: nextRightProfile,
    },
  };
}

function assertCompletedMatch(match: MatchDocument): void {
  if (match.status !== "completed" || match.completedAtMs === null) {
    throw new Error("match-not-completed");
  }

  if (match.result.reason === null) {
    throw new Error("match-result-missing");
  }
}

function getProfile(profilesByUid: Record<string, PublicProfile>, uid: string): PublicProfile {
  const profile = profilesByUid[uid];

  if (profile === undefined) {
    throw new Error("profile-missing");
  }

  return profile;
}

function getPlayerResult(match: MatchDocument, player: MatchPlayer): ProgressionResult {
  if (match.result.reason === "draw" || match.result.winnerUid === null) {
    return "draw";
  }

  return match.result.winnerUid === player.uid ? "win" : "loss";
}

function getOppositeResult(result: ProgressionResult): ProgressionResult {
  if (result === "win") {
    return "loss";
  }

  if (result === "loss") {
    return "win";
  }

  return "draw";
}

function updateProfileStats(input: {
  profile: PublicProfile;
  gameId: MatchDocument["gameId"];
  result: ProgressionResult;
  eloAfter: number;
  nowMs: number;
}): PublicProfile {
  const currentStats = input.profile.statsByGame[input.gameId];
  const nextStats = applyResultToStats(currentStats, input.result, input.eloAfter);

  return {
    ...input.profile,
    statsByGame: {
      ...input.profile.statsByGame,
      [input.gameId]: nextStats,
    },
    updatedAtMs: input.nowMs,
  };
}

function applyResultToStats(
  stats: PublicProfileGameStats,
  result: ProgressionResult,
  eloAfter: number,
): PublicProfileGameStats {
  const currentStreak = result === "win" ? stats.currentStreak + 1 : 0;

  return {
    ...stats,
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    draws: stats.draws + (result === "draw" ? 1 : 0),
    elo: eloAfter,
    gamesPlayed: stats.gamesPlayed + 1,
    losses: stats.losses + (result === "loss" ? 1 : 0),
    wins: stats.wins + (result === "win" ? 1 : 0),
  };
}
