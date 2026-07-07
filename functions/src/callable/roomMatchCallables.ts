import {
  createServerRoom,
  joinServerRoom,
  startServerMatch,
  submitServerMove,
} from "../domain/roomMatchCommands";
import type { RoomMatchCallableDeps, RoomMatchCallableRequest } from "./roomMatchCallableTypes";
import {
  readOptionalPositiveInteger,
  readOptionalString,
  requireActor,
  requireGameId,
  requireObject,
  requireString,
  runCallableOperation,
  throwInvalidArgument,
} from "./roomMatchCallableValidation";

export type {
  RoomMatchCallableDeps,
  RoomMatchCallableRequest,
  RoomMatchCallableTransaction,
} from "./roomMatchCallableTypes";

export type CreateRoomCallableData = {
  gameId: unknown;
};

export type JoinRoomCallableData = {
  roomId?: unknown;
  roomCode?: unknown;
};

export type StartMatchCallableData = {
  roomId: unknown;
  turnDurationSec?: unknown;
};

export type SubmitMoveCallableData = {
  matchId: unknown;
  payload: unknown;
};

export type CreateRoomCallableResult = {
  roomId: string;
  roomCode: string;
  status: "open" | "full" | "starting" | "in-match" | "closed";
};

export type JoinRoomCallableResult = CreateRoomCallableResult;

export type StartMatchCallableResult = {
  roomId: string;
  matchId: string;
  status: "active";
};

export type SubmitMoveCallableResult = {
  matchId: string;
  stateVersion: number;
  status: "active" | "completed";
};

export function createRoomCallableHandler(deps: RoomMatchCallableDeps) {
  return async (
    request: RoomMatchCallableRequest<CreateRoomCallableData>,
  ): Promise<CreateRoomCallableResult> => {
    const actor = requireActor(request);
    const data = requireObject(request.data);
    const gameId = requireGameId(data.gameId);

    return runCallableOperation(async () =>
      deps.runTransaction(async (transaction) => {
        const roomId = deps.createRoomId();
        const roomCode = deps.generateRoomCode();
        const { room } = createServerRoom({
          actor,
          gameId,
          nowMs: deps.nowMs(),
          roomCode,
          roomId,
        });

        await transaction.createRoom(room);

        return { roomCode: room.code, roomId: room.id, status: room.status };
      }),
    );
  };
}

export function joinRoomCallableHandler(deps: RoomMatchCallableDeps) {
  return async (
    request: RoomMatchCallableRequest<JoinRoomCallableData>,
  ): Promise<JoinRoomCallableResult> => {
    const actor = requireActor(request);
    const data = requireObject(request.data);
    const roomId = readOptionalString(data.roomId);
    const roomCode = readOptionalString(data.roomCode);

    if (roomId === null && roomCode === null) {
      throwInvalidArgument("roomId-or-roomCode-required");
    }

    return runCallableOperation(async () =>
      deps.runTransaction(async (transaction) => {
        const room = roomId
          ? await transaction.getRoom(roomId)
          : await transaction.findOpenRoomByCode(roomCode ?? "");

        if (room === null) {
          throw new Error("room-not-found");
        }

        const { room: joinedRoom } = joinServerRoom({ actor, nowMs: deps.nowMs(), room });
        await transaction.updateRoom(joinedRoom);

        return { roomCode: joinedRoom.code, roomId: joinedRoom.id, status: joinedRoom.status };
      }),
    );
  };
}

export function startMatchCallableHandler(deps: RoomMatchCallableDeps) {
  return async (
    request: RoomMatchCallableRequest<StartMatchCallableData>,
  ): Promise<StartMatchCallableResult> => {
    const actor = requireActor(request);
    const data = requireObject(request.data);
    const roomId = requireString(data.roomId, "roomId");
    const turnDurationSec = readOptionalPositiveInteger(data.turnDurationSec, "turnDurationSec");

    return runCallableOperation(async () =>
      deps.runTransaction(async (transaction) => {
        const room = await transaction.getRoom(roomId);

        if (room === null) {
          throw new Error("room-not-found");
        }

        const { match, room: startedRoom } = startServerMatch({
          actorUid: actor.uid,
          matchId: deps.createMatchId(),
          nowMs: deps.nowMs(),
          room,
          ...(turnDurationSec === null ? {} : { turnDurationSec }),
        });

        await transaction.updateRoom(startedRoom);
        await transaction.createMatch(match);

        return { matchId: match.id, roomId: startedRoom.id, status: match.status as "active" };
      }),
    );
  };
}

export function submitMoveCallableHandler(deps: RoomMatchCallableDeps) {
  return async (
    request: RoomMatchCallableRequest<SubmitMoveCallableData>,
  ): Promise<SubmitMoveCallableResult> => {
    const actor = requireActor(request);
    const data = requireObject(request.data);
    const matchId = requireString(data.matchId, "matchId");
    const payload = requireObject(data.payload);

    return runCallableOperation(async () =>
      deps.runTransaction(async (transaction) => {
        const match = await transaction.getMatch(matchId);

        if (match === null) {
          throw new Error("match-not-found");
        }

        const { match: nextMatch, moveLogEntry } = submitServerMove({
          actorUid: actor.uid,
          match,
          moveId: deps.createMoveId(matchId),
          nowMs: deps.nowMs(),
          payload,
        });

        await transaction.updateMatch(nextMatch);
        await transaction.createMoveLogEntry(moveLogEntry);

        return {
          matchId: nextMatch.id,
          stateVersion: nextMatch.stateVersion,
          status: nextMatch.status as "active" | "completed",
        };
      }),
    );
  };
}
