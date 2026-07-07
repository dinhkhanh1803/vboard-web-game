import { describe, expect, it } from "vitest";

import {
  connect4ColumnCount,
  connect4Module,
  connect4RowCount,
  createConnect4InitialState,
  deserializeConnect4DocumentState,
  serializeConnect4DocumentState,
  type Connect4State,
} from "../src/games/connect4/connect4Module";

function playColumns(columns: readonly number[]): Connect4State {
  let state = connect4Module.createInitialState({ seed: "connect4-test" });

  for (const column of columns) {
    const actorSeatIndex = state.currentPlayerSeatIndex;

    expect(connect4Module.validateMove({ state, move: { column }, actorSeatIndex })).toEqual({
      ok: true,
    });
    state = connect4Module.applyMove({ state, move: { column }, actorSeatIndex });
  }

  return state;
}

describe("connect4Module", () => {
  it("exposes stable game metadata", () => {
    expect(connect4Module.metadata).toEqual({
      displayName: "Connect 4",
      gameId: "connect-4",
      maxPlayers: 2,
      minPlayers: 2,
      rulesEngineKey: "connect4",
    });
  });

  it("creates an empty 7 by 6 board with player 0 to move first", () => {
    const state = createConnect4InitialState();

    expect(state.board).toHaveLength(connect4RowCount);
    expect(state.board.every((row) => row.length === connect4ColumnCount)).toBe(true);
    expect(state.board.flat().every((cell) => cell === null)).toBe(true);
    expect(state.currentPlayerSeatIndex).toBe(0);
    expect(state.moveCount).toBe(0);
    expect(state.status).toBe("in-progress");
    expect(state.winnerSeatIndex).toBeNull();
  });

  it("serializes a compact public state without exposing mutable board references", () => {
    const state = createConnect4InitialState();
    const publicState = connect4Module.serializePublicState(state);

    expect(publicState).toEqual(state);
    expect(publicState.board).toEqual(state.board);
    expect(publicState.board).not.toBe(state.board);
    expect(publicState.board[0]).not.toBe(state.board[0]);
  });

  it("serializes and restores a document-safe public state without nested board arrays", () => {
    const state = playColumns([3, 2]);
    const documentState = serializeConnect4DocumentState(state);

    expect(documentState.boardEncoding).toBe("connect4-row-major-v1");
    expect(documentState.boardCells).toHaveLength(connect4RowCount * connect4ColumnCount);
    expect(documentState.boardCells.some(Array.isArray)).toBe(false);
    expect(documentState.rows).toBe(connect4RowCount);
    expect(documentState.columns).toBe(connect4ColumnCount);
    expect(deserializeConnect4DocumentState(documentState)).toEqual(state);
  });
  it("validates turn ownership, column bounds, and full columns", () => {
    const initialState = createConnect4InitialState();

    expect(
      connect4Module.validateMove({ state: initialState, move: { column: 3 }, actorSeatIndex: 0 }),
    ).toEqual({
      ok: true,
    });
    expect(
      connect4Module.validateMove({ state: initialState, move: { column: 3 }, actorSeatIndex: 1 }),
    ).toEqual({
      ok: false,
      reason: "not-your-turn",
    });
    expect(
      connect4Module.validateMove({ state: initialState, move: { column: -1 }, actorSeatIndex: 0 }),
    ).toEqual({
      ok: false,
      reason: "column-out-of-range",
    });
    expect(
      connect4Module.validateMove({ state: initialState, move: { column: 7 }, actorSeatIndex: 0 }),
    ).toEqual({
      ok: false,
      reason: "column-out-of-range",
    });

    const fullColumnState = playColumns([0, 0, 0, 0, 0, 0]);

    expect(
      connect4Module.validateMove({
        state: fullColumnState,
        move: { column: 0 },
        actorSeatIndex: fullColumnState.currentPlayerSeatIndex,
      }),
    ).toEqual({
      ok: false,
      reason: "column-full",
    });
  });

  it("drops a piece into the lowest open cell and leaves the previous state unchanged", () => {
    const state = createConnect4InitialState();
    const nextState = connect4Module.applyMove({ state, move: { column: 3 }, actorSeatIndex: 0 });

    expect(nextState.board[connect4RowCount - 1]?.[3]).toBe(0);
    expect(nextState.currentPlayerSeatIndex).toBe(1);
    expect(nextState.moveCount).toBe(1);
    expect(state.board.flat().every((cell) => cell === null)).toBe(true);
  });

  it("detects horizontal wins and blocks future moves after completion", () => {
    const state = playColumns([0, 0, 1, 1, 2, 2, 3]);

    expect(state.status).toBe("completed");
    expect(state.winnerSeatIndex).toBe(0);
    expect(connect4Module.evaluateResult({ state })).toEqual({
      reason: "win",
      status: "win",
      winnerSeatIndex: 0,
    });
    expect(connect4Module.validateMove({ state, move: { column: 4 }, actorSeatIndex: 1 })).toEqual({
      ok: false,
      reason: "match-complete",
    });
  });

  it("detects vertical wins", () => {
    const state = playColumns([0, 1, 0, 1, 0, 1, 0]);

    expect(connect4Module.evaluateResult({ state })).toEqual({
      reason: "win",
      status: "win",
      winnerSeatIndex: 0,
    });
  });

  it("detects diagonal wins", () => {
    const state = playColumns([0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3]);

    expect(connect4Module.evaluateResult({ state })).toEqual({
      reason: "win",
      status: "win",
      winnerSeatIndex: 0,
    });
  });

  it("detects drawn boards", () => {
    const state = playColumns([
      5, 1, 6, 6, 6, 4, 1, 6, 1, 2, 3, 0, 2, 0, 0, 6, 2, 0, 2, 2, 0, 0, 6, 1, 5, 3, 1, 1, 4, 5, 4,
      5, 4, 2, 5, 3, 5, 3, 3, 4, 3, 4,
    ]);

    expect(state.status).toBe("completed");
    expect(connect4Module.evaluateResult({ state })).toEqual({
      reason: "draw",
      status: "draw",
      winnerSeatIndex: null,
    });
  });
});
