import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createRoomMatchReadClient,
  getRoomMatchReadClient,
  type ReadonlyDocumentSubscriber,
} from "@/firebase/roomMatchSubscriptions";

describe("room/match read-only subscription boundary", () => {
  it("subscribes to room, match, and ordered move-log reads through collection constants", () => {
    const documentCalls: Array<{ collectionPath: string; documentId: string }> = [];
    const collectionCalls: Array<{ collectionPath: string; orderByField: string }> = [];
    const unsubscribe = () => undefined;
    const subscribeDocument: ReadonlyDocumentSubscriber = (collectionPath, documentId) => {
      documentCalls.push({ collectionPath, documentId });

      return unsubscribe;
    };
    const subscribeCollection = (collectionPath: string, orderByField: string) => {
      collectionCalls.push({ collectionPath, orderByField });

      return unsubscribe;
    };
    const client = createRoomMatchReadClient(subscribeDocument, subscribeCollection);
    const moveLogClient = client as typeof client & {
      subscribeToMatchMoves(matchId: string, listener: (state: unknown) => void): () => void;
    };

    expect(client.subscribeToRoom("room-1", () => undefined)).toBe(unsubscribe);
    expect(client.subscribeToMatch("match-1", () => undefined)).toBe(unsubscribe);
    expect(moveLogClient.subscribeToMatchMoves("match-1", () => undefined)).toBe(unsubscribe);
    expect(documentCalls).toEqual([
      { collectionPath: "rooms", documentId: "room-1" },
      { collectionPath: "matches", documentId: "match-1" },
    ]);
    expect(collectionCalls).toEqual([
      { collectionPath: "matches/match-1/moves", orderByField: "sequence" },
    ]);
  });

  it("returns null when Firebase browser config is not available", () => {
    expect(getRoomMatchReadClient({})).toBeNull();
  });

  it("does not import Firestore write APIs in the read boundary", () => {
    const source = readFileSync(
      join(process.cwd(), "src/firebase/roomMatchSubscriptions.ts"),
      "utf8",
    );

    expect(source).toContain("firebase/firestore");
    expect(source).toContain("onSnapshot");
    expect(source).toContain("orderBy");
    expect(source).not.toMatch(/\b(setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction)\b/);
  });
});
