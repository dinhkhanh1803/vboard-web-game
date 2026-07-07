// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const root = process.cwd();
const firestoreRulesPath = join(root, "firebase/firestore.rules");
const hasFirestoreEmulator = process.env.FIRESTORE_EMULATOR_HOST !== undefined;

const publicRoom = {
  id: "room-public",
  code: "VB-1042",
  gameId: "connect-4",
  status: "open",
  visibility: "public",
  hostUid: "host-uid",
  maxPlayers: 2,
  matchId: null,
  playerSlots: [
    {
      avatarUrl: null,
      displayName: "Host",
      isHost: true,
      joinedAtMs: 1_000,
      ready: true,
      seatIndex: 0,
      status: "occupied",
      uid: "host-uid",
    },
    {
      avatarUrl: null,
      displayName: null,
      isHost: false,
      joinedAtMs: null,
      ready: false,
      seatIndex: 1,
      status: "open",
      uid: null,
    },
  ],
  createdAtMs: 1_000,
  updatedAtMs: 1_000,
  expiresAtMs: 1_801_000,
};

const privateRoom = {
  ...publicRoom,
  id: "room-private",
  code: "VB-9999",
  visibility: "private",
};

const activeMatch = {
  id: "match-1",
  roomId: "room-public",
  gameId: "connect-4",
  status: "active",
  players: [
    {
      avatarUrl: null,
      connected: true,
      displayName: "Host",
      resignedAtMs: null,
      seatIndex: 0,
      uid: "host-uid",
    },
    {
      avatarUrl: null,
      connected: true,
      displayName: "Guest",
      resignedAtMs: null,
      seatIndex: 1,
      uid: "guest-uid",
    },
  ],
  turn: {
    activeSeatIndex: 0,
    turnDeadlineAtMs: 33_000,
    turnDurationSec: 30,
    turnNumber: 1,
    turnStartedAtMs: 3_000,
  },
  result: {
    completedAtMs: null,
    reason: null,
    winnerSeatIndex: null,
    winnerUid: null,
  },
  publicState: { board: [], currentPlayerSeatIndex: 0 },
  stateVersion: 0,
  createdAtMs: 3_000,
  updatedAtMs: 3_000,
  startedAtMs: 3_000,
  completedAtMs: null,
};

const moveLogEntry = {
  id: "move-1",
  matchId: "match-1",
  gameId: "connect-4",
  sequence: 1,
  actorUid: "host-uid",
  actorSeatIndex: 0,
  moveType: "drop-disc",
  payload: { column: 3 },
  stateVersionBefore: 0,
  stateVersionAfter: 1,
  createdAtMs: 4_000,
};

describe("Firebase rules baseline", () => {
  it("keeps Firestore fallback client writes closed by default", () => {
    const rules = readFileSync(firestoreRulesPath, "utf8");

    expect(rules).toContain("match /{document=**}");
    expect(rules).toContain("allow read, write: if false;");
  });

  it("keeps Storage client access closed by default", () => {
    const rules = readFileSync(join(root, "firebase/storage.rules"), "utf8");

    expect(rules).toContain("allow read, write: if false;");
  });

  it("keeps Realtime Database client access closed by default", () => {
    const rules = JSON.parse(readFileSync(join(root, "firebase/database.rules.json"), "utf8"));

    expect(rules.rules[".read"]).toBe(false);
    expect(rules.rules[".write"]).toBe(false);
  });
});

const describeFirestoreRules = hasFirestoreEmulator ? describe : describe.skip;

describeFirestoreRules("Firestore room and match rules", () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: "vboard-arena-rules-test",
      firestore: {
        rules: readFileSync(firestoreRulesPath, "utf8"),
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, "rooms/room-public"), publicRoom);
      await setDoc(doc(db, "rooms/room-private"), privateRoom);
      await setDoc(doc(db, "matches/match-1"), activeMatch);
      await setDoc(doc(db, "matches/match-1/moves/move-1"), moveLogEntry);
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("allows signed-in players to read public rooms and denies private or anonymous room reads", async () => {
    const playerDb = testEnv.authenticatedContext("guest-uid").firestore();
    const anonymousDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(playerDb, "rooms/room-public")));
    await assertSucceeds(
      getDocs(query(collection(playerDb, "rooms"), where("visibility", "==", "public"))),
    );
    await assertFails(getDoc(doc(playerDb, "rooms/room-private")));
    await assertFails(getDoc(doc(anonymousDb, "rooms/room-public")));
  });

  it("denies all client writes to official room documents", async () => {
    const playerDb = testEnv.authenticatedContext("host-uid").firestore();

    await assertFails(setDoc(doc(playerDb, "rooms/client-room"), publicRoom));
    await assertFails(updateDoc(doc(playerDb, "rooms/room-public"), { status: "in-match" }));
  });

  it("allows match players to read match state and denies non-player or anonymous reads", async () => {
    const hostDb = testEnv.authenticatedContext("host-uid").firestore();
    const spectatorDb = testEnv.authenticatedContext("spectator-uid").firestore();
    const anonymousDb = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(hostDb, "matches/match-1")));
    await assertFails(getDoc(doc(spectatorDb, "matches/match-1")));
    await assertFails(getDoc(doc(anonymousDb, "matches/match-1")));
  });

  it("allows match players to read move logs and denies non-player reads", async () => {
    const guestDb = testEnv.authenticatedContext("guest-uid").firestore();
    const spectatorDb = testEnv.authenticatedContext("spectator-uid").firestore();

    await assertSucceeds(getDoc(doc(guestDb, "matches/match-1/moves/move-1")));
    await assertSucceeds(getDocs(query(collection(guestDb, "matches/match-1/moves"))));
    await assertFails(getDoc(doc(spectatorDb, "matches/match-1/moves/move-1")));
  });

  it("denies all client writes to official match and move-log documents", async () => {
    const playerDb = testEnv.authenticatedContext("host-uid").firestore();

    await assertFails(updateDoc(doc(playerDb, "matches/match-1"), { stateVersion: 2 }));
    await assertFails(setDoc(doc(playerDb, "matches/match-1/moves/client-move"), moveLogEntry));
  });
});
