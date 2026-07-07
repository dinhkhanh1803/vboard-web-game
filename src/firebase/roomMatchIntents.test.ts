import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createRoomMatchIntentClient,
  getRoomMatchIntentClient,
  roomMatchCallableNames,
  type CallableIntentInvoker,
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

  it("does not import Firestore write APIs in the client intent boundary", () => {
    const source = readFileSync(join(process.cwd(), "src/firebase/roomMatchIntents.ts"), "utf8");

    expect(source).not.toContain("firebase/firestore");
    expect(source).not.toMatch(/\b(setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction)\b/);
  });
});
