import { describe, expect, it, vi } from "vitest";

import {
  runAuthenticatedRoomMatchSmokeFlow,
  type AuthenticatedRoomMatchSmokeClients,
} from "./authenticatedRoomMatchSmokeFlow";

function createSmokeClients(): AuthenticatedRoomMatchSmokeClients {
  return {
    auth: {
      signInGuest: vi.fn(async (slot) => ({
        displayName: slot === "host" ? "Smoke Host" : "Smoke Guest",
        uid: slot === "host" ? "host-uid" : "guest-uid",
      })),
    },
    reads: {
      getMatch: vi.fn(async (matchId) => ({
        id: matchId,
        stateVersion: 1,
        status: "active",
      })),
      getMatchMoves: vi.fn(async (matchId) => [
        {
          actorUid: "host-uid",
          matchId,
          payload: { column: 3 },
          sequence: 1,
        },
      ]),
      getRoom: vi.fn(async (roomId) => ({
        id: roomId,
        matchId: "match-1",
        status: "in-match",
      })),
    },
    roomMatch: {
      createRoom: vi.fn(async (actor, input) => ({
        actorUid: actor.uid,
        gameId: input.gameId,
        roomCode: "VB-1042",
        roomId: "room-1",
        status: "open",
      })),
      joinRoom: vi.fn(async (actor, input) => ({
        actorUid: actor.uid,
        roomId: input.roomId ?? "room-1",
        status: "full",
      })),
      startMatch: vi.fn(async (actor, input) => ({
        actorUid: actor.uid,
        matchId: "match-1",
        roomId: input.roomId,
        status: "active",
      })),
      submitMove: vi.fn(async (actor, input) => ({
        actorUid: actor.uid,
        matchId: input.matchId,
        payload: input.payload,
        stateVersion: 1,
        status: "active",
      })),
    },
  };
}

describe("authenticated room/match smoke flow", () => {
  it("signs in host and guest before sending official room and match intents", async () => {
    const clients = createSmokeClients();

    const result = await runAuthenticatedRoomMatchSmokeFlow(clients);

    expect(clients.auth.signInGuest).toHaveBeenNthCalledWith(1, "host");
    expect(clients.auth.signInGuest).toHaveBeenNthCalledWith(2, "guest");
    expect(clients.roomMatch.createRoom).toHaveBeenCalledWith(result.host, {
      gameId: "connect-4",
    });
    expect(clients.roomMatch.joinRoom).toHaveBeenCalledWith(result.guest, {
      roomId: "room-1",
    });
    expect(clients.roomMatch.startMatch).toHaveBeenCalledWith(result.host, {
      roomId: "room-1",
    });
    expect(clients.roomMatch.submitMove).toHaveBeenCalledWith(result.host, {
      matchId: "match-1",
      payload: { column: 3 },
    });
    expect(result.room.status).toBe("in-match");
    expect(result.match.stateVersion).toBe(1);
    expect(result.moves).toHaveLength(1);
  });
});
