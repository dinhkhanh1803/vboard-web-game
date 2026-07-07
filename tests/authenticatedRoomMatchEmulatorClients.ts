import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import {
  getMatchMovesCollectionPath,
  matchCollectionPath,
  roomCollectionPath,
  type MatchDocument,
  type MatchMoveLogEntry,
  type RoomDocument,
} from "@contracts/roomMatch";
import {
  createRoomCallableHandler,
  joinRoomCallableHandler,
  startMatchCallableHandler,
  submitMoveCallableHandler,
} from "@functions/callable/roomMatchCallables";
import type { RoomMatchCallableRequest } from "@functions/callable/roomMatchCallableTypes";
import { createFirestoreRoomMatchCallableDeps } from "@functions/integrations/roomMatchFirestore";

import type {
  AuthenticatedRoomMatchSmokeClients,
  SmokeIdentity,
} from "./authenticatedRoomMatchSmokeFlow";

export type AuthenticatedRoomMatchEmulatorHarness = {
  cleanup(): Promise<void>;
  clients: AuthenticatedRoomMatchSmokeClients;
};

export type AuthenticatedRoomMatchEmulatorHarnessOptions = {
  projectId: string;
};

type AuthEmulatorSignUpResponse = {
  localId?: unknown;
};

export function createAuthenticatedRoomMatchEmulatorHarness(
  options: AuthenticatedRoomMatchEmulatorHarnessOptions,
): AuthenticatedRoomMatchEmulatorHarness {
  const app = initializeApp(
    { projectId: options.projectId },
    `vboard-auth-smoke-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const firestore = getFirestore(app);
  const deps = createFirestoreRoomMatchCallableDeps(firestore);
  const createRoom = createRoomCallableHandler(deps);
  const joinRoom = joinRoomCallableHandler(deps);
  const startMatch = startMatchCallableHandler(deps);
  const submitMove = submitMoveCallableHandler(deps);

  return {
    cleanup: () => deleteApp(app),
    clients: {
      auth: {
        signInGuest: async (slot) => {
          const uid = await signInAnonymousUserWithAuthEmulator();

          return {
            displayName: slot === "host" ? "Smoke Host" : "Smoke Guest",
            uid,
          };
        },
      },
      reads: {
        getMatch: (matchId) => readRequiredMatch(firestore, matchId),
        getMatchMoves: (matchId) => readMatchMoves(firestore, matchId),
        getRoom: (roomId) => readRequiredRoom(firestore, roomId),
      },
      roomMatch: {
        createRoom: (actor, data) => createRoom(toCallableRequest(actor, data)),
        joinRoom: (actor, data) => joinRoom(toCallableRequest(actor, data)),
        startMatch: (actor, data) => startMatch(toCallableRequest(actor, data)),
        submitMove: (actor, data) => submitMove(toCallableRequest(actor, data)),
      },
    },
  };
}

async function signInAnonymousUserWithAuthEmulator(): Promise<string> {
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

  if (!authHost) {
    throw new Error("FIREBASE_AUTH_EMULATOR_HOST is required for auth smoke tests.");
  }

  const response = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      body: JSON.stringify({ returnSecureToken: true }),
      headers: { "content-type": "application/json" },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(`Auth emulator anonymous sign-in failed with HTTP ${response.status}.`);
  }

  const body = (await response.json()) as AuthEmulatorSignUpResponse;

  if (typeof body.localId !== "string" || body.localId.length === 0) {
    throw new Error("Auth emulator anonymous sign-in did not return a uid.");
  }

  return body.localId;
}

function toCallableRequest<TData>(
  actor: SmokeIdentity,
  data: TData,
): RoomMatchCallableRequest<TData> {
  const auth = {
    token: {
      firebase: {
        sign_in_provider: "anonymous",
      },
      name: actor.displayName ?? actor.uid,
    },
    uid: actor.uid,
  } as NonNullable<RoomMatchCallableRequest<TData>["auth"]>;

  return { auth, data };
}

async function readRequiredRoom(firestore: Firestore, roomId: string): Promise<RoomDocument> {
  const snapshot = await firestore.collection(roomCollectionPath).doc(roomId).get();

  if (!snapshot.exists) {
    throw new Error(`Room ${roomId} was not written to the Firestore emulator.`);
  }

  return snapshot.data() as RoomDocument;
}

async function readRequiredMatch(firestore: Firestore, matchId: string): Promise<MatchDocument> {
  const snapshot = await firestore.collection(matchCollectionPath).doc(matchId).get();

  if (!snapshot.exists) {
    throw new Error(`Match ${matchId} was not written to the Firestore emulator.`);
  }

  return snapshot.data() as MatchDocument;
}

async function readMatchMoves(firestore: Firestore, matchId: string): Promise<MatchMoveLogEntry[]> {
  const snapshot = await firestore
    .collection(getMatchMovesCollectionPath(matchId))
    .orderBy("sequence", "asc")
    .get();

  return snapshot.docs.map((documentSnapshot) => documentSnapshot.data() as MatchMoveLogEntry);
}
