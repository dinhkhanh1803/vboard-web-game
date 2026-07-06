import {
  createInitialMatch,
  createMatchTimeoutContract,
  createMoveLogEntry,
  type MatchDocument,
  type MatchMoveLogEntry,
  type MatchPlayer,
  type MatchPublicState,
} from "@contracts/roomMatch";
import { caroModule, type CaroMove, type CaroState } from "@engine/index";

export type LocalCaroPlayer = {
  seatIndex: number;
  uid: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type LocalCaroMatchSnapshot = {
  match: MatchDocument;
  moveLogEntries: MatchMoveLogEntry[];
};

export type CreateLocalCaroMatchInput = {
  matchId: string;
  nowMs: number;
  players?: LocalCaroPlayer[];
};

export type SubmitLocalCaroMoveInput = {
  actorUid: string;
  row: number;
  column: number;
  moveId: string;
  nowMs: number;
  snapshot: LocalCaroMatchSnapshot;
};

export type LocalCaroMatchSource = {
  getSnapshot(): LocalCaroMatchSnapshot;
  subscribe(listener: (snapshot: LocalCaroMatchSnapshot) => void): () => void;
  submitMove(row: number, column: number): LocalCaroMatchSnapshot;
  reset(): LocalCaroMatchSnapshot;
};

const defaultPlayers: LocalCaroPlayer[] = [
  {
    avatarUrl: null,
    displayName: "Khanh",
    seatIndex: 0,
    uid: "host-uid",
  },
  {
    avatarUrl: null,
    displayName: "Arena Bot",
    seatIndex: 1,
    uid: "guest-uid",
  },
];

export function createLocalCaroMatch(input: CreateLocalCaroMatchInput): LocalCaroMatchSnapshot {
  const timeout = createMatchTimeoutContract();
  const gameState = caroModule.createInitialState({ seed: input.matchId });
  const players = input.players ?? defaultPlayers;
  const match = createInitialMatch({
    gameId: "caro",
    id: input.matchId,
    nowMs: input.nowMs,
    players,
    roomId: "local-room",
    turnDurationSec: timeout.turnDurationSec,
  });

  return {
    match: {
      ...match,
      publicState: caroModule.serializePublicState(gameState) as unknown as MatchPublicState,
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

export function submitLocalCaroMove(input: SubmitLocalCaroMoveInput): LocalCaroMatchSnapshot {
  if (input.snapshot.match.status !== "active") {
    return input.snapshot;
  }

  const actor = input.snapshot.match.players.find((player) => player.uid === input.actorUid);

  if (actor === undefined) {
    throw new Error("actor-not-player");
  }

  const state = getCaroPublicState(input.snapshot.match);
  const move: CaroMove = { column: input.column, row: input.row };
  const validation = caroModule.validateMove({
    actorSeatIndex: actor.seatIndex,
    move,
    state,
  });

  if (!validation.ok) {
    throw new Error(`invalid-move:${validation.reason}`);
  }

  const nextState = caroModule.applyMove({
    actorSeatIndex: actor.seatIndex,
    move,
    state,
  });
  const result = caroModule.evaluateResult({ state: nextState });
  const nextStateVersion = input.snapshot.match.stateVersion + 1;
  const moveLogEntry = createMoveLogEntry({
    actorSeatIndex: actor.seatIndex,
    actorUid: actor.uid,
    createdAtMs: input.nowMs,
    gameId: input.snapshot.match.gameId,
    id: input.moveId,
    matchId: input.snapshot.match.id,
    moveType: "place-stone",
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

export function createLocalCaroMatchSource(input: CreateLocalCaroMatchInput): LocalCaroMatchSource {
  const listeners = new Set<(snapshot: LocalCaroMatchSnapshot) => void>();
  let nowMs = input.nowMs;
  let snapshot = createLocalCaroMatch(input);

  const emit = () => {
    for (const listener of listeners) {
      listener(snapshot);
    }
  };

  return {
    getSnapshot: () => snapshot,
    reset: () => {
      nowMs += 1_000;
      snapshot = createLocalCaroMatch({ ...input, nowMs });
      emit();

      return snapshot;
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    submitMove: (row, column) => {
      const activePlayer = getActiveCaroPlayer(snapshot.match);

      if (activePlayer === undefined) {
        return snapshot;
      }

      nowMs += 1_000;
      snapshot = submitLocalCaroMove({
        actorUid: activePlayer.uid,
        column: column - 1,
        moveId: `move-${snapshot.match.stateVersion + 1}`,
        nowMs,
        row: row - 1,
        snapshot,
      });
      emit();

      return snapshot;
    },
  };
}

export function getCaroPublicState(match: MatchDocument): CaroState {
  if (match.publicState === null) {
    throw new Error("match-public-state-missing");
  }

  return match.publicState as unknown as CaroState;
}

export function getActiveCaroPlayer(match: MatchDocument): MatchPlayer | undefined {
  return match.players.find((player) => player.seatIndex === match.turn.activeSeatIndex);
}

function buildNextMatch(
  match: MatchDocument,
  nextState: CaroState,
  result: ReturnType<typeof caroModule.evaluateResult>,
  nowMs: number,
): MatchDocument {
  const nextStateVersion = match.stateVersion + 1;

  if (result.status !== "in-progress") {
    const winner = findPlayerBySeat(match.players, result.winnerSeatIndex);

    return {
      ...match,
      completedAtMs: nowMs,
      publicState: caroModule.serializePublicState(nextState) as unknown as MatchPublicState,
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
    publicState: caroModule.serializePublicState(nextState) as unknown as MatchPublicState,
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
