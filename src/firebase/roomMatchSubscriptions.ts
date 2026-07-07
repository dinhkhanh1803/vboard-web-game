import { collection, doc, onSnapshot, orderBy, query, type Firestore } from "firebase/firestore";

import {
  getMatchMovesCollectionPath,
  matchCollectionPath,
  roomCollectionPath,
  type MatchDocument,
  type MatchMoveLogEntry,
  type RoomDocument,
} from "@contracts/roomMatch";

import { getFirebaseClientServices } from "@/firebase/clientApp";
import type { FirebaseEnv } from "@/firebase/config";

export type RoomMatchReadState<TDocument> =
  | {
      status: "ready";
      data: TDocument;
    }
  | {
      status: "missing";
      id: string;
    }
  | {
      status: "error";
      message: string;
    };

export type RoomMatchCollectionReadState<TDocument> =
  | {
      status: "ready";
      data: TDocument[];
    }
  | {
      status: "error";
      message: string;
    };

export type RoomReadState = RoomMatchReadState<RoomDocument>;
export type MatchReadState = RoomMatchReadState<MatchDocument>;
export type MatchMoveLogReadState = RoomMatchCollectionReadState<MatchMoveLogEntry>;
export type RoomMatchReadListener<TDocument> = (state: RoomMatchReadState<TDocument>) => void;
export type RoomMatchCollectionReadListener<TDocument> = (
  state: RoomMatchCollectionReadState<TDocument>,
) => void;
export type RoomMatchUnsubscribe = () => void;

export type ReadonlyDocumentSubscriber = <TDocument>(
  collectionPath: string,
  documentId: string,
  listener: RoomMatchReadListener<TDocument>,
) => RoomMatchUnsubscribe;

export type ReadonlyCollectionSubscriber = <TDocument>(
  collectionPath: string,
  orderByField: string,
  listener: RoomMatchCollectionReadListener<TDocument>,
) => RoomMatchUnsubscribe;

export type RoomMatchReadClient = {
  subscribeToRoom(
    roomId: string,
    listener: RoomMatchReadListener<RoomDocument>,
  ): RoomMatchUnsubscribe;
  subscribeToMatch(
    matchId: string,
    listener: RoomMatchReadListener<MatchDocument>,
  ): RoomMatchUnsubscribe;
  subscribeToMatchMoves(
    matchId: string,
    listener: RoomMatchCollectionReadListener<MatchMoveLogEntry>,
  ): RoomMatchUnsubscribe;
};

export function createRoomMatchReadClient(
  subscribeDocument: ReadonlyDocumentSubscriber,
  subscribeCollection: ReadonlyCollectionSubscriber,
): RoomMatchReadClient {
  return {
    subscribeToRoom: (roomId, listener) =>
      subscribeDocument<RoomDocument>(roomCollectionPath, roomId, listener),
    subscribeToMatch: (matchId, listener) =>
      subscribeDocument<MatchDocument>(matchCollectionPath, matchId, listener),
    subscribeToMatchMoves: (matchId, listener) =>
      subscribeCollection<MatchMoveLogEntry>(
        getMatchMovesCollectionPath(matchId),
        "sequence",
        listener,
      ),
  };
}

export function createFirestoreDocumentSubscriber(
  firestore: Firestore,
): ReadonlyDocumentSubscriber {
  return <TDocument>(
    collectionPath: string,
    documentId: string,
    listener: RoomMatchReadListener<TDocument>,
  ) => {
    const reference = doc(firestore, collectionPath, documentId);

    return onSnapshot(
      reference,
      (snapshot) => {
        if (!snapshot.exists()) {
          listener({ id: documentId, status: "missing" });

          return;
        }

        listener({ data: snapshot.data() as TDocument, status: "ready" });
      },
      (error) => {
        listener({ message: getReadErrorMessage(error), status: "error" });
      },
    );
  };
}

export function createFirestoreCollectionSubscriber(
  firestore: Firestore,
): ReadonlyCollectionSubscriber {
  return <TDocument>(
    collectionPath: string,
    orderByField: string,
    listener: RoomMatchCollectionReadListener<TDocument>,
  ) => {
    const reference = query(collection(firestore, collectionPath), orderBy(orderByField, "asc"));

    return onSnapshot(
      reference,
      (snapshot) => {
        listener({
          data: snapshot.docs.map((documentSnapshot) => documentSnapshot.data() as TDocument),
          status: "ready",
        });
      },
      (error) => {
        listener({ message: getReadErrorMessage(error), status: "error" });
      },
    );
  };
}

export function getRoomMatchReadClient(
  env: FirebaseEnv = import.meta.env,
): RoomMatchReadClient | null {
  const services = getFirebaseClientServices(env);

  if (services === null) {
    return null;
  }

  return createRoomMatchReadClient(
    createFirestoreDocumentSubscriber(services.firestore),
    createFirestoreCollectionSubscriber(services.firestore),
  );
}

function getReadErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to read room or match state.";
}
