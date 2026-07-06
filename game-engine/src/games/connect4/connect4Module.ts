import type { GameModule, GameResultEvaluation, MoveValidationResult } from "../../core/gameModule";

export const connect4ColumnCount = 7;
export const connect4RowCount = 6;
export const connect4ConnectLength = 4;

export type Connect4PlayerSeatIndex = 0 | 1;
export type Connect4Cell = Connect4PlayerSeatIndex | null;
export type Connect4Board = readonly (readonly Connect4Cell[])[];
export type Connect4Move = {
  column: number;
};

export type Connect4Status = "in-progress" | "completed";

export type Connect4State = {
  board: Connect4Board;
  currentPlayerSeatIndex: Connect4PlayerSeatIndex;
  moveCount: number;
  status: Connect4Status;
  winnerSeatIndex: Connect4PlayerSeatIndex | null;
};

export type Connect4PublicState = Connect4State;

type MutableConnect4Board = Connect4Cell[][];

const connect4Directions = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

export function createConnect4InitialState(): Connect4State {
  return {
    board: createEmptyBoard(),
    currentPlayerSeatIndex: 0,
    moveCount: 0,
    status: "in-progress",
    winnerSeatIndex: null,
  };
}

export function validateConnect4Move(input: {
  state: Connect4State;
  move: Connect4Move;
  actorSeatIndex: number;
}): MoveValidationResult {
  if (input.state.status !== "in-progress") {
    return { ok: false, reason: "match-complete" };
  }

  if (input.actorSeatIndex !== input.state.currentPlayerSeatIndex) {
    return { ok: false, reason: "not-your-turn" };
  }

  if (!Number.isInteger(input.move.column) || !isColumnInBounds(input.move.column)) {
    return { ok: false, reason: "column-out-of-range" };
  }

  if (input.state.board[0]?.[input.move.column] !== null) {
    return { ok: false, reason: "column-full" };
  }

  return { ok: true };
}

export function applyConnect4Move(input: {
  state: Connect4State;
  move: Connect4Move;
  actorSeatIndex: number;
}): Connect4State {
  const validation = validateConnect4Move(input);

  if (!validation.ok) {
    throw new Error(`Cannot apply invalid Connect 4 move: ${validation.reason}`);
  }

  const board = cloneBoard(input.state.board);
  const targetRow = findDropRow(board, input.move.column);

  if (targetRow === null) {
    throw new Error("Cannot apply Connect 4 move: column-full");
  }

  const targetBoardRow = board[targetRow];

  if (targetBoardRow === undefined) {
    throw new Error("Cannot apply Connect 4 move: target-row-missing");
  }

  targetBoardRow[input.move.column] = input.state.currentPlayerSeatIndex;

  const nextMoveCount = input.state.moveCount + 1;
  const winnerSeatIndex = findWinnerSeatIndex(board);
  const status: Connect4Status =
    winnerSeatIndex === null && nextMoveCount < connect4ColumnCount * connect4RowCount
      ? "in-progress"
      : "completed";

  return {
    board,
    currentPlayerSeatIndex: getNextSeatIndex(input.state.currentPlayerSeatIndex),
    moveCount: nextMoveCount,
    status,
    winnerSeatIndex,
  };
}

export function evaluateConnect4Result(input: { state: Connect4State }): GameResultEvaluation {
  const winnerSeatIndex = findWinnerSeatIndex(input.state.board);

  if (winnerSeatIndex !== null) {
    return {
      reason: "win",
      status: "win",
      winnerSeatIndex,
    };
  }

  if (input.state.moveCount >= connect4ColumnCount * connect4RowCount) {
    return {
      reason: "draw",
      status: "draw",
      winnerSeatIndex: null,
    };
  }

  return {
    reason: null,
    status: "in-progress",
    winnerSeatIndex: null,
  };
}

export function serializeConnect4PublicState(state: Connect4State): Connect4PublicState {
  return {
    board: cloneBoard(state.board),
    currentPlayerSeatIndex: state.currentPlayerSeatIndex,
    moveCount: state.moveCount,
    status: state.status,
    winnerSeatIndex: state.winnerSeatIndex,
  };
}

export const connect4Module: GameModule<Connect4State, Connect4Move, Connect4PublicState> = {
  metadata: {
    displayName: "Connect 4",
    gameId: "connect-4",
    maxPlayers: 2,
    minPlayers: 2,
    rulesEngineKey: "connect4",
  },
  applyMove: applyConnect4Move,
  createInitialState: createConnect4InitialState,
  evaluateResult: evaluateConnect4Result,
  serializePublicState: serializeConnect4PublicState,
  validateMove: validateConnect4Move,
};

function createEmptyBoard(): MutableConnect4Board {
  return Array.from({ length: connect4RowCount }, () =>
    Array.from({ length: connect4ColumnCount }, () => null),
  );
}

function cloneBoard(board: Connect4Board): MutableConnect4Board {
  return board.map((row) => [...row]);
}

function isColumnInBounds(column: number): boolean {
  return column >= 0 && column < connect4ColumnCount;
}

function findDropRow(board: Connect4Board, column: number): number | null {
  for (let rowIndex = connect4RowCount - 1; rowIndex >= 0; rowIndex -= 1) {
    if (board[rowIndex]?.[column] === null) {
      return rowIndex;
    }
  }

  return null;
}

function findWinnerSeatIndex(board: Connect4Board): Connect4PlayerSeatIndex | null {
  for (let rowIndex = 0; rowIndex < connect4RowCount; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < connect4ColumnCount; columnIndex += 1) {
      const cell = board[rowIndex]?.[columnIndex];

      if (cell === null || cell === undefined) {
        continue;
      }

      if (hasConnectLengthFromCell(board, rowIndex, columnIndex, cell)) {
        return cell;
      }
    }
  }

  return null;
}

function hasConnectLengthFromCell(
  board: Connect4Board,
  rowIndex: number,
  columnIndex: number,
  seatIndex: Connect4PlayerSeatIndex,
): boolean {
  return connect4Directions.some(([rowDelta, columnDelta]) =>
    hasLineFromCell(board, rowIndex, columnIndex, rowDelta, columnDelta, seatIndex),
  );
}

function hasLineFromCell(
  board: Connect4Board,
  rowIndex: number,
  columnIndex: number,
  rowDelta: number,
  columnDelta: number,
  seatIndex: Connect4PlayerSeatIndex,
): boolean {
  for (let offset = 1; offset < connect4ConnectLength; offset += 1) {
    const nextRowIndex = rowIndex + rowDelta * offset;
    const nextColumnIndex = columnIndex + columnDelta * offset;

    if (board[nextRowIndex]?.[nextColumnIndex] !== seatIndex) {
      return false;
    }
  }

  return true;
}

function getNextSeatIndex(seatIndex: Connect4PlayerSeatIndex): Connect4PlayerSeatIndex {
  return seatIndex === 0 ? 1 : 0;
}
