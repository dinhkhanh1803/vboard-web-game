import { describe, expect, it } from "vitest";

import { createInitialPublicProfile } from "./userProfile";
import {
  calculateEloRatingChange,
  createLeaderboardEntry,
  createMatchHistoryEntry,
  progressionCollectionPaths,
} from "./progression";

describe("progression contract constants", () => {
  it("pins collection names for leaderboard and match history reads", () => {
    expect(progressionCollectionPaths).toEqual({
      leaderboardEntries: "leaderboardEntries",
      matchHistoryEntries: "matchHistoryEntries",
    });
  });
});

describe("calculateEloRatingChange", () => {
  it("gives equal 1000-rated players a 16 point swing for a decisive game", () => {
    expect(
      calculateEloRatingChange({
        playerElo: 1000,
        opponentElo: 1000,
        result: "win",
      }),
    ).toEqual({
      opponentDelta: -16,
      opponentNextElo: 984,
      playerDelta: 16,
      playerNextElo: 1016,
    });
  });

  it("rewards underdog wins more than expected wins and keeps draws balanced", () => {
    expect(
      calculateEloRatingChange({
        playerElo: 1000,
        opponentElo: 1200,
        result: "win",
      }).playerDelta,
    ).toBeGreaterThan(16);

    expect(
      calculateEloRatingChange({
        playerElo: 1200,
        opponentElo: 1000,
        result: "draw",
      }),
    ).toMatchObject({
      opponentDelta: 8,
      playerDelta: -8,
    });
  });
});

describe("createLeaderboardEntry", () => {
  it("creates a compact public leaderboard row from profile stats", () => {
    const profile = createInitialPublicProfile({
      uid: "user-1",
      displayName: "Khanh",
      avatarUrl: "https://example.test/khanh.png",
      countryCode: "VN",
      nowMs: 1_000,
    });

    profile.statsByGame["connect-4"] = {
      bestStreak: 4,
      currentStreak: 2,
      draws: 1,
      elo: 1234,
      gamesPlayed: 10,
      losses: 2,
      wins: 7,
    };

    expect(
      createLeaderboardEntry({
        gameId: "connect-4",
        nowMs: 2_000,
        profile,
        rank: 3,
      }),
    ).toEqual({
      avatarUrl: "https://example.test/khanh.png",
      displayName: "Khanh",
      draws: 1,
      elo: 1234,
      gameId: "connect-4",
      gamesPlayed: 10,
      losses: 2,
      rank: 3,
      uid: "user-1",
      updatedAtMs: 2_000,
      winRatePercent: 70,
      wins: 7,
    });
  });
});

describe("createMatchHistoryEntry", () => {
  it("creates a per-player history entry with Elo before and after values", () => {
    expect(
      createMatchHistoryEntry({
        completedAtMs: 5_000,
        createdAtMs: 5_100,
        eloAfter: 1016,
        eloBefore: 1000,
        gameId: "connect-4",
        matchId: "match-1",
        opponentDisplayName: "Arena Bot",
        opponentUid: "guest-uid",
        playerDisplayName: "Khanh",
        playerUid: "host-uid",
        reason: "win",
        result: "win",
      }),
    ).toEqual({
      completedAtMs: 5_000,
      createdAtMs: 5_100,
      eloAfter: 1016,
      eloBefore: 1000,
      eloDelta: 16,
      gameId: "connect-4",
      id: "match-1_host-uid",
      matchId: "match-1",
      opponentDisplayName: "Arena Bot",
      opponentUid: "guest-uid",
      playerDisplayName: "Khanh",
      playerUid: "host-uid",
      reason: "win",
      result: "win",
    });
  });
});
