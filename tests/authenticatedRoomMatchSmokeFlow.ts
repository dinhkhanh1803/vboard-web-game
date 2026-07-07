import type { GameId } from "@contracts/gameCatalog";

export type SmokeIdentity = {
  displayName: string | null;
  uid: string;
};

export type SmokeRoomResult = {
  roomCode?: string;
  roomId: string;
  status: string;
};

export type SmokeMatchResult = {
  matchId: string;
  roomId: string;
  status: string;
};

export type SmokeMoveResult = {
  matchId: string;
  stateVersion: number;
  status: string;
};

export type SmokeRoomSnapshot = {
  id: string;
  matchId: string | null;
  status: string;
};

export type SmokeMatchSnapshot = {
  id: string;
  stateVersion: number;
  status: string;
};

export type SmokeMoveLogSnapshot = {
  actorUid: string;
  matchId: string;
  payload: Record<string, unknown>;
  sequence: number;
};

export type AuthenticatedRoomMatchSmokeClients = {
  auth: {
    signInGuest(slot: "guest" | "host"): Promise<SmokeIdentity>;
  };
  reads: {
    getMatch(matchId: string): Promise<SmokeMatchSnapshot>;
    getMatchMoves(matchId: string): Promise<SmokeMoveLogSnapshot[]>;
    getRoom(roomId: string): Promise<SmokeRoomSnapshot>;
  };
  roomMatch: {
    createRoom(
      actor: SmokeIdentity,
      input: { gameId: GameId },
    ): Promise<SmokeRoomResult & { actorUid?: string; gameId?: GameId }>;
    joinRoom(
      actor: SmokeIdentity,
      input: { roomId: string },
    ): Promise<SmokeRoomResult & { actorUid?: string }>;
    startMatch(
      actor: SmokeIdentity,
      input: { roomId: string },
    ): Promise<SmokeMatchResult & { actorUid?: string }>;
    submitMove(
      actor: SmokeIdentity,
      input: { matchId: string; payload: Record<string, unknown> },
    ): Promise<SmokeMoveResult & { actorUid?: string; payload?: Record<string, unknown> }>;
  };
};

export type AuthenticatedRoomMatchSmokeResult = {
  createdRoom: Awaited<ReturnType<AuthenticatedRoomMatchSmokeClients["roomMatch"]["createRoom"]>>;
  guest: SmokeIdentity;
  host: SmokeIdentity;
  joinedRoom: Awaited<ReturnType<AuthenticatedRoomMatchSmokeClients["roomMatch"]["joinRoom"]>>;
  match: SmokeMatchSnapshot;
  moves: SmokeMoveLogSnapshot[];
  room: SmokeRoomSnapshot;
  startedMatch: Awaited<ReturnType<AuthenticatedRoomMatchSmokeClients["roomMatch"]["startMatch"]>>;
  submittedMove: Awaited<ReturnType<AuthenticatedRoomMatchSmokeClients["roomMatch"]["submitMove"]>>;
};

export async function runAuthenticatedRoomMatchSmokeFlow(
  clients: AuthenticatedRoomMatchSmokeClients,
): Promise<AuthenticatedRoomMatchSmokeResult> {
  const host = await clients.auth.signInGuest("host");
  const guest = await clients.auth.signInGuest("guest");
  const createdRoom = await clients.roomMatch.createRoom(host, { gameId: "connect-4" });
  const joinedRoom = await clients.roomMatch.joinRoom(guest, { roomId: createdRoom.roomId });
  const startedMatch = await clients.roomMatch.startMatch(host, { roomId: createdRoom.roomId });
  const submittedMove = await clients.roomMatch.submitMove(host, {
    matchId: startedMatch.matchId,
    payload: { column: 3 },
  });
  const room = await clients.reads.getRoom(createdRoom.roomId);
  const match = await clients.reads.getMatch(startedMatch.matchId);
  const moves = await clients.reads.getMatchMoves(startedMatch.matchId);

  return {
    createdRoom,
    guest,
    host,
    joinedRoom,
    match,
    moves,
    room,
    startedMatch,
    submittedMove,
  };
}
