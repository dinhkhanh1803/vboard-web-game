import {
  createInitialMatch,
  createMatchTimeoutContract,
  createMoveLogEntry,
  type MatchDocument,
  type MatchMoveLogEntry,
  type MatchPlayer,
  type MatchPublicState,
} from "@contracts/roomMatch";
import {
  connect4DocumentBoardEncoding,
  connect4Module,
  deserializeConnect4DocumentState,
  type Connect4DocumentState,
  type Connect4Move,
  type Connect4State,
} from "@engine/index";

export type LocalConnect4Player = {
  seatIndex: number;
  uid: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type LocalConnect4MatchSnapshot = {
  match: MatchDocument;
  moveLogEntries: MatchMoveLogEntry[];
};

export type CreateLocalConnect4MatchInput = {
  matchId: string;
  nowMs: number;
  players?: LocalConnect4Player[];
};

export type SubmitLocalConnect4MoveInput = {
  actorUid: string;
  column: number;
  moveId: string;
  nowMs: number;
  snapshot: LocalConnect4MatchSnapshot;
};

export type LocalConnect4MatchSource = {
  getSnapshot(): LocalConnect4MatchSnapshot;
  subscribe(listener: (snapshot: LocalConnect4MatchSnapshot) => void): () => void;
  submitMove(column: number): LocalConnect4MatchSnapshot;
  reset(): LocalConnect4MatchSnapshot;
};

const defaultPlayers: LocalConnect4Player[] = [
  {
    seatIndex: 0,
    uid: "host-uid",
    displayName: "Khanh",
    avatarUrl: null,
  },
  {
    seatIndex: 1,
    uid: "guest-uid",
    displayName: "Arena Bot",
    avatarUrl: null,
  },
];

export function createLocalConnect4Match(
  input: CreateLocalConnect4MatchInput,
): LocalConnect4MatchSnapshot {
  const timeout = createMatchTimeoutContract();
  const gameState = connect4Module.createInitialState({ seed: input.matchId });
  const players = input.players ?? defaultPlayers;
  const match = createInitialMatch({
    gameId: "connect-4",
    id: input.matchId,
    nowMs: input.nowMs,
    players,
    roomId: "local-room",
    turnDurationSec: timeout.turnDurationSec,
  });

  return {
    match: {
      ...match,
      publicState: connect4Module.serializePublicState(gameState) as unknown as MatchPublicState,
      startedAtMs: input.nowMs,
      status: "active",
      turn: {
        ...match.turn,
        turnDeadlineAtMs: input.nowMs + timeout.turnDurationSec * 1000,
        turnStartedAtMs: input.nowMs,
      },
    },
    moveLogEntries: [],
  };
}

export function submitLocalConnect4Move(
  input: SubmitLocalConnect4MoveInput,
): LocalConnect4MatchSnapshot {
  if (input.snapshot.match.status !== "active") {
    return input.snapshot;
  }

  const actor = input.snapshot.match.players.find((player) => player.uid === input.actorUid);

  if (actor === undefined) {
    throw new Error("actor-not-player");
  }

  const state = getConnect4PublicState(input.snapshot.match);
  const move: Connect4Move = { column: input.column };
  const validation = connect4Module.validateMove({
    actorSeatIndex: actor.seatIndex,
    move,
    state,
  });

  if (!validation.ok) {
    throw new Error(`invalid-move:${validation.reason}`);
  }

  const nextState = connect4Module.applyMove({
    actorSeatIndex: actor.seatIndex,
    move,
    state,
  });
  const result = connect4Module.evaluateResult({ state: nextState });
  const nextStateVersion = input.snapshot.match.stateVersion + 1;
  const moveLogEntry = createMoveLogEntry({
    actorSeatIndex: actor.seatIndex,
    actorUid: actor.uid,
    createdAtMs: input.nowMs,
    gameId: input.snapshot.match.gameId,
    id: input.moveId,
    matchId: input.snapshot.match.id,
    moveType: "drop-disc",
    payload: move,
    sequence: nextStateVersion,
    stateVersionAfter: nextStateVersion,
    stateVersionBefore: input.snapshot.match.stateVersion,
  });

  return {
    match: buildNextMatch(input.snapshot.match, nextState, result, input.nowMs),
    moveLogEntries: [...input.snapshot.moveLogEntries, moveLogEntry],
  };
}

export function createLocalConnect4MatchSource(
  input: CreateLocalConnect4MatchInput,
): LocalConnect4MatchSource {
  const listeners = new Set<(snapshot: LocalConnect4MatchSnapshot) => void>();
  let nowMs = input.nowMs;
  let snapshot = createLocalConnect4Match(input);

  const emit = () => {
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    submitMove: (column) => {
      const activePlayer = getActivePlayer(snapshot.match);

      if (activePlayer === undefined) {
        return snapshot;
      }

      nowMs += 1_000;
      snapshot = submitLocalConnect4Move({
        actorUid: activePlayer.uid,
        column: column - 1,
        moveId: `move-${snapshot.match.stateVersion + 1}`,
        nowMs,
        snapshot,
      });
      emit();

      return snapshot;
    },
    reset: () => {
      nowMs += 1_000;
      snapshot = createLocalConnect4Match({ ...input, nowMs });
      emit();

      return snapshot;
    },
  };
}

export function getConnect4PublicState(match: MatchDocument): Connect4State {
  if (match.publicState === null) {
    throw new Error("match-public-state-missing");
  }

  if (isConnect4DocumentState(match.publicState)) {
    return deserializeConnect4DocumentState(match.publicState);
  }

  return match.publicState as unknown as Connect4State;
}

function isConnect4DocumentState(
  publicState: MatchPublicState,
): publicState is MatchPublicState & Connect4DocumentState {
  return (
    publicState !== null &&
    publicState.boardEncoding === connect4DocumentBoardEncoding &&
    Array.isArray(publicState.boardCells) &&
    publicState.rows === 6 &&
    publicState.columns === 7
  );
}

export function getActivePlayer(match: MatchDocument): MatchPlayer | undefined {
  return match.players.find((player) => player.seatIndex === match.turn.activeSeatIndex);
}

function buildNextMatch(
  match: MatchDocument,
  nextState: Connect4State,
  result: ReturnType<typeof connect4Module.evaluateResult>,
  nowMs: number,
): MatchDocument {
  const nextStateVersion = match.stateVersion + 1;

  if (result.status !== "in-progress") {
    const winner = findPlayerBySeat(match.players, result.winnerSeatIndex);

    return {
      ...match,
      completedAtMs: nowMs,
      publicState: connect4Module.serializePublicState(nextState) as unknown as MatchPublicState,
      result: {
        completedAtMs: nowMs,
        reason: result.reason,
        winnerSeatIndex: result.winnerSeatIndex,
        winnerUid: winner?.uid ?? null,
      },
      stateVersion: nextStateVersion,
      status: "completed",
      turn: {
        ...match.turn,
        activeSeatIndex: null,
        turnDeadlineAtMs: null,
        turnNumber: match.turn.turnNumber + 1,
        turnStartedAtMs: null,
      },
      updatedAtMs: nowMs,
    };
  }

  return {
    ...match,
    publicState: connect4Module.serializePublicState(nextState) as unknown as MatchPublicState,
    stateVersion: nextStateVersion,
    turn: {
      ...match.turn,
      activeSeatIndex: nextState.currentPlayerSeatIndex,
      turnDeadlineAtMs: nowMs + match.turn.turnDurationSec * 1000,
      turnNumber: match.turn.turnNumber + 1,
      turnStartedAtMs: nowMs,
    },
    updatedAtMs: nowMs,
  };
}

function findPlayerBySeat(
  players: readonly MatchPlayer[],
  seatIndex: number | null,
): MatchPlayer | undefined {
  if (seatIndex === null) {
    return undefined;
  }

  return players.find((player) => player.seatIndex === seatIndex);
}
