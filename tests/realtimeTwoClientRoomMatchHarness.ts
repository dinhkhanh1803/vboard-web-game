import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInAnonymously, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions";

import type { MatchDocument, MatchMoveLogEntry } from "@contracts/roomMatch";

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
  type SubmitMoveIntentResult,
} from "@/firebase";

import type { SmokeIdentity } from "./authenticatedRoomMatchSmokeFlow";

export type RealtimeTwoClientRoomMatchHarnessOptions = {
  projectId: string;
};

export type RealtimeRoomMatchClientSession = {
  identity: SmokeIdentity;
  intentClient: RoomMatchIntentClient;
  readClient: RoomMatchReadClient;
  waitForMatchState(
    matchId: string,
    predicate: (match: MatchDocument) => boolean,
  ): Promise<MatchDocument>;
  waitForMoveLog(
    matchId: string,
    predicate: (moves: MatchMoveLogEntry[]) => boolean,
  ): Promise<MatchMoveLogEntry[]>;
};

export type RealtimeTwoClientRoomMatchHarness = {
  cleanup(): Promise<void>;
  guest: RealtimeRoomMatchClientSession;
  host: RealtimeRoomMatchClientSession;
};

export type PlayConnect4ColumnsInput = {
  columns: readonly number[];
  harness: RealtimeTwoClientRoomMatchHarness;
  matchId: string;
};

type SmokeSlot = "guest" | "host";

type EndpointSession = RealtimeRoomMatchClientSession & {
  app: FirebaseApp;
};

const waitTimeoutMs = 7_500;

export async function createRealtimeTwoClientRoomMatchHarness(
  options: RealtimeTwoClientRoomMatchHarnessOptions,
): Promise<RealtimeTwoClientRoomMatchHarness> {
  const host = await createEndpointSession({ projectId: options.projectId, slot: "host" });
  const guest = await createEndpointSession({ projectId: options.projectId, slot: "guest" });

  return {
    cleanup: async () => {
      await Promise.allSettled([deleteApp(host.app), deleteApp(guest.app)]);
    },
    guest,
    host,
  };
}

export async function playConnect4Columns(
  input: PlayConnect4ColumnsInput,
): Promise<SubmitMoveIntentResult[]> {
  const submittedMoves: SubmitMoveIntentResult[] = [];

  for (const [index, column] of input.columns.entries()) {
    const actor = index % 2 === 0 ? input.harness.host : input.harness.guest;
    const result = await actor.intentClient.submitMove({
      matchId: input.matchId,
      payload: { column },
    });

    submittedMoves.push(result);
  }

  return submittedMoves;
}

async function createEndpointSession(options: {
  projectId: string;
  slot: SmokeSlot;
}): Promise<EndpointSession> {
  const app = initializeApp(
    {
      apiKey: "demo-api-key",
      appId: "1:1234567890:web:vboard-local",
      authDomain: `${options.projectId}.firebaseapp.com`,
      messagingSenderId: "1234567890",
      projectId: options.projectId,
      storageBucket: `${options.projectId}.appspot.com`,
    },
    `vboard-realtime-smoke-${options.slot}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const functions = getFunctions(app);

  connectEmulators({ auth, firestore, functions });

  await signInAnonymously(auth);

  const identity = readFirebaseIdentityFromAuth(auth);

  if (identity === null) {
    throw new Error(`Auth emulator did not create a ${options.slot} identity.`);
  }

  const readClient = createRoomMatchReadClient(
    createFirestoreDocumentSubscriber(firestore),
    createFirestoreCollectionSubscriber(firestore),
  );

  return {
    app,
    identity,
    intentClient: createAuthenticatedRoomMatchIntentClient(
      createRoomMatchIntentClient(createFunctionsCallableIntentInvoker(functions)),
      () => readFirebaseIdentityFromAuth(auth),
    ),
    readClient,
    waitForMatchState: (matchId, predicate) => waitForMatchState(readClient, matchId, predicate),
    waitForMoveLog: (matchId, predicate) => waitForMoveLog(readClient, matchId, predicate),
  };
}

function waitForMatchState(
  readClient: RoomMatchReadClient,
  matchId: string,
  predicate: (match: MatchDocument) => boolean,
): Promise<MatchDocument> {
  return new Promise((resolve, reject) => {
    let unsubscribe: (() => void) | null = null;
    const timeoutId = setTimeout(() => {
      unsubscribe?.();
      reject(new Error(`Timed out waiting for match ${matchId}.`));
    }, waitTimeoutMs);

    unsubscribe = readClient.subscribeToMatch(matchId, (state) => {
      if (state.status === "missing") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        reject(new Error(`Match ${state.id} was not written.`));

        return;
      }

      if (state.status === "error") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        reject(new Error(state.message));

        return;
      }

      if (predicate(state.data)) {
        clearTimeout(timeoutId);
        unsubscribe?.();
        resolve(state.data);
      }
    });
  });
}

function waitForMoveLog(
  readClient: RoomMatchReadClient,
  matchId: string,
  predicate: (moves: MatchMoveLogEntry[]) => boolean,
): Promise<MatchMoveLogEntry[]> {
  return new Promise((resolve, reject) => {
    let unsubscribe: (() => void) | null = null;
    const timeoutId = setTimeout(() => {
      unsubscribe?.();
      reject(new Error(`Timed out waiting for match move log ${matchId}.`));
    }, waitTimeoutMs);

    unsubscribe = readClient.subscribeToMatchMoves(matchId, (state) => {
      if (state.status === "error") {
        clearTimeout(timeoutId);
        unsubscribe?.();
        reject(new Error(state.message));

        return;
      }

      if (predicate(state.data)) {
        clearTimeout(timeoutId);
        unsubscribe?.();
        resolve(state.data);
      }
    });
  });
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

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`${name} is required for realtime two-client smoke tests.`);
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
