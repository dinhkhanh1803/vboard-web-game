import type { GameModule, GameResultEvaluation, MoveValidationResult } from "../../core/gameModule";

export const caroBoardSize = 15;
export const caroConnectLength = 5;

export type CaroPlayerSeatIndex = 0 | 1;
export type CaroCell = CaroPlayerSeatIndex | null;
export type CaroBoard = readonly (readonly CaroCell[])[];
export type CaroMove = {
  row: number;
  column: number;
};

export type CaroStatus = "in-progress" | "completed";

export type CaroLastMove = {
  row: number;
  column: number;
  seatIndex: CaroPlayerSeatIndex;
};

export type CaroState = {
  board: CaroBoard;
  currentPlayerSeatIndex: CaroPlayerSeatIndex;
  lastMove: CaroLastMove | null;
  moveCount: number;
  status: CaroStatus;
  winnerSeatIndex: CaroPlayerSeatIndex | null;
};

export type CaroPublicState = CaroState;

type MutableCaroBoard = CaroCell[][];

const caroDirections = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const;

export function createCaroInitialState(): CaroState {
  return {
    board: createEmptyBoard(),
    currentPlayerSeatIndex: 0,
    lastMove: null,
    moveCount: 0,
    status: "in-progress",
    winnerSeatIndex: null,
  };
}

export function validateCaroMove(input: {
  state: CaroState;
  move: CaroMove;
  actorSeatIndex: number;
}): MoveValidationResult {
  if (input.state.status !== "in-progress") {
    return { ok: false, reason: "match-complete" };
  }

  if (input.actorSeatIndex !== input.state.currentPlayerSeatIndex) {
    return { ok: false, reason: "not-your-turn" };
  }

  if (
    !Number.isInteger(input.move.row) ||
    !Number.isInteger(input.move.column) ||
    !isCoordinateInBounds(input.move.row) ||
    !isCoordinateInBounds(input.move.column)
  ) {
    return { ok: false, reason: "cell-out-of-range" };
  }

  if (input.state.board[input.move.row]?.[input.move.column] !== null) {
    return { ok: false, reason: "cell-occupied" };
  }

  return { ok: true };
}

export function applyCaroMove(input: {
  state: CaroState;
  move: CaroMove;
  actorSeatIndex: number;
}): CaroState {
  const validation = validateCaroMove(input);

  if (!validation.ok) {
    throw new Error(`Cannot apply invalid Caro move: ${validation.reason}`);
  }

  const board = cloneBoard(input.state.board);
  const targetBoardRow = board[input.move.row];

  if (targetBoardRow === undefined) {
    throw new Error("Cannot apply Caro move: target-row-missing");
  }

  targetBoardRow[input.move.column] = input.state.currentPlayerSeatIndex;

  const nextMoveCount = input.state.moveCount + 1;
  const winnerSeatIndex = findWinnerSeatIndex(board);
  const status: CaroStatus =
    winnerSeatIndex === null && nextMoveCount < caroBoardSize * caroBoardSize
      ? "in-progress"
      : "completed";

  return {
    board,
    currentPlayerSeatIndex: getNextSeatIndex(input.state.currentPlayerSeatIndex),
    lastMove: {
      column: input.move.column,
      row: input.move.row,
      seatIndex: input.state.currentPlayerSeatIndex,
    },
    moveCount: nextMoveCount,
    status,
    winnerSeatIndex,
  };
}

export function evaluateCaroResult(input: { state: CaroState }): GameResultEvaluation {
  const winnerSeatIndex = findWinnerSeatIndex(input.state.board);

  if (winnerSeatIndex !== null) {
    return {
      reason: "win",
      status: "win",
      winnerSeatIndex,
    };
  }

  if (input.state.moveCount >= caroBoardSize * caroBoardSize) {
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

export function serializeCaroPublicState(state: CaroState): CaroPublicState {
  return {
    board: cloneBoard(state.board),
    currentPlayerSeatIndex: state.currentPlayerSeatIndex,
    lastMove: state.lastMove === null ? null : { ...state.lastMove },
    moveCount: state.moveCount,
    status: state.status,
    winnerSeatIndex: state.winnerSeatIndex,
  };
}

export const caroModule: GameModule<CaroState, CaroMove, CaroPublicState> = {
  metadata: {
    displayName: "Caro",
    gameId: "caro",
    maxPlayers: 2,
    minPlayers: 2,
    rulesEngineKey: "caro",
  },
  applyMove: applyCaroMove,
  createInitialState: createCaroInitialState,
  evaluateResult: evaluateCaroResult,
  serializePublicState: serializeCaroPublicState,
  validateMove: validateCaroMove,
};

function createEmptyBoard(): MutableCaroBoard {
  return Array.from({ length: caroBoardSize }, () =>
    Array.from({ length: caroBoardSize }, () => null),
  );
}

function cloneBoard(board: CaroBoard): MutableCaroBoard {
  return board.map((row) => [...row]);
}

function isCoordinateInBounds(coordinate: number): boolean {
  return coordinate >= 0 && coordinate < caroBoardSize;
}

function findWinnerSeatIndex(board: CaroBoard): CaroPlayerSeatIndex | null {
  for (let rowIndex = 0; rowIndex < caroBoardSize; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < caroBoardSize; columnIndex += 1) {
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
  board: CaroBoard,
  rowIndex: number,
  columnIndex: number,
  seatIndex: CaroPlayerSeatIndex,
): boolean {
  return caroDirections.some(([rowDelta, columnDelta]) =>
    hasLineFromCell(board, rowIndex, columnIndex, rowDelta, columnDelta, seatIndex),
  );
}

function hasLineFromCell(
  board: CaroBoard,
  rowIndex: number,
  columnIndex: number,
  rowDelta: number,
  columnDelta: number,
  seatIndex: CaroPlayerSeatIndex,
): boolean {
  for (let offset = 1; offset < caroConnectLength; offset += 1) {
    const nextRowIndex = rowIndex + rowDelta * offset;
    const nextColumnIndex = columnIndex + columnDelta * offset;

    if (board[nextRowIndex]?.[nextColumnIndex] !== seatIndex) {
      return false;
    }
  }

  return true;
}

function getNextSeatIndex(seatIndex: CaroPlayerSeatIndex): CaroPlayerSeatIndex {
  return seatIndex === 0 ? 1 : 0;
}
