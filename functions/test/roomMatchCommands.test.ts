// @vitest-environment node
import { describe, expect, it } from "vitest";

import type { MatchDocument, RoomDocument } from "@contracts/roomMatch";
import {
  connect4ColumnCount,
  connect4Module,
  connect4RowCount,
  type Connect4State,
} from "@engine/index";

import {
  createServerRoom,
  joinServerRoom,
  startServerMatch,
  submitServerMove,
} from "../src/domain/roomMatchCommands";

const host = {
  uid: "host-uid",
  displayName: "Khanh",
  avatarUrl: "https://example.test/khanh.png",
};

const guest = {
  uid: "guest-uid",
  displayName: "Guest",
  avatarUrl: null,
};

function createOpenRoom(): RoomDocument {
  return createServerRoom({
    actor: host,
    gameId: "connect-4",
    nowMs: 1_000,
    roomCode: "VB-1042",
    roomId: "room-1",
  }).room;
}

function createFullRoom(): RoomDocument {
  return joinServerRoom({
    actor: guest,
    nowMs: 2_000,
    room: createOpenRoom(),
  }).room;
}

function createActiveMatch(): { room: RoomDocument; match: MatchDocument } {
  return startServerMatch({
    actorUid: host.uid,
    matchId: "match-1",
    nowMs: 3_000,
    room: createFullRoom(),
  });
}

function playColumns(match: MatchDocument, columns: readonly number[]) {
  let nextMatch = match;
  let lastMoveId = 0;

  for (const column of columns) {
    const activeSeatIndex = nextMatch.turn.activeSeatIndex;
    const activePlayer = nextMatch.players.find((player) => player.seatIndex === activeSeatIndex);

    if (activePlayer === undefined) {
      throw new Error("Expected an active player while building a Connect 4 sequence.");
    }

    lastMoveId += 1;
    nextMatch = submitServerMove({
      actorUid: activePlayer.uid,
      match: nextMatch,
      moveId: `move-${lastMoveId}`,
      nowMs: 4_000 + lastMoveId,
      payload: { column },
    }).match;
  }

  return nextMatch;
}

describe("createServerRoom", () => {
  it("creates a server-owned waiting room for an enabled game", () => {
    const { room } = createServerRoom({
      actor: host,
      gameId: "connect-4",
      nowMs: 1_000,
      roomCode: "VB-1042",
      roomId: "room-1",
    });

    expect(room.id).toBe("room-1");
    expect(room.code).toBe("VB-1042");
    expect(room.gameId).toBe("connect-4");
    expect(room.status).toBe("open");
    expect(room.hostUid).toBe(host.uid);
    expect(room.expiresAtMs).toBe(1_801_000);
    expect(room.playerSlots).toEqual([
      {
        avatarUrl: host.avatarUrl,
        displayName: host.displayName,
        isHost: true,
        joinedAtMs: 1_000,
        ready: true,
        seatIndex: 0,
        status: "occupied",
        uid: host.uid,
      },
      {
        avatarUrl: null,
        displayName: null,
        isHost: false,
        joinedAtMs: null,
        ready: false,
        seatIndex: 1,
        status: "open",
        uid: null,
      },
    ]);
  });

  it("rejects disabled games before writing a room", () => {
    expect(() =>
      createServerRoom({
        actor: host,
        gameId: "caro",
        nowMs: 1_000,
        roomCode: "VB-9999",
        roomId: "room-2",
      }),
    ).toThrow("game-not-enabled");
  });
});

describe("joinServerRoom", () => {
  it("fills the next open slot without mutating the original room", () => {
    const room = createOpenRoom();
    const { room: joinedRoom } = joinServerRoom({ actor: guest, nowMs: 2_000, room });

    expect(joinedRoom.status).toBe("full");
    expect(joinedRoom.updatedAtMs).toBe(2_000);
    expect(joinedRoom.playerSlots[1]).toEqual({
      avatarUrl: null,
      displayName: guest.displayName,
      isHost: false,
      joinedAtMs: 2_000,
      ready: true,
      seatIndex: 1,
      status: "occupied",
      uid: guest.uid,
    });
    expect(room.playerSlots[1]?.status).toBe("open");
  });

  it("rejects duplicate joins and expired rooms", () => {
    expect(() =>
      joinServerRoom({
        actor: host,
        nowMs: 2_000,
        room: createOpenRoom(),
      }),
    ).toThrow("already-in-room");

    expect(() =>
      joinServerRoom({
        actor: guest,
        nowMs: 2_000_000,
        room: createOpenRoom(),
      }),
    ).toThrow("room-expired");
  });
});

describe("startServerMatch", () => {
  it("starts a full room with Connect 4 public state and turn timing", () => {
    const { room, match } = createActiveMatch();
    const publicState = match.publicState as Connect4State;

    expect(room.status).toBe("in-match");
    expect(room.matchId).toBe("match-1");
    expect(room.updatedAtMs).toBe(3_000);
    expect(match.status).toBe("active");
    expect(match.publicState).toEqual(
      connect4Module.serializePublicState(connect4Module.createInitialState({ seed: "match-1" })),
    );
    expect(publicState.board).toHaveLength(connect4RowCount);
    expect(publicState.board[0]).toHaveLength(connect4ColumnCount);
    expect(match.turn).toEqual({
      activeSeatIndex: 0,
      turnDeadlineAtMs: 33_000,
      turnDurationSec: 30,
      turnNumber: 1,
      turnStartedAtMs: 3_000,
    });
  });

  it("requires the host and a full room", () => {
    expect(() =>
      startServerMatch({
        actorUid: guest.uid,
        matchId: "match-1",
        nowMs: 3_000,
        room: createFullRoom(),
      }),
    ).toThrow("host-only");

    expect(() =>
      startServerMatch({
        actorUid: host.uid,
        matchId: "match-1",
        nowMs: 3_000,
        room: createOpenRoom(),
      }),
    ).toThrow("room-not-full");
  });
});

describe("submitServerMove", () => {
  it("applies a valid Connect 4 move, advances turn state, and creates an auditable move log", () => {
    const { match } = createActiveMatch();
    const { match: nextMatch, moveLogEntry } = submitServerMove({
      actorUid: host.uid,
      match,
      moveId: "move-1",
      nowMs: 4_000,
      payload: { column: 3 },
    });
    const publicState = nextMatch.publicState as Connect4State;

    expect(publicState.board[connect4RowCount - 1]?.[3]).toBe(0);
    expect(nextMatch.stateVersion).toBe(1);
    expect(nextMatch.turn).toEqual({
      activeSeatIndex: 1,
      turnDeadlineAtMs: 34_000,
      turnDurationSec: 30,
      turnNumber: 2,
      turnStartedAtMs: 4_000,
    });
    expect(moveLogEntry).toEqual({
      actorSeatIndex: 0,
      actorUid: host.uid,
      createdAtMs: 4_000,
      gameId: "connect-4",
      id: "move-1",
      matchId: "match-1",
      moveType: "drop-disc",
      payload: { column: 3 },
      sequence: 1,
      stateVersionAfter: 1,
      stateVersionBefore: 0,
    });
    expect(match.stateVersion).toBe(0);
  });

  it("completes the match when Connect 4 reports a result", () => {
    const { match } = createActiveMatch();
    const completedMatch = playColumns(match, [0, 0, 1, 1, 2, 2, 3]);

    expect(completedMatch.status).toBe("completed");
    expect(completedMatch.completedAtMs).toBe(4_007);
    expect(completedMatch.result).toEqual({
      completedAtMs: 4_007,
      reason: "win",
      winnerSeatIndex: 0,
      winnerUid: host.uid,
    });
    expect(completedMatch.turn.activeSeatIndex).toBeNull();
  });

  it("rejects non-player and invalid-turn moves", () => {
    const { match } = createActiveMatch();

    expect(() =>
      submitServerMove({
        actorUid: "spectator-uid",
        match,
        moveId: "move-1",
        nowMs: 4_000,
        payload: { column: 3 },
      }),
    ).toThrow("actor-not-player");

    expect(() =>
      submitServerMove({
        actorUid: guest.uid,
        match,
        moveId: "move-1",
        nowMs: 4_000,
        payload: { column: 3 },
      }),
    ).toThrow("invalid-move:not-your-turn");
  });
});
