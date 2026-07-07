import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions";
import { describe, expect, it } from "vitest";

import {
  createAuthenticatedRoomMatchIntentClient,
  createFirestoreCollectionSubscriber,
  createFirestoreDocumentSubscriber,
  createFunctionsCallableIntentInvoker,
  createRoomMatchIntentClient,
  createRoomMatchReadClient,
  readFirebaseIdentityFromAuth,
  type RoomMatchIntentClient,
  type RoomMatchReadClient,
} from "@/firebase";

import {
  runAuthenticatedRoomMatchSmokeFlow,
  type AuthenticatedRoomMatchSmokeClients,
  type SmokeIdentity,
  type SmokeMatchSnapshot,
  type SmokeMoveLogSnapshot,
  type SmokeRoomSnapshot,
} from "./authenticatedRoomMatchSmokeFlow";

const projectId = "vboard-arena-local";
const hasRequiredEmulators =
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined &&
  process.env.FIRESTORE_EMULATOR_HOST !== undefined;

const describeWithEmulators = hasRequiredEmulators ? describe : describe.skip;

type SmokeSlot = "guest" | "host";

type EndpointSession = {
  app: FirebaseApp;
  identity: SmokeIdentity;
  intentClient: RoomMatchIntentClient;
  readClient: RoomMatchReadClient;
};

type CallableEndpointSmokeHarness = {
  cleanup(): Promise<void>;
  clients: AuthenticatedRoomMatchSmokeClients;
};

describeWithEmulators("room/match callable endpoint smoke flow", () => {
  it("uses Auth, Firestore, and Functions emulators through frontend boundaries", async () => {
    const harness = createCallableEndpointSmokeHarness();

    try {
      const result = await runAuthenticatedRoomMatchSmokeFlow(harness.clients);

      expect(result.host.uid).not.toEqual(result.guest.uid);
      expect(result.createdRoom.status).toBe("open");
      expect(result.joinedRoom.status).toBe("full");
      expect(result.startedMatch.status).toBe("active");
      expect(result.submittedMove.stateVersion).toBe(1);
      expect(result.room.status).toBe("in-match");
      expect(result.room.matchId).toBe(result.startedMatch.matchId);
      expect(result.match.status).toBe("active");
      expect(result.match.stateVersion).toBe(1);
      expect(result.moves).toEqual([
        expect.objectContaining({
          actorUid: result.host.uid,
          matchId: result.startedMatch.matchId,
          payload: { column: 3 },
          sequence: 1,
        }),
      ]);
    } finally {
      await harness.cleanup();
    }
  }, 20_000);
});

function createCallableEndpointSmokeHarness(): CallableEndpointSmokeHarness {
  const sessions: EndpointSession[] = [];
  const sessionsBySlot = new Map<SmokeSlot, EndpointSession>();

  const createSession = async (slot: SmokeSlot) => {
    const session = await createEndpointSession(slot);
    sessions.push(session);
    sessionsBySlot.set(slot, session);

    return session.identity;
  };

  return {
    cleanup: async () => {
      await Promise.allSettled(sessions.map((session) => deleteApp(session.app)));
    },
    clients: {
      auth: {
        signInGuest: createSession,
      },
      reads: {
        getMatch: (matchId) =>
          waitForMatch(requireSession(sessionsBySlot, "host").readClient, matchId),
        getMatchMoves: (matchId) =>
          waitForMatchMoves(requireSession(sessionsBySlot, "host").readClient, matchId),
        getRoom: (roomId) => waitForRoom(requireSession(sessionsBySlot, "host").readClient, roomId),
      },
      roomMatch: {
        createRoom: (_actor, input) =>
          requireSession(sessionsBySlot, "host").intentClient.createRoom(input),
        joinRoom: (_actor, input) =>
          requireSession(sessionsBySlot, "guest").intentClient.joinRoom(input),
        startMatch: (_actor, input) =>
          requireSession(sessionsBySlot, "host").intentClient.startMatch(input),
        submitMove: (_actor, input) =>
          requireSession(sessionsBySlot, "host").intentClient.submitMove(input),
      },
    },
  };
}

async function createEndpointSession(slot: SmokeSlot): Promise<EndpointSession> {
  const app = initializeApp(
    {
      apiKey: "demo-api-key",
      appId: "1:1234567890:web:vboard-local",
      authDomain: `${projectId}.firebaseapp.com`,
      messagingSenderId: "1234567890",
      projectId,
      storageBucket: `${projectId}.appspot.com`,
    },
    `vboard-callable-smoke-${slot}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const functions = getFunctions(app);

  connectEmulators({ auth, firestore, functions });

  await signInAnonymously(auth);

  const identity = readFirebaseIdentityFromAuth(auth);

  if (identity === null) {
    throw new Error(`Auth emulator did not create a ${slot} identity.`);
  }

  return {
    app,
    identity,
    intentClient: createAuthenticatedRoomMatchIntentClient(
      createRoomMatchIntentClient(createFunctionsCallableIntentInvoker(functions)),
      () => readFirebaseIdentityFromAuth(auth),
    ),
    readClient: createRoomMatchReadClient(
      createFirestoreDocumentSubscriber(firestore),
      createFirestoreCollectionSubscriber(firestore),
    ),
  };
}

function connectEmulators(services: { auth: Auth; firestore: Firestore; functions: Functions }) {
  const authHost = readRequiredEnv("FIREBASE_AUTH_EMULATOR_HOST");
  const firestoreHost = splitHostPort(readRequiredEnv("FIRESTORE_EMULATOR_HOST"));
  const functionsHost = splitHostPort(process.env.FUNCTIONS_EMULATOR_HOST ?? "localhost:5001");

  connectAuthEmulator(services.auth, `http://${authHost}`, {
    disableWarnings: true,
  });
  connectFirestoreEmulator(services.firestore, firestoreHost.host, firestoreHost.port);
  connectFunctionsEmulator(services.functions, functionsHost.host, functionsHost.port);
}

function requireSession(
  sessionsBySlot: Map<SmokeSlot, EndpointSession>,
  slot: SmokeSlot,
): EndpointSession {
  const session = sessionsBySlot.get(slot);

  if (session === undefined) {
    throw new Error(`The ${slot} endpoint session has not signed in yet.`);
  }

  return session;
}

function waitForRoom(readClient: RoomMatchReadClient, roomId: string): Promise<SmokeRoomSnapshot> {
  return new Promise((resolve, reject) => {
    let unsubscribe: (() => void) | null = null;
    const timeoutId = setTimeout(() => {
      unsubscribe?.();
      reject(new Error(`Timed out waiting for room ${roomId}.`));
    }, 5_000);

    unsubscribe = readClient.subscribeToRoom(roomId, (state) => {
      if (state.status === "missing") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        reject(new Error(`Room ${state.id} was not written.`));
      }

      if (state.status === "error") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        reject(new Error(state.message));
      }

      if (state.status === "ready") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        resolve({
          id: state.data.id,
          matchId: state.data.matchId,
          status: state.data.status,
        });
      }
    });
  });
}

function waitForMatch(
  readClient: RoomMatchReadClient,
  matchId: string,
): Promise<SmokeMatchSnapshot> {
  return new Promise((resolve, reject) => {
    let unsubscribe: (() => void) | null = null;
    const timeoutId = setTimeout(() => {
      unsubscribe?.();
      reject(new Error(`Timed out waiting for match ${matchId}.`));
    }, 5_000);

    unsubscribe = readClient.subscribeToMatch(matchId, (state) => {
      if (state.status === "missing") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        reject(new Error(`Match ${state.id} was not written.`));
      }

      if (state.status === "error") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        reject(new Error(state.message));
      }

      if (state.status === "ready") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        resolve({
          id: state.data.id,
          stateVersion: state.data.stateVersion,
          status: state.data.status,
        });
      }
    });
  });
}

function waitForMatchMoves(
  readClient: RoomMatchReadClient,
  matchId: string,
): Promise<SmokeMoveLogSnapshot[]> {
  return new Promise((resolve, reject) => {
    let unsubscribe: (() => void) | null = null;
    const timeoutId = setTimeout(() => {
      unsubscribe?.();
      reject(new Error(`Timed out waiting for match moves ${matchId}.`));
    }, 5_000);

    unsubscribe = readClient.subscribeToMatchMoves(matchId, (state) => {
      if (state.status === "error") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        reject(new Error(state.message));
      }

      if (state.status === "ready" && state.data.length > 0) {
        clearTimeout(timeoutId);
        unsubscribe?.();
        resolve(
          state.data.map((move) => ({
            actorUid: move.actorUid,
            matchId: move.matchId,
            payload: move.payload,
            sequence: move.sequence,
          })),
        );
      }
    });
  });
}

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`${name} is required for callable endpoint smoke tests.`);
  }

  return value;
}

function splitHostPort(value: string): { host: string; port: number } {
  const [host, portText] = value.split(":");
  const port = Number(portText);

  if (!host || !Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid emulator host:port value "${value}".`);
  }

  return { host, port };
}
