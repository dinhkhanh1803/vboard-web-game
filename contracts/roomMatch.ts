import type { GameId } from "./gameCatalog";

export const roomCollectionPath = "rooms";
export const matchCollectionPath = "matches";
export const matchMovesSubcollectionName = "moves";

export function getMatchMovesCollectionPath(matchId: string) {
  return `${matchCollectionPath}/${matchId}/${matchMovesSubcollectionName}`;
}

export const roomStatuses = ["open", "full", "starting", "in-match", "closed"] as const;
export type RoomStatus = (typeof roomStatuses)[number];

export const roomVisibilities = ["public", "private"] as const;
export type RoomVisibility = (typeof roomVisibilities)[number];

export const roomPlayerSlotStatuses = ["open", "reserved", "occupied"] as const;
export type RoomPlayerSlotStatus = (typeof roomPlayerSlotStatuses)[number];

export const matchStatuses = ["pending", "active", "paused", "completed", "abandoned"] as const;
export type MatchStatus = (typeof matchStatuses)[number];

export const matchResultReasons = ["win", "draw", "timeout", "resignation", "abandoned"] as const;
export type MatchResultReason = (typeof matchResultReasons)[number];
export type MatchTimeoutContract = {
  turnDurationSec: number;
  turnGraceSec: number;
  disconnectGraceSec: number;
  autoForfeitAfterMissedTurns: number;
};

export type CreateMatchTimeoutContractInput = Partial<MatchTimeoutContract>;

export function createMatchTimeoutContract(
  input: CreateMatchTimeoutContractInput = {},
): MatchTimeoutContract {
  return {
    turnDurationSec: input.turnDurationSec ?? 30,
    turnGraceSec: input.turnGraceSec ?? 5,
    disconnectGraceSec: input.disconnectGraceSec ?? 30,
    autoForfeitAfterMissedTurns: input.autoForfeitAfterMissedTurns ?? 1,
  };
}

export type RoomPlayerSlot = {
  seatIndex: number;
  status: RoomPlayerSlotStatus;
  uid: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isHost: boolean;
  ready: boolean;
  joinedAtMs: number | null;
};

export type RoomDocument = {
  id: string;
  code: string;
  gameId: GameId;
  status: RoomStatus;
  visibility: RoomVisibility;
  hostUid: string;
  maxPlayers: number;
  matchId: string | null;
  playerSlots: RoomPlayerSlot[];
  createdAtMs: number;
  updatedAtMs: number;
  expiresAtMs: number;
};

export type MatchPlayer = {
  seatIndex: number;
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  connected: boolean;
  resignedAtMs: number | null;
};

export type MatchTurn = {
  activeSeatIndex: number | null;
  turnNumber: number;
  turnStartedAtMs: number | null;
  turnDurationSec: number;
  turnDeadlineAtMs: number | null;
};

export type MatchResult = {
  winnerUid: string | null;
  winnerSeatIndex: number | null;
  reason: MatchResultReason | null;
  completedAtMs: number | null;
};

export type MatchPublicState = Record<string, unknown> | null;

export type MatchDocument = {
  id: string;
  roomId: string;
  gameId: GameId;
  status: MatchStatus;
  players: MatchPlayer[];
  turn: MatchTurn;
  result: MatchResult;
  publicState: MatchPublicState;
  stateVersion: number;
  createdAtMs: number;
  updatedAtMs: number;
  startedAtMs: number | null;
  completedAtMs: number | null;
};

export type MatchMoveLogEntry = {
  id: string;
  matchId: string;
  gameId: GameId;
  sequence: number;
  actorUid: string;
  actorSeatIndex: number;
  moveType: string;
  payload: Record<string, unknown>;
  stateVersionBefore: number;
  stateVersionAfter: number;
  createdAtMs: number;
};

export type CreateInitialRoomInput = {
  id: string;
  code: string;
  gameId: GameId;
  hostUid: string;
  hostDisplayName: string;
  hostAvatarUrl?: string | null;
  nowMs: number;
  expiresAtMs: number;
  visibility?: RoomVisibility;
  maxPlayers?: number;
};

export type CreateInitialMatchPlayerInput = {
  seatIndex: number;
  uid: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type CreateInitialMatchInput = {
  id: string;
  roomId: string;
  gameId: GameId;
  players: CreateInitialMatchPlayerInput[];
  nowMs: number;
  turnDurationSec: number;
};

export type CreateMoveLogEntryInput = MatchMoveLogEntry;

function createOpenRoomSlot(seatIndex: number): RoomPlayerSlot {
  return {
    seatIndex,
    status: "open",
    uid: null,
    displayName: null,
    avatarUrl: null,
    isHost: false,
    ready: false,
    joinedAtMs: null,
  };
}

export function createInitialRoom(input: CreateInitialRoomInput): RoomDocument {
  const maxPlayers = input.maxPlayers ?? 2;
  const playerSlots = Array.from({ length: maxPlayers }, (_, seatIndex) =>
    createOpenRoomSlot(seatIndex),
  );

  playerSlots[0] = {
    seatIndex: 0,
    status: "occupied",
    uid: input.hostUid,
    displayName: input.hostDisplayName,
    avatarUrl: input.hostAvatarUrl ?? null,
    isHost: true,
    ready: true,
    joinedAtMs: input.nowMs,
  };

  return {
    id: input.id,
    code: input.code,
    gameId: input.gameId,
    status: "open",
    visibility: input.visibility ?? "public",
    hostUid: input.hostUid,
    maxPlayers,
    matchId: null,
    playerSlots,
    createdAtMs: input.nowMs,
    updatedAtMs: input.nowMs,
    expiresAtMs: input.expiresAtMs,
  };
}

export function createInitialMatch(input: CreateInitialMatchInput): MatchDocument {
  return {
    id: input.id,
    roomId: input.roomId,
    gameId: input.gameId,
    status: "pending",
    players: input.players.map((player) => ({
      seatIndex: player.seatIndex,
      uid: player.uid,
      displayName: player.displayName,
      avatarUrl: player.avatarUrl ?? null,
      connected: true,
      resignedAtMs: null,
    })),
    turn: {
      activeSeatIndex: input.players[0]?.seatIndex ?? null,
      turnNumber: 1,
      turnStartedAtMs: null,
      turnDurationSec: input.turnDurationSec,
      turnDeadlineAtMs: null,
    },
    result: {
      winnerUid: null,
      winnerSeatIndex: null,
      reason: null,
      completedAtMs: null,
    },
    publicState: null,
    stateVersion: 0,
    createdAtMs: input.nowMs,
    updatedAtMs: input.nowMs,
    startedAtMs: null,
    completedAtMs: null,
  };
}

export function createMoveLogEntry(input: CreateMoveLogEntryInput): MatchMoveLogEntry {
  return { ...input };
}
