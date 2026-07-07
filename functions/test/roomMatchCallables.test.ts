// @vitest-environment node
import { describe, expect, it } from "vitest";

import type { GameId } from "@contracts/gameCatalog";
import type { MatchDocument, MatchMoveLogEntry, RoomDocument } from "@contracts/roomMatch";
import {
  connect4Module,
  deserializeConnect4DocumentState,
  type Connect4DocumentState,
} from "@engine/index";

import {
  createServerRoom,
  joinServerRoom,
  startServerMatch,
} from "../src/domain/roomMatchCommands";
import {
  createRoomCallableHandler,
  joinRoomCallableHandler,
  startMatchCallableHandler,
  submitMoveCallableHandler,
  type RoomMatchCallableDeps,
  type RoomMatchCallableRequest,
  type RoomMatchCallableTransaction,
} from "../src/callable/roomMatchCallables";

type CallableAuth = NonNullable<RoomMatchCallableRequest<unknown>["auth"]>;

const hostDisplayName = "Khanh";
const hostAvatarUrl = "https://example.test/khanh.png";
const guestDisplayName = "Guest";

const hostAuth = {
  rawToken: "host-token",
  uid: "host-uid",
  token: {
    name: hostDisplayName,
    picture: hostAvatarUrl,
  },
} as unknown as CallableAuth;

const guestAuth = {
  rawToken: "guest-token",
  uid: "guest-uid",
  token: {
    name: guestDisplayName,
  },
} as unknown as CallableAuth;

function callableRequest<T>(data: T, auth: CallableAuth = hostAuth): RoomMatchCallableRequest<T> {
  return { auth, data };
}

class FakeRoomMatchStore implements RoomMatchCallableDeps {
  transactionCount = 0;
  rooms = new Map<string, RoomDocument>();
  matches = new Map<string, MatchDocument>();
  moveLogs = new Map<string, MatchMoveLogEntry>();

  private nowQueue = [10_000, 20_000, 30_000, 40_000];
  private roomIdQueue = ["room-1", "room-2"];
  private matchIdQueue = ["match-1", "match-2"];
  private moveIdQueue = ["move-1", "move-2"];
  private roomCodeQueue = ["VB-1042", "VB-2048"];

  nowMs(): number {
    const nowMs = this.nowQueue.shift();

    if (nowMs === undefined) {
      throw new Error("fake-now-empty");
    }

    return nowMs;
  }

  createRoomId(): string {
    return this.shiftId(this.roomIdQueue, "room-id");
  }

  createMatchId(): string {
    return this.shiftId(this.matchIdQueue, "match-id");
  }

  createMoveId(): string {
    return this.shiftId(this.moveIdQueue, "move-id");
  }

  generateRoomCode(): string {
    return this.shiftId(this.roomCodeQueue, "room-code");
  }

  async runTransaction<T>(
    handler: (transaction: RoomMatchCallableTransaction) => Promise<T>,
  ): Promise<T> {
    this.transactionCount += 1;

    return handler({
      createMatch: async (match) => {
        this.matches.set(match.id, structuredClone(match));
      },
      createMoveLogEntry: async (entry) => {
        this.moveLogs.set(`${entry.matchId}/${entry.id}`, structuredClone(entry));
      },
      createRoom: async (room) => {
        this.rooms.set(room.id, structuredClone(room));
      },
      findOpenRoomByCode: async (roomCode) => {
        return (
          [...this.rooms.values()].find(
            (room) => room.code === roomCode && (room.status === "open" || room.status === "full"),
          ) ?? null
        );
      },
      getMatch: async (matchId) => this.cloneOrNull(this.matches.get(matchId)),
      getRoom: async (roomId) => this.cloneOrNull(this.rooms.get(roomId)),
      updateMatch: async (match) => {
        this.matches.set(match.id, structuredClone(match));
      },
      updateRoom: async (room) => {
        this.rooms.set(room.id, structuredClone(room));
      },
    });
  }

  seedRoom(room: RoomDocument): void {
    this.rooms.set(room.id, structuredClone(room));
  }

  seedMatch(match: MatchDocument): void {
    this.matches.set(match.id, structuredClone(match));
  }

  private cloneOrNull<T>(value: T | undefined): T | null {
    return value === undefined ? null : structuredClone(value);
  }

  private shiftId(queue: string[], label: string): string {
    const value = queue.shift();

    if (value === undefined) {
      throw new Error(`fake-${label}-empty`);
    }

    return value;
  }
}

function createOpenRoom(roomId = "room-1"): RoomDocument {
  return createServerRoom({
    actor: {
      uid: hostAuth.uid,
      displayName: hostDisplayName,
      avatarUrl: hostAvatarUrl,
    },
    gameId: "connect-4",
    nowMs: 1_000,
    roomCode: "VB-1042",
    roomId,
  }).room;
}

function createFullRoom(): RoomDocument {
  return joinServerRoom({
    actor: {
      uid: guestAuth.uid,
      displayName: guestDisplayName,
      avatarUrl: null,
    },
    nowMs: 2_000,
    room: createOpenRoom(),
  }).room;
}

function createActiveMatch(): { room: RoomDocument; match: MatchDocument } {
  return startServerMatch({
    actorUid: hostAuth.uid,
    matchId: "match-1",
    nowMs: 3_000,
    room: createFullRoom(),
  });
}

describe("room/match callable handlers", () => {
  it("creates rooms inside one transaction and returns only client-safe identifiers", async () => {
    const store = new FakeRoomMatchStore();
    const result = await createRoomCallableHandler(store)(
      callableRequest({ gameId: "connect-4" satisfies GameId }),
    );

    expect(store.transactionCount).toBe(1);
    expect(result).toEqual({ roomCode: "VB-1042", roomId: "room-1", status: "open" });
    expect(store.rooms.get("room-1")?.hostUid).toBe(hostAuth.uid);
    expect(store.rooms.get("room-1")?.playerSlots[0]).toMatchObject({
      avatarUrl: hostAvatarUrl,
      displayName: hostDisplayName,
      uid: hostAuth.uid,
    });
  });

  it("rejects unauthenticated room creation before opening a transaction", async () => {
    const store = new FakeRoomMatchStore();
    const handler = createRoomCallableHandler(store);

    await expect(handler({ data: { gameId: "connect-4" } })).rejects.toMatchObject({
      code: "unauthenticated",
    });
    expect(store.transactionCount).toBe(0);
  });

  it("joins a room by room code through a transaction", async () => {
    const store = new FakeRoomMatchStore();
    store.seedRoom(createOpenRoom());

    const result = await joinRoomCallableHandler(store)(
      callableRequest({ roomCode: "VB-1042" }, guestAuth),
    );

    expect(store.transactionCount).toBe(1);
    expect(result).toEqual({ roomCode: "VB-1042", roomId: "room-1", status: "full" });
    expect(store.rooms.get("room-1")?.playerSlots[1]).toMatchObject({
      displayName: guestDisplayName,
      status: "occupied",
      uid: guestAuth.uid,
    });
  });

  it("starts a full room by writing the room and match in the same transaction", async () => {
    const store = new FakeRoomMatchStore();
    store.seedRoom(createFullRoom());

    const result = await startMatchCallableHandler(store)(callableRequest({ roomId: "room-1" }));
    const match = store.matches.get("match-1");

    expect(store.transactionCount).toBe(1);
    expect(result).toEqual({ matchId: "match-1", roomId: "room-1", status: "active" });
    expect(store.rooms.get("room-1")?.status).toBe("in-match");
    expect(match?.status).toBe("active");
    expect(
      deserializeConnect4DocumentState(match?.publicState as unknown as Connect4DocumentState),
    ).toEqual(
      connect4Module.serializePublicState(connect4Module.createInitialState({ seed: "match-1" })),
    );
  });

  it("submits a move by updating the match and writing an auditable move log", async () => {
    const store = new FakeRoomMatchStore();
    const { match } = createActiveMatch();
    store.seedMatch(match);

    const result = await submitMoveCallableHandler(store)(
      callableRequest({ matchId: "match-1", payload: { column: 3 } }),
    );

    expect(store.transactionCount).toBe(1);
    expect(result).toEqual({ matchId: "match-1", stateVersion: 1, status: "active" });
    expect(store.matches.get("match-1")?.stateVersion).toBe(1);
    expect(store.moveLogs.get("match-1/move-1")).toMatchObject({
      actorUid: hostAuth.uid,
      moveType: "drop-disc",
      payload: { column: 3 },
      stateVersionAfter: 1,
      stateVersionBefore: 0,
    });
  });
});
