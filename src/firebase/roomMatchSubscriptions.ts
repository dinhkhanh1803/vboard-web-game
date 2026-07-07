import { doc, onSnapshot, type Firestore } from "firebase/firestore";

import {
  matchCollectionPath,
  roomCollectionPath,
  type MatchDocument,
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

export type RoomReadState = RoomMatchReadState<RoomDocument>;
export type MatchReadState = RoomMatchReadState<MatchDocument>;
export type RoomMatchReadListener<TDocument> = (state: RoomMatchReadState<TDocument>) => void;
export type RoomMatchUnsubscribe = () => void;

export type ReadonlyDocumentSubscriber = <TDocument>(
  collectionPath: string,
  documentId: string,
  listener: RoomMatchReadListener<TDocument>,
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
};

export function createRoomMatchReadClient(
  subscribeDocument: ReadonlyDocumentSubscriber,
): RoomMatchReadClient {
  return {
    subscribeToRoom: (roomId, listener) =>
      subscribeDocument<RoomDocument>(roomCollectionPath, roomId, listener),
    subscribeToMatch: (matchId, listener) =>
      subscribeDocument<MatchDocument>(matchCollectionPath, matchId, listener),
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

export function getRoomMatchReadClient(
  env: FirebaseEnv = import.meta.env,
): RoomMatchReadClient | null {
  const services = getFirebaseClientServices(env);

  if (services === null) {
    return null;
  }

  return createRoomMatchReadClient(createFirestoreDocumentSubscriber(services.firestore));
}

function getReadErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to read room or match state.";
}
