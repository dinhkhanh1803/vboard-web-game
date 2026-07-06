import { describe, expect, it } from "vitest";

import {
  createLocalConnect4Match,
  createLocalConnect4MatchSource,
  submitLocalConnect4Move,
} from "@/features/match/connect4LocalMatch";

describe("connect4 local match adapter", () => {
  it("creates a local active match from the official public state shape", () => {
    const snapshot = createLocalConnect4Match({ matchId: "demo-match", nowMs: 1_000 });

    expect(snapshot.match.status).toBe("active");
    expect(snapshot.match.stateVersion).toBe(0);
    expect(snapshot.match.turn.activeSeatIndex).toBe(0);
    expect(snapshot.match.publicState).toMatchObject({
      currentPlayerSeatIndex: 0,
      moveCount: 0,
      status: "in-progress",
      winnerSeatIndex: null,
    });
    expect(snapshot.moveLogEntries).toEqual([]);
  });

  it("applies local moves with move logs and official state versions", () => {
    const initial = createLocalConnect4Match({ matchId: "demo-match", nowMs: 1_000 });
    const next = submitLocalConnect4Move({
      actorUid: "host-uid",
      column: 3,
      moveId: "move-1",
      nowMs: 2_000,
      snapshot: initial,
    });

    expect(next.match.stateVersion).toBe(1);
    expect(next.match.turn.activeSeatIndex).toBe(1);
    expect(next.moveLogEntries).toEqual([
      expect.objectContaining({
        actorSeatIndex: 0,
        actorUid: "host-uid",
        moveType: "drop-disc",
        payload: { column: 3 },
        sequence: 1,
        stateVersionAfter: 1,
        stateVersionBefore: 0,
      }),
    ]);
    expect(initial.match.stateVersion).toBe(0);
  });

  it("completes the local match when Connect 4 reports a winner", () => {
    let snapshot = createLocalConnect4Match({ matchId: "demo-match", nowMs: 1_000 });

    for (const column of [0, 0, 1, 1, 2, 2, 3]) {
      const activeSeatIndex = snapshot.match.turn.activeSeatIndex;
      const actor = snapshot.match.players.find((player) => player.seatIndex === activeSeatIndex);

      if (actor === undefined) {
        throw new Error("Expected active actor.");
      }

      snapshot = submitLocalConnect4Move({
        actorUid: actor.uid,
        column,
        moveId: `move-${snapshot.match.stateVersion + 1}`,
        nowMs: 2_000 + snapshot.match.stateVersion,
        snapshot,
      });
    }

    expect(snapshot.match.status).toBe("completed");
    expect(snapshot.match.turn.activeSeatIndex).toBeNull();
    expect(snapshot.match.result).toMatchObject({
      reason: "win",
      winnerSeatIndex: 0,
      winnerUid: "host-uid",
    });
  });
});

describe("createLocalConnect4MatchSource", () => {
  it("provides a realtime-like subscription boundary for local gameplay", () => {
    const source = createLocalConnect4MatchSource({ matchId: "demo-match", nowMs: 1_000 });
    const versions: number[] = [];
    const unsubscribe = source.subscribe((snapshot) => {
      versions.push(snapshot.match.stateVersion);
    });

    source.submitMove(3);
    source.reset();
    unsubscribe();
    source.submitMove(2);

    expect(versions).toEqual([1, 0]);
  });
});
