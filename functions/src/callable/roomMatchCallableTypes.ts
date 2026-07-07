import type { CallableRequest } from "firebase-functions/v2/https";

import type { MatchDocument, MatchMoveLogEntry, RoomDocument } from "@contracts/roomMatch";

export type RoomMatchCallableRequest<T> = Pick<CallableRequest<T>, "auth" | "data">;

export type RoomMatchCallableTransaction = {
  getRoom(roomId: string): Promise<RoomDocument | null>;
  findOpenRoomByCode(roomCode: string): Promise<RoomDocument | null>;
  createRoom(room: RoomDocument): Promise<void>;
  updateRoom(room: RoomDocument): Promise<void>;
  getMatch(matchId: string): Promise<MatchDocument | null>;
  createMatch(match: MatchDocument): Promise<void>;
  updateMatch(match: MatchDocument): Promise<void>;
  createMoveLogEntry(entry: MatchMoveLogEntry): Promise<void>;
};

export type RoomMatchCallableDeps = {
  nowMs(): number;
  createRoomId(): string;
  createMatchId(): string;
  createMoveId(matchId: string): string;
  generateRoomCode(): string;
  runTransaction<T>(handler: (transaction: RoomMatchCallableTransaction) => Promise<T>): Promise<T>;
};
