import { httpsCallable, type Functions } from "firebase/functions";

import type { GameId } from "@contracts/gameCatalog";

import {
  getFirebaseIdentityClient,
  readFirebaseIdentityFromAuth,
  type FirebaseIdentityClient,
  type FirebaseIdentityReader,
} from "@/firebase/authIdentity";
import { getFirebaseClientServices } from "@/firebase/clientApp";
import type { FirebaseEnv } from "@/firebase/config";

export const roomMatchCallableNames = {
  createRoom: "createRoom",
  joinRoom: "joinRoom",
  startMatch: "startMatch",
  submitMove: "submitMove",
} as const;

export type RoomMatchCallableName =
  (typeof roomMatchCallableNames)[keyof typeof roomMatchCallableNames];

export type CallableIntentInvoker = <Input, Output>(
  name: RoomMatchCallableName,
  data: Input,
) => Promise<Output>;

export type CreateRoomIntentInput = {
  gameId: GameId;
};

export type JoinRoomIntentInput = {
  roomId?: string;
  roomCode?: string;
};

export type StartMatchIntentInput = {
  roomId: string;
  turnDurationSec?: number;
};

export type SubmitMoveIntentInput = {
  matchId: string;
  payload: Record<string, unknown>;
};

export type RoomIntentResult = {
  roomId: string;
  roomCode: string;
  status: "open" | "full" | "starting" | "in-match" | "closed";
};

export type StartMatchIntentResult = {
  roomId: string;
  matchId: string;
  status: "active";
};

export type SubmitMoveIntentResult = {
  matchId: string;
  stateVersion: number;
  status: "active" | "completed";
};

export type RoomMatchIntentClient = {
  createRoom(input: CreateRoomIntentInput): Promise<RoomIntentResult>;
  joinRoom(input: JoinRoomIntentInput): Promise<RoomIntentResult>;
  startMatch(input: StartMatchIntentInput): Promise<StartMatchIntentResult>;
  submitMove(input: SubmitMoveIntentInput): Promise<SubmitMoveIntentResult>;
};

export const roomMatchAuthRequiredMessage =
  "Firebase Auth sign-in is required before room and match actions.";

export function createRoomMatchIntentClient(
  invokeCallable: CallableIntentInvoker,
): RoomMatchIntentClient {
  return {
    createRoom: (input) =>
      invokeCallable<CreateRoomIntentInput, RoomIntentResult>(
        roomMatchCallableNames.createRoom,
        input,
      ),
    joinRoom: (input) =>
      invokeCallable<JoinRoomIntentInput, RoomIntentResult>(roomMatchCallableNames.joinRoom, input),
    startMatch: (input) =>
      invokeCallable<StartMatchIntentInput, StartMatchIntentResult>(
        roomMatchCallableNames.startMatch,
        input,
      ),
    submitMove: (input) =>
      invokeCallable<SubmitMoveIntentInput, SubmitMoveIntentResult>(
        roomMatchCallableNames.submitMove,
        input,
      ),
  };
}

export function createAuthenticatedRoomMatchIntentClient(
  client: RoomMatchIntentClient,
  readIdentity: FirebaseIdentityReader,
): RoomMatchIntentClient {
  const requireIdentity = () => {
    if (readIdentity() === null) {
      throw new Error(roomMatchAuthRequiredMessage);
    }
  };

  return {
    createRoom: async (input) => {
      requireIdentity();

      return client.createRoom(input);
    },
    joinRoom: async (input) => {
      requireIdentity();

      return client.joinRoom(input);
    },
    startMatch: async (input) => {
      requireIdentity();

      return client.startMatch(input);
    },
    submitMove: async (input) => {
      requireIdentity();

      return client.submitMove(input);
    },
  };
}

export type GuestReadyRoomMatchIntentClientDeps = {
  readIdentityClient(): FirebaseIdentityClient | null;
  readIntentClient(): RoomMatchIntentClient | null;
};

export async function createGuestReadyRoomMatchIntentClient(
  deps: GuestReadyRoomMatchIntentClientDeps,
): Promise<RoomMatchIntentClient | null> {
  const identityClient = deps.readIdentityClient();
  const intentClient = deps.readIntentClient();

  if (identityClient === null || intentClient === null) {
    return null;
  }

  if (identityClient.readCurrentUser() === null) {
    await identityClient.signInAsGuest();
  }

  return intentClient;
}
export function createFunctionsCallableIntentInvoker(functions: Functions): CallableIntentInvoker {
  return async <Input, Output>(name: RoomMatchCallableName, data: Input): Promise<Output> => {
    const callable = httpsCallable<Input, Output>(functions, name);
    const result = await callable(data);

    return result.data;
  };
}

export function getGuestReadyRoomMatchIntentClient(
  env: FirebaseEnv = import.meta.env,
): Promise<RoomMatchIntentClient | null> {
  return createGuestReadyRoomMatchIntentClient({
    readIdentityClient: () => getFirebaseIdentityClient(env),
    readIntentClient: () => getRoomMatchIntentClient(env),
  });
}
export function getRoomMatchIntentClient(
  env: FirebaseEnv = import.meta.env,
): RoomMatchIntentClient | null {
  const services = getFirebaseClientServices(env);

  if (services === null) {
    return null;
  }

  return createAuthenticatedRoomMatchIntentClient(
    createRoomMatchIntentClient(createFunctionsCallableIntentInvoker(services.functions)),
    () => readFirebaseIdentityFromAuth(services.auth),
  );
}
