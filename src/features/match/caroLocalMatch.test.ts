import { describe, expect, it } from "vitest";

import { type CaroState } from "@engine/index";

import {
  createLocalCaroMatch,
  createLocalCaroMatchSource,
  submitLocalCaroMove,
} from "@/features/match/caroLocalMatch";

describe("caro local match adapter", () => {
  it("creates a local active Caro match from the official public state shape", () => {
    const snapshot = createLocalCaroMatch({ matchId: "demo-caro", nowMs: 1_000 });
    const publicState = snapshot.match.publicState as unknown as CaroState;

    expect(snapshot.match.gameId).toBe("caro");
    expect(snapshot.match.status).toBe("active");
    expect(snapshot.match.stateVersion).toBe(0);
    expect(snapshot.match.turn.activeSeatIndex).toBe(0);
    expect(publicState.board).toHaveLength(15);
    expect(publicState.currentPlayerSeatIndex).toBe(0);
    expect(snapshot.moveLogEntries).toEqual([]);
  });

  it("applies local moves with move logs and official state versions", () => {
    const initial = createLocalCaroMatch({ matchId: "demo-caro", nowMs: 1_000 });
    const next = submitLocalCaroMove({
      actorUid: "host-uid",
      column: 7,
      moveId: "move-1",
      nowMs: 2_000,
      row: 7,
      snapshot: initial,
    });
    const publicState = next.match.publicState as unknown as CaroState;

    expect(publicState.board[7]?.[7]).toBe(0);
    expect(next.match.stateVersion).toBe(1);
    expect(next.match.turn.activeSeatIndex).toBe(1);
    expect(next.moveLogEntries).toEqual([
      expect.objectContaining({
        actorSeatIndex: 0,
        actorUid: "host-uid",
        moveType: "place-stone",
        payload: { column: 7, row: 7 },
        sequence: 1,
      }),
    ]);
    expect(initial.match.stateVersion).toBe(0);
  });

  it("completes the local match when Caro reports a winner", () => {
    let snapshot = createLocalCaroMatch({ matchId: "demo-caro", nowMs: 1_000 });

    const moves: Array<[number, number]> = [
      [7, 7],
      [8, 7],
      [7, 8],
      [8, 8],
      [7, 9],
      [8, 9],
      [7, 10],
      [8, 10],
      [7, 11],
    ];

    for (const [row, column] of moves) {
      const activeSeatIndex = snapshot.match.turn.activeSeatIndex;
      const actor = snapshot.match.players.find((player) => player.seatIndex === activeSeatIndex);

      if (actor === undefined) {
        throw new Error("Expected active actor.");
      }

      snapshot = submitLocalCaroMove({
        actorUid: actor.uid,
        column,
        moveId: `move-${snapshot.match.stateVersion + 1}`,
        nowMs: 2_000 + snapshot.match.stateVersion,
        row,
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

describe("createLocalCaroMatchSource", () => {
  it("provides a realtime-like subscription boundary for local Caro gameplay", () => {
    const source = createLocalCaroMatchSource({ matchId: "demo-caro", nowMs: 1_000 });
    const versions: number[] = [];
    const unsubscribe = source.subscribe((snapshot) => {
      versions.push(snapshot.match.stateVersion);
    });

    source.submitMove(8, 8);
    source.reset();
    unsubscribe();
    source.submitMove(9, 9);

    expect(versions).toEqual([1, 0]);
  });
});
