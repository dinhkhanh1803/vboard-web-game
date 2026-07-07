import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import type { FirebaseIdentityUser } from "@/firebase/authIdentity";
import {
  createAuthenticatedRoomMatchIntentClient,
  createRoomMatchIntentClient,
  getRoomMatchIntentClient,
  roomMatchCallableNames,
  type CallableIntentInvoker,
  type RoomMatchIntentClient,
} from "@/firebase/roomMatchIntents";

describe("room/match client intent boundary", () => {
  it("sends room and match workflows through callable Functions only", async () => {
    const calls: Array<{ data: unknown; name: string }> = [];
    const invokeCallable: CallableIntentInvoker = async <Input, Output>(
      name: (typeof roomMatchCallableNames)[keyof typeof roomMatchCallableNames],
      data: Input,
    ): Promise<Output> => {
      calls.push({ data, name });

      if (name === roomMatchCallableNames.createRoom) {
        return { roomCode: "VB-1042", roomId: "room-1", status: "open" } as Output;
      }

      if (name === roomMatchCallableNames.joinRoom) {
        return { roomCode: "VB-1042", roomId: "room-1", status: "full" } as Output;
      }

      if (name === roomMatchCallableNames.startMatch) {
        return { matchId: "match-1", roomId: "room-1", status: "active" } as Output;
      }

      if (name === roomMatchCallableNames.submitMove) {
        return { matchId: "match-1", stateVersion: 1, status: "active" } as Output;
      }

      throw new Error(`Unexpected callable ${name}`);
    };

    const client = createRoomMatchIntentClient(invokeCallable);

    await expect(client.createRoom({ gameId: "connect-4" })).resolves.toEqual({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "open",
    });
    await expect(client.joinRoom({ roomCode: "VB-1042" })).resolves.toEqual({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "full",
    });
    await expect(client.startMatch({ roomId: "room-1", turnDurationSec: 30 })).resolves.toEqual({
      matchId: "match-1",
      roomId: "room-1",
      status: "active",
    });
    await expect(
      client.submitMove({ matchId: "match-1", payload: { column: 3 } }),
    ).resolves.toEqual({
      matchId: "match-1",
      stateVersion: 1,
      status: "active",
    });

    expect(calls).toEqual([
      { data: { gameId: "connect-4" }, name: "createRoom" },
      { data: { roomCode: "VB-1042" }, name: "joinRoom" },
      { data: { roomId: "room-1", turnDurationSec: 30 }, name: "startMatch" },
      { data: { matchId: "match-1", payload: { column: 3 } }, name: "submitMove" },
    ]);
  });

  it("returns null when Firebase browser config is not available", () => {
    expect(getRoomMatchIntentClient({})).toBeNull();
  });

  it("requires a Firebase identity before submitting official room and match intents", async () => {
    const baseClient: RoomMatchIntentClient = {
      createRoom: vi.fn(),
      joinRoom: vi.fn(),
      startMatch: vi.fn(),
      submitMove: vi.fn(),
    };
    const client = createAuthenticatedRoomMatchIntentClient(baseClient, () => null);

    await expect(client.createRoom({ gameId: "connect-4" })).rejects.toThrow(
      "Firebase Auth sign-in is required before room and match actions.",
    );
    await expect(client.joinRoom({ roomCode: "VB-1042" })).rejects.toThrow(
      "Firebase Auth sign-in is required before room and match actions.",
    );
    await expect(client.startMatch({ roomId: "room-1" })).rejects.toThrow(
      "Firebase Auth sign-in is required before room and match actions.",
    );
    await expect(client.submitMove({ matchId: "match-1", payload: { column: 3 } })).rejects.toThrow(
      "Firebase Auth sign-in is required before room and match actions.",
    );

    expect(baseClient.createRoom).not.toHaveBeenCalled();
    expect(baseClient.joinRoom).not.toHaveBeenCalled();
    expect(baseClient.startMatch).not.toHaveBeenCalled();
    expect(baseClient.submitMove).not.toHaveBeenCalled();
  });

  it("delegates official room and match intents when a Firebase identity exists", async () => {
    const identity: FirebaseIdentityUser = {
      displayName: "Guest Pilot",
      email: null,
      isAnonymous: true,
      photoURL: null,
      uid: "guest-1",
    };
    const baseClient: RoomMatchIntentClient = {
      createRoom: vi.fn().mockResolvedValue({
        roomCode: "VB-1042",
        roomId: "room-1",
        status: "open",
      }),
      joinRoom: vi.fn().mockResolvedValue({
        roomCode: "VB-1042",
        roomId: "room-1",
        status: "full",
      }),
      startMatch: vi.fn().mockResolvedValue({
        matchId: "match-1",
        roomId: "room-1",
        status: "active",
      }),
      submitMove: vi.fn().mockResolvedValue({
        matchId: "match-1",
        stateVersion: 2,
        status: "active",
      }),
    };
    const client = createAuthenticatedRoomMatchIntentClient(baseClient, () => identity);

    await expect(client.createRoom({ gameId: "connect-4" })).resolves.toEqual({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "open",
    });
    await expect(client.joinRoom({ roomCode: "VB-1042" })).resolves.toEqual({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "full",
    });
    await expect(client.startMatch({ roomId: "room-1" })).resolves.toEqual({
      matchId: "match-1",
      roomId: "room-1",
      status: "active",
    });
    await expect(
      client.submitMove({ matchId: "match-1", payload: { column: 3 } }),
    ).resolves.toEqual({
      matchId: "match-1",
      stateVersion: 2,
      status: "active",
    });
  });

  it("does not import Firestore write APIs in the client intent boundary", () => {
    const source = readFileSync(join(process.cwd(), "src/firebase/roomMatchIntents.ts"), "utf8");

    expect(source).not.toContain("firebase/firestore");
    expect(source).not.toMatch(/\b(setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction)\b/);
  });
});
