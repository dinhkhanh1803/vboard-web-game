import { gameCatalogEntries, type GameId } from "@contracts/gameCatalog";
import {
  createInitialMatch,
  createInitialRoom,
  createMatchTimeoutContract,
  createMoveLogEntry,
  type MatchDocument,
  type MatchMoveLogEntry,
  type MatchPlayer,
  type MatchPublicState,
  type RoomDocument,
  type RoomPlayerSlot,
} from "@contracts/roomMatch";
import {
  connect4DocumentBoardEncoding,
  connect4Module,
  deserializeConnect4DocumentState,
  serializeConnect4DocumentState,
  type Connect4DocumentState,
  type Connect4Move,
  type Connect4State,
} from "@engine/index";

export const defaultRoomTtlMs = 30 * 60 * 1000;

export type ServerCommandActor = {
  uid: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type CreateServerRoomInput = {
  actor: ServerCommandActor;
  gameId: GameId;
  nowMs: number;
  roomCode: string;
  roomId: string;
};

export type JoinServerRoomInput = {
  actor: ServerCommandActor;
  nowMs: number;
  room: RoomDocument;
};

export type LeaveServerRoomInput = {
  actorUid: string;
  match?: MatchDocument | null;
  nowMs: number;
  room: RoomDocument;
};

export type StartServerMatchInput = {
  actorUid: string;
  matchId: string;
  nowMs: number;
  room: RoomDocument;
  turnDurationSec?: number;
};

export type SubmitServerMoveInput = {
  actorUid: string;
  match: MatchDocument;
  moveId: string;
  nowMs: number;
  payload: Record<string, unknown>;
};

export type ServerRoomCommandResult = {
  room: RoomDocument;
};

export type LeaveServerRoomResult = {
  match?: MatchDocument;
  room: RoomDocument;
};

export type StartServerMatchResult = {
  room: RoomDocument;
  match: MatchDocument;
};

export type SubmitServerMoveResult = {
  match: MatchDocument;
  moveLogEntry: MatchMoveLogEntry;
};

export function createServerRoom(input: CreateServerRoomInput): ServerRoomCommandResult {
  const gameEntry = gameCatalogEntries[input.gameId];

  if (!gameEntry.enabled) {
    throw new Error("game-not-enabled");
  }

  return {
    room: createInitialRoom({
      gameId: input.gameId,
      hostAvatarUrl: input.actor.avatarUrl ?? null,
      hostDisplayName: input.actor.displayName,
      hostUid: input.actor.uid,
      id: input.roomId,
      code: input.roomCode,
      maxPlayers: gameEntry.maxPlayers,
      nowMs: input.nowMs,
      expiresAtMs: input.nowMs + defaultRoomTtlMs,
    }),
  };
}

export function joinServerRoom(input: JoinServerRoomInput): ServerRoomCommandResult {
  if (input.nowMs > input.room.expiresAtMs) {
    throw new Error("room-expired");
  }

  if (input.room.playerSlots.some((slot) => slot.uid === input.actor.uid)) {
    return { room: input.room };
  }

  if (input.room.status !== "open") {
    throw new Error("room-not-open");
  }

  const nextOpenSlotIndex = input.room.playerSlots.findIndex((slot) => slot.status === "open");

  if (nextOpenSlotIndex === -1) {
    throw new Error("room-full");
  }

  const playerSlots = clonePlayerSlots(input.room.playerSlots);
  const targetSlot = playerSlots[nextOpenSlotIndex];

  if (targetSlot === undefined) {
    throw new Error("room-slot-missing");
  }

  playerSlots[nextOpenSlotIndex] = {
    ...targetSlot,
    avatarUrl: input.actor.avatarUrl ?? null,
    displayName: input.actor.displayName,
    joinedAtMs: input.nowMs,
    ready: true,
    status: "occupied",
    uid: input.actor.uid,
  };

  return {
    room: {
      ...input.room,
      playerSlots,
      status: playerSlots.every((slot) => slot.status === "occupied") ? "full" : "open",
      updatedAtMs: input.nowMs,
    },
  };
}

export function leaveServerRoom(input: LeaveServerRoomInput): LeaveServerRoomResult {
  const actorSlot = input.room.playerSlots.find((slot) => slot.uid === input.actorUid);

  if (actorSlot === undefined) {
    throw new Error("actor-not-player");
  }

  if (actorSlot.isHost || input.room.status === "in-match") {
    const room = closeRoom(input.room, input.nowMs);
    const match = input.match ? abandonMatch(input.match, input.nowMs) : undefined;

    return match === undefined ? { room } : { match, room };
  }

  return { room: openLeavingPlayerSlot(input.room, actorSlot.seatIndex, input.nowMs) };
}

export function startServerMatch(input: StartServerMatchInput): StartServerMatchResult {
  if (input.actorUid !== input.room.hostUid) {
    throw new Error("host-only");
  }

  if (input.room.status !== "full") {
    throw new Error("room-not-full");
  }

  if (input.room.matchId !== null) {
    throw new Error("room-already-started");
  }

  const players = input.room.playerSlots
    .filter((slot) => slot.status === "occupied" && slot.uid !== null && slot.displayName !== null)
    .map((slot) => ({
      avatarUrl: slot.avatarUrl,
      displayName: slot.displayName ?? "",
      seatIndex: slot.seatIndex,
      uid: slot.uid ?? "",
    }))
    .sort((left, right) => left.seatIndex - right.seatIndex);

  if (players.length !== input.room.maxPlayers) {
    throw new Error("room-not-full");
  }

  const timeoutContract = createMatchTimeoutContract(
    input.turnDurationSec === undefined ? {} : { turnDurationSec: input.turnDurationSec },
  );
  const initialGameState = connect4Module.createInitialState({ seed: input.matchId });
  const match = createInitialMatch({
    gameId: input.room.gameId,
    id: input.matchId,
    nowMs: input.nowMs,
    players,
    roomId: input.room.id,
    turnDurationSec: timeoutContract.turnDurationSec,
  });

  return {
    room: {
      ...input.room,
      matchId: input.matchId,
      status: "in-match",
      updatedAtMs: input.nowMs,
    },
    match: {
      ...match,
      publicState: serializeConnect4MatchPublicState(initialGameState),
      startedAtMs: input.nowMs,
      status: "active",
      turn: {
        ...match.turn,
        turnDeadlineAtMs: input.nowMs + timeoutContract.turnDurationSec * 1000,
        turnStartedAtMs: input.nowMs,
      },
      updatedAtMs: input.nowMs,
    },
  };
}

export function submitServerMove(input: SubmitServerMoveInput): SubmitServerMoveResult {
  if (input.match.status !== "active") {
    throw new Error("match-not-active");
  }

  if (input.match.gameId !== "connect-4") {
    throw new Error("game-not-supported");
  }

  const actor = input.match.players.find((player) => player.uid === input.actorUid);

  if (actor === undefined) {
    throw new Error("actor-not-player");
  }

  if (input.match.publicState === null) {
    throw new Error("match-state-missing");
  }

  const state = readConnect4MatchPublicState(input.match.publicState);
  const move = parseConnect4Move(input.payload);
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
  const nextStateVersion = input.match.stateVersion + 1;
  const moveLogEntry = createMoveLogEntry({
    actorSeatIndex: actor.seatIndex,
    actorUid: actor.uid,
    createdAtMs: input.nowMs,
    gameId: input.match.gameId,
    id: input.moveId,
    matchId: input.match.id,
    moveType: "drop-disc",
    payload: move,
    sequence: nextStateVersion,
    stateVersionAfter: nextStateVersion,
    stateVersionBefore: input.match.stateVersion,
  });

  return {
    match: buildNextMatch(input.match, nextState, result, input.nowMs),
    moveLogEntry,
  };
}

function clonePlayerSlots(playerSlots: readonly RoomPlayerSlot[]): RoomPlayerSlot[] {
  return playerSlots.map((slot) => ({ ...slot }));
}

function openLeavingPlayerSlot(
  room: RoomDocument,
  leavingSeatIndex: number,
  nowMs: number,
): RoomDocument {
  return {
    ...room,
    playerSlots: room.playerSlots.map((slot) =>
      slot.seatIndex === leavingSeatIndex
        ? {
            ...slot,
            avatarUrl: null,
            displayName: null,
            joinedAtMs: null,
            ready: false,
            status: "open",
            uid: null,
          }
        : { ...slot },
    ),
    status: "open",
    updatedAtMs: nowMs,
  };
}

function closeRoom(room: RoomDocument, nowMs: number): RoomDocument {
  return {
    ...room,
    playerSlots: room.playerSlots.map((slot) => ({
      ...slot,
      avatarUrl: null,
      displayName: null,
      joinedAtMs: null,
      ready: false,
      status: "open",
      uid: null,
    })),
    status: "closed",
    updatedAtMs: nowMs,
  };
}

function abandonMatch(match: MatchDocument, nowMs: number): MatchDocument {
  if (match.status === "completed" || match.status === "abandoned") {
    return match;
  }

  return {
    ...match,
    completedAtMs: nowMs,
    result: {
      completedAtMs: nowMs,
      reason: "abandoned",
      winnerSeatIndex: null,
      winnerUid: null,
    },
    status: "abandoned",
    turn: {
      ...match.turn,
      activeSeatIndex: null,
      turnDeadlineAtMs: null,
      turnStartedAtMs: null,
    },
    updatedAtMs: nowMs,
  };
}

function parseConnect4Move(payload: Record<string, unknown>): Connect4Move {
  if (typeof payload.column !== "number") {
    throw new Error("invalid-move-payload");
  }

  return { column: payload.column };
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
      publicState: serializeConnect4MatchPublicState(nextState),
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
    publicState: serializeConnect4MatchPublicState(nextState),
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

function serializeConnect4MatchPublicState(state: Connect4State): MatchPublicState {
  return serializeConnect4DocumentState(state) as unknown as MatchPublicState;
}

function readConnect4MatchPublicState(publicState: MatchPublicState): Connect4State {
  if (publicState === null) {
    throw new Error("match-state-missing");
  }

  if (isConnect4DocumentState(publicState)) {
    return deserializeConnect4DocumentState(publicState);
  }

  if (isLegacyConnect4State(publicState)) {
    return publicState;
  }

  throw new Error("match-state-invalid");
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

function isLegacyConnect4State(
  publicState: MatchPublicState,
): publicState is MatchPublicState & Connect4State {
  return publicState !== null && Array.isArray(publicState.board);
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
