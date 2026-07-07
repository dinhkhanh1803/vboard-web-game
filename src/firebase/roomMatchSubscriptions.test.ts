import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createRoomMatchReadClient,
  getRoomMatchReadClient,
  type ReadonlyDocumentSubscriber,
} from "@/firebase/roomMatchSubscriptions";

describe("room/match read-only subscription boundary", () => {
  it("subscribes to room and match documents through collection constants", () => {
    const calls: Array<{ collectionPath: string; documentId: string }> = [];
    const unsubscribe = () => undefined;
    const subscribeDocument: ReadonlyDocumentSubscriber = (collectionPath, documentId) => {
      calls.push({ collectionPath, documentId });

      return unsubscribe;
    };
    const client = createRoomMatchReadClient(subscribeDocument);

    expect(client.subscribeToRoom("room-1", () => undefined)).toBe(unsubscribe);
    expect(client.subscribeToMatch("match-1", () => undefined)).toBe(unsubscribe);
    expect(calls).toEqual([
      { collectionPath: "rooms", documentId: "room-1" },
      { collectionPath: "matches", documentId: "match-1" },
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
    expect(source).not.toMatch(/\b(setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction)\b/);
  });
});
