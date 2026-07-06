import { describe, expect, it } from "vitest";

import {
  createInitialMatch,
  createInitialRoom,
  createMoveLogEntry,
  getMatchMovesCollectionPath,
  matchCollectionPath,
  matchResultReasons,
  matchStatuses,
  roomCollectionPath,
  roomPlayerSlotStatuses,
  roomStatuses,
  roomVisibilities,
} from "./roomMatch";

describe("room and match contract constants", () => {
  it("pins the Firestore collection paths and lifecycle values", () => {
    expect(roomCollectionPath).toBe("rooms");
    expect(matchCollectionPath).toBe("matches");
    expect(getMatchMovesCollectionPath("match-1")).toBe("matches/match-1/moves");

    expect(roomStatuses).toEqual(["open", "full", "starting", "in-match", "closed"]);
    expect(roomVisibilities).toEqual(["public", "private"]);
    expect(roomPlayerSlotStatuses).toEqual(["open", "reserved", "occupied"]);
    expect(matchStatuses).toEqual(["pending", "active", "paused", "completed", "abandoned"]);
    expect(matchResultReasons).toEqual(["win", "draw", "timeout", "resignation", "abandoned"]);
  });
});

describe("createInitialRoom", () => {
  it("creates a public waiting room with one occupied host slot and one open slot", () => {
    expect(
      createInitialRoom({
        id: "room-1",
        code: "VB-1042",
        gameId: "connect-4",
        hostUid: "user-1",
        hostDisplayName: "Khanh",
        nowMs: 1000,
        expiresAtMs: 61000,
      }),
    ).toEqual({
      id: "room-1",
      code: "VB-1042",
      gameId: "connect-4",
      status: "open",
      visibility: "public",
      hostUid: "user-1",
      maxPlayers: 2,
      matchId: null,
      createdAtMs: 1000,
      updatedAtMs: 1000,
      expiresAtMs: 61000,
      playerSlots: [
        {
          seatIndex: 0,
          status: "occupied",
          uid: "user-1",
          displayName: "Khanh",
          avatarUrl: null,
          isHost: true,
          ready: true,
          joinedAtMs: 1000,
        },
        {
          seatIndex: 1,
          status: "open",
          uid: null,
          displayName: null,
          avatarUrl: null,
          isHost: false,
          ready: false,
          joinedAtMs: null,
        },
      ],
    });
  });
});

describe("createInitialMatch", () => {
  it("creates a pending match with turn timing and no result yet", () => {
    expect(
      createInitialMatch({
        id: "match-1",
        roomId: "room-1",
        gameId: "connect-4",
        players: [
          { seatIndex: 0, uid: "user-1", displayName: "Khanh" },
          { seatIndex: 1, uid: "user-2", displayName: "Guest" },
        ],
        nowMs: 2000,
        turnDurationSec: 30,
      }),
    ).toEqual({
      id: "match-1",
      roomId: "room-1",
      gameId: "connect-4",
      status: "pending",
      stateVersion: 0,
      createdAtMs: 2000,
      updatedAtMs: 2000,
      startedAtMs: null,
      completedAtMs: null,
      players: [
        {
          seatIndex: 0,
          uid: "user-1",
          displayName: "Khanh",
          avatarUrl: null,
          connected: true,
          resignedAtMs: null,
        },
        {
          seatIndex: 1,
          uid: "user-2",
          displayName: "Guest",
          avatarUrl: null,
          connected: true,
          resignedAtMs: null,
        },
      ],
      turn: {
        activeSeatIndex: 0,
        turnNumber: 1,
        turnStartedAtMs: null,
        turnDurationSec: 30,
        turnDeadlineAtMs: null,
      },
      result: {
        winnerUid: null,
        winnerSeatIndex: null,
        reason: null,
        completedAtMs: null,
      },
      publicState: null,
    });
  });
});

describe("createMoveLogEntry", () => {
  it("captures an auditable move with sequence and state versions", () => {
    expect(
      createMoveLogEntry({
        id: "move-1",
        matchId: "match-1",
        gameId: "connect-4",
        sequence: 1,
        actorUid: "user-1",
        actorSeatIndex: 0,
        moveType: "drop-disc",
        payload: { column: 3 },
        stateVersionBefore: 0,
        stateVersionAfter: 1,
        createdAtMs: 3000,
      }),
    ).toEqual({
      id: "move-1",
      matchId: "match-1",
      gameId: "connect-4",
      sequence: 1,
      actorUid: "user-1",
      actorSeatIndex: 0,
      moveType: "drop-disc",
      payload: { column: 3 },
      stateVersionBefore: 0,
      stateVersionAfter: 1,
      createdAtMs: 3000,
    });
  });
});
