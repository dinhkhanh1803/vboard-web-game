import { getFirestore, type Firestore, type Transaction } from "firebase-admin/firestore";

import {
  getMatchMovesCollectionPath,
  matchCollectionPath,
  roomCollectionPath,
  type MatchDocument,
  type RoomDocument,
} from "@contracts/roomMatch";

import type {
  RoomMatchCallableDeps,
  RoomMatchCallableTransaction,
} from "../callable/roomMatchCallableTypes";
import { getFirebaseAdminApp } from "./firebaseAdmin";

export function createFirestoreRoomMatchCallableDeps(
  firestore: Firestore = getFirestore(getFirebaseAdminApp()),
): RoomMatchCallableDeps {
  return {
    createMatchId: () => firestore.collection(matchCollectionPath).doc().id,
    createMoveId: (matchId) => firestore.collection(getMatchMovesCollectionPath(matchId)).doc().id,
    createRoomId: () => firestore.collection(roomCollectionPath).doc().id,
    generateRoomCode,
    nowMs: () => Date.now(),
    runTransaction: (handler) =>
      firestore.runTransaction((transaction) =>
        handler(createRoomMatchTransaction(firestore, transaction)),
      ),
  };
}

function createRoomMatchTransaction(
  firestore: Firestore,
  transaction: Transaction,
): RoomMatchCallableTransaction {
  return {
    createMatch: async (match) => {
      transaction.create(firestore.collection(matchCollectionPath).doc(match.id), match);
    },
    createMoveLogEntry: async (entry) => {
      transaction.create(
        firestore.collection(getMatchMovesCollectionPath(entry.matchId)).doc(entry.id),
        entry,
      );
    },
    createRoom: async (room) => {
      transaction.create(firestore.collection(roomCollectionPath).doc(room.id), room);
    },
    findOpenRoomByCode: async (roomCode) => {
      const snapshot = await transaction.get(
        firestore
          .collection(roomCollectionPath)
          .where("code", "==", roomCode)
          .where("status", "in", ["open", "full"])
          .limit(1),
      );
      const firstRoom = snapshot.docs[0];

      return firstRoom === undefined ? null : (firstRoom.data() as RoomDocument);
    },
    getMatch: async (matchId) => {
      const snapshot = await transaction.get(
        firestore.collection(matchCollectionPath).doc(matchId),
      );

      return snapshot.exists ? (snapshot.data() as MatchDocument) : null;
    },
    getRoom: async (roomId) => {
      const snapshot = await transaction.get(firestore.collection(roomCollectionPath).doc(roomId));

      return snapshot.exists ? (snapshot.data() as RoomDocument) : null;
    },
    updateMatch: async (match) => {
      transaction.set(firestore.collection(matchCollectionPath).doc(match.id), match);
    },
    updateRoom: async (room) => {
      transaction.set(firestore.collection(roomCollectionPath).doc(room.id), room);
    },
  };
}

function generateRoomCode(): string {
  const value = Math.floor(1000 + Math.random() * 9000);
  return `VB-${value}`;
}
