import { describe, expect, it } from "vitest";

import {
  caroBoardSize,
  caroModule,
  createCaroInitialState,
  type CaroMove,
  type CaroState,
} from "../src/games/caro/caroModule";

function playMoves(moves: readonly CaroMove[]): CaroState {
  let state = caroModule.createInitialState({ seed: "caro-test" });

  for (const move of moves) {
    const actorSeatIndex = state.currentPlayerSeatIndex;

    expect(caroModule.validateMove({ state, move, actorSeatIndex })).toEqual({ ok: true });
    state = caroModule.applyMove({ state, move, actorSeatIndex });
  }

  return state;
}

describe("caroModule", () => {
  it("exposes stable game metadata", () => {
    expect(caroModule.metadata).toEqual({
      displayName: "Caro",
      gameId: "caro",
      maxPlayers: 2,
      minPlayers: 2,
      rulesEngineKey: "caro",
    });
  });

  it("creates an empty 15 by 15 board with player 0 to move first", () => {
    const state = createCaroInitialState();

    expect(state.board).toHaveLength(caroBoardSize);
    expect(state.board.every((row) => row.length === caroBoardSize)).toBe(true);
    expect(state.board.flat().every((cell) => cell === null)).toBe(true);
    expect(state.currentPlayerSeatIndex).toBe(0);
    expect(state.lastMove).toBeNull();
    expect(state.moveCount).toBe(0);
    expect(state.status).toBe("in-progress");
    expect(state.winnerSeatIndex).toBeNull();
  });

  it("serializes public state without exposing mutable board references", () => {
    const state = createCaroInitialState();
    const publicState = caroModule.serializePublicState(state);

    expect(publicState).toEqual(state);
    expect(publicState.board).toEqual(state.board);
    expect(publicState.board).not.toBe(state.board);
    expect(publicState.board[0]).not.toBe(state.board[0]);
  });

  it("validates turn ownership, bounds, and occupied cells", () => {
    const initialState = createCaroInitialState();

    expect(
      caroModule.validateMove({
        state: initialState,
        move: { row: 7, column: 7 },
        actorSeatIndex: 0,
      }),
    ).toEqual({
      ok: true,
    });
    expect(
      caroModule.validateMove({
        state: initialState,
        move: { row: 7, column: 7 },
        actorSeatIndex: 1,
      }),
    ).toEqual({
      ok: false,
      reason: "not-your-turn",
    });
    expect(
      caroModule.validateMove({
        state: initialState,
        move: { row: -1, column: 7 },
        actorSeatIndex: 0,
      }),
    ).toEqual({
      ok: false,
      reason: "cell-out-of-range",
    });
    expect(
      caroModule.validateMove({
        state: initialState,
        move: { row: 15, column: 7 },
        actorSeatIndex: 0,
      }),
    ).toEqual({
      ok: false,
      reason: "cell-out-of-range",
    });

    const occupiedState = caroModule.applyMove({
      actorSeatIndex: 0,
      move: { row: 7, column: 7 },
      state: initialState,
    });

    expect(
      caroModule.validateMove({
        state: occupiedState,
        move: { row: 7, column: 7 },
        actorSeatIndex: 1,
      }),
    ).toEqual({
      ok: false,
      reason: "cell-occupied",
    });
  });

  it("places a stone at the requested cell and leaves the previous state unchanged", () => {
    const state = createCaroInitialState();
    const nextState = caroModule.applyMove({
      state,
      move: { row: 7, column: 7 },
      actorSeatIndex: 0,
    });

    expect(nextState.board[7]?.[7]).toBe(0);
    expect(nextState.currentPlayerSeatIndex).toBe(1);
    expect(nextState.lastMove).toEqual({ column: 7, row: 7, seatIndex: 0 });
    expect(nextState.moveCount).toBe(1);
    expect(state.board.flat().every((cell) => cell === null)).toBe(true);
  });

  it("detects horizontal five-in-row wins and blocks future moves", () => {
    const state = playMoves([
      { row: 7, column: 7 },
      { row: 8, column: 7 },
      { row: 7, column: 8 },
      { row: 8, column: 8 },
      { row: 7, column: 9 },
      { row: 8, column: 9 },
      { row: 7, column: 10 },
      { row: 8, column: 10 },
      { row: 7, column: 11 },
    ]);

    expect(state.status).toBe("completed");
    expect(state.winnerSeatIndex).toBe(0);
    expect(caroModule.evaluateResult({ state })).toEqual({
      reason: "win",
      status: "win",
      winnerSeatIndex: 0,
    });
    expect(
      caroModule.validateMove({ state, move: { row: 9, column: 9 }, actorSeatIndex: 1 }),
    ).toEqual({
      ok: false,
      reason: "match-complete",
    });
  });

  it("detects vertical and diagonal five-in-row wins", () => {
    const verticalState = playMoves([
      { row: 5, column: 5 },
      { row: 5, column: 6 },
      { row: 6, column: 5 },
      { row: 6, column: 6 },
      { row: 7, column: 5 },
      { row: 7, column: 6 },
      { row: 8, column: 5 },
      { row: 8, column: 6 },
      { row: 9, column: 5 },
    ]);
    const diagonalState = playMoves([
      { row: 3, column: 3 },
      { row: 3, column: 4 },
      { row: 4, column: 4 },
      { row: 4, column: 5 },
      { row: 5, column: 5 },
      { row: 5, column: 6 },
      { row: 6, column: 6 },
      { row: 6, column: 7 },
      { row: 7, column: 7 },
    ]);

    expect(caroModule.evaluateResult({ state: verticalState })).toEqual({
      reason: "win",
      status: "win",
      winnerSeatIndex: 0,
    });
    expect(caroModule.evaluateResult({ state: diagonalState })).toEqual({
      reason: "win",
      status: "win",
      winnerSeatIndex: 0,
    });
  });
});
