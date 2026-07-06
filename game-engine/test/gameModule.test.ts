import { describe, expect, it } from "vitest";

import type { GameModule } from "../src/core/gameModule";
import { createGameModuleContractFixture } from "../src/core/gameModule";

type DemoState = {
  readonly currentPlayerSeat: number;
  readonly moves: readonly number[];
};

type DemoMove = {
  readonly column: number;
};

const demoModule: GameModule<DemoState, DemoMove> = {
  metadata: {
    gameId: "connect-4",
    rulesEngineKey: "connect4",
    displayName: "Connect 4",
    minPlayers: 2,
    maxPlayers: 2,
  },
  createInitialState: () => ({
    currentPlayerSeat: 0,
    moves: [],
  }),
  validateMove: ({ state, move, actorSeatIndex }) => {
    if (actorSeatIndex !== state.currentPlayerSeat) {
      return { ok: false, reason: "not-your-turn" };
    }

    if (move.column < 0 || move.column > 6) {
      return { ok: false, reason: "column-out-of-range" };
    }

    return { ok: true };
  },
  applyMove: ({ state, move }) => ({
    currentPlayerSeat: state.currentPlayerSeat === 0 ? 1 : 0,
    moves: [...state.moves, move.column],
  }),
  evaluateResult: ({ state }) => {
    if (state.moves.length >= 42) {
      return { status: "draw", winnerSeatIndex: null, reason: "draw" };
    }

    return { status: "in-progress", winnerSeatIndex: null, reason: null };
  },
  serializePublicState: (state) => ({
    currentPlayerSeat: state.currentPlayerSeat,
    moveCount: state.moves.length,
  }),
};

describe("GameModule contract", () => {
  it("pins metadata and creates an initial immutable game state", () => {
    expect(demoModule.metadata).toEqual({
      gameId: "connect-4",
      rulesEngineKey: "connect4",
      displayName: "Connect 4",
      minPlayers: 2,
      maxPlayers: 2,
    });

    expect(demoModule.createInitialState({ seed: "match-1" })).toEqual({
      currentPlayerSeat: 0,
      moves: [],
    });
  });

  it("validates move intent before applying it", () => {
    const state = demoModule.createInitialState({ seed: "match-1" });

    expect(demoModule.validateMove({ state, move: { column: 3 }, actorSeatIndex: 0 })).toEqual({
      ok: true,
    });
    expect(demoModule.validateMove({ state, move: { column: 3 }, actorSeatIndex: 1 })).toEqual({
      ok: false,
      reason: "not-your-turn",
    });
    expect(demoModule.validateMove({ state, move: { column: 7 }, actorSeatIndex: 0 })).toEqual({
      ok: false,
      reason: "column-out-of-range",
    });
  });

  it("applies moves immutably and serializes compact public state", () => {
    const state = demoModule.createInitialState({ seed: "match-1" });
    const nextState = demoModule.applyMove({ state, move: { column: 3 }, actorSeatIndex: 0 });

    expect(state).toEqual({ currentPlayerSeat: 0, moves: [] });
    expect(nextState).toEqual({ currentPlayerSeat: 1, moves: [3] });
    expect(demoModule.serializePublicState(nextState)).toEqual({
      currentPlayerSeat: 1,
      moveCount: 1,
    });
  });

  it("evaluates result boundaries without mutating state", () => {
    expect(demoModule.evaluateResult({ state: { currentPlayerSeat: 0, moves: [] } })).toEqual({
      status: "in-progress",
      winnerSeatIndex: null,
      reason: null,
    });
    expect(
      demoModule.evaluateResult({
        state: { currentPlayerSeat: 0, moves: Array.from({ length: 42 }, (_, index) => index) },
      }),
    ).toEqual({
      status: "draw",
      winnerSeatIndex: null,
      reason: "draw",
    });
  });

  it("provides a tiny fixture helper for contract tests", () => {
    expect(createGameModuleContractFixture(demoModule).metadata.rulesEngineKey).toBe("connect4");
  });
});
