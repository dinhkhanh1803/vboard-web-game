// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createInitialPublicProfile, type PublicProfile } from "@contracts/userProfile";
import { createInitialMatch, type MatchDocument } from "@contracts/roomMatch";

import { createMatchProgressionWrites } from "../src/domain/progressionCommands";

function createProfile(input: {
  uid: string;
  displayName: string;
  elo: number;
  wins: number;
  losses: number;
  draws?: number;
  nowMs?: number;
}): PublicProfile {
  const profile = createInitialPublicProfile({
    uid: input.uid,
    displayName: input.displayName,
    nowMs: input.nowMs ?? 1_000,
  });
  const gamesPlayed = input.wins + input.losses + (input.draws ?? 0);

  return {
    ...profile,
    statsByGame: {
      ...profile.statsByGame,
      "connect-4": {
        bestStreak: input.wins > 0 ? 2 : 0,
        currentStreak: input.wins > 0 ? 1 : 0,
        draws: input.draws ?? 0,
        elo: input.elo,
        gamesPlayed,
        losses: input.losses,
        wins: input.wins,
      },
    },
  };
}

function createCompletedMatch(): MatchDocument {
  return {
    ...createInitialMatch({
      gameId: "connect-4",
      id: "match-1",
      nowMs: 2_000,
      players: [
        { displayName: "Khanh", seatIndex: 0, uid: "host-uid" },
        { displayName: "Arena Bot", seatIndex: 1, uid: "guest-uid" },
      ],
      roomId: "room-1",
      turnDurationSec: 30,
    }),
    completedAtMs: 5_000,
    result: {
      completedAtMs: 5_000,
      reason: "win",
      winnerSeatIndex: 0,
      winnerUid: "host-uid",
    },
    status: "completed",
  };
}

describe("createMatchProgressionWrites", () => {
  it("creates profile, leaderboard, and match history writes for a completed win", () => {
    const hostProfile = createProfile({
      uid: "host-uid",
      displayName: "Khanh",
      elo: 1000,
      wins: 2,
      losses: 1,
    });
    const guestProfile = createProfile({
      uid: "guest-uid",
      displayName: "Arena Bot",
      elo: 1000,
      wins: 1,
      losses: 2,
    });

    const writes = createMatchProgressionWrites({
      match: createCompletedMatch(),
      nowMs: 5_100,
      profilesByUid: {
        "guest-uid": guestProfile,
        "host-uid": hostProfile,
      },
    });

    expect(writes.profileUpdates["host-uid"]?.statsByGame["connect-4"]).toMatchObject({
      currentStreak: 2,
      elo: 1016,
      gamesPlayed: 4,
      losses: 1,
      wins: 3,
    });
    expect(writes.profileUpdates["guest-uid"]?.statsByGame["connect-4"]).toMatchObject({
      currentStreak: 0,
      elo: 984,
      gamesPlayed: 4,
      losses: 3,
      wins: 1,
    });
    expect(writes.leaderboardEntries).toEqual([
      expect.objectContaining({
        displayName: "Khanh",
        elo: 1016,
        rank: 1,
        uid: "host-uid",
      }),
      expect.objectContaining({
        displayName: "Arena Bot",
        elo: 984,
        rank: 2,
        uid: "guest-uid",
      }),
    ]);
    expect(writes.matchHistoryEntries).toEqual([
      expect.objectContaining({
        eloAfter: 1016,
        eloBefore: 1000,
        eloDelta: 16,
        id: "match-1_host-uid",
        opponentUid: "guest-uid",
        playerUid: "host-uid",
        result: "win",
      }),
      expect.objectContaining({
        eloAfter: 984,
        eloBefore: 1000,
        eloDelta: -16,
        id: "match-1_guest-uid",
        opponentUid: "host-uid",
        playerUid: "guest-uid",
        result: "loss",
      }),
    ]);
    expect(hostProfile.statsByGame["connect-4"].elo).toBe(1000);
  });

  it("rejects matches that are not completed yet", () => {
    const activeMatch = {
      ...createCompletedMatch(),
      completedAtMs: null,
      status: "active",
    } satisfies MatchDocument;

    expect(() =>
      createMatchProgressionWrites({
        match: activeMatch,
        nowMs: 5_100,
        profilesByUid: {},
      }),
    ).toThrow("match-not-completed");
  });
});
