import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  createFirebaseIdentityClient,
  getFirebaseIdentityClient,
  type AuthIdentityDeps,
} from "@/firebase/authIdentity";

type TestAuth = {
  currentUser: TestUser | null;
};

type TestUser = {
  displayName: string | null;
  email: string | null;
  isAnonymous: boolean;
  photoURL: string | null;
  uid: string;
};

function createTestDeps() {
  let authStateListener: ((user: TestUser | null) => void) | null = null;
  let authErrorListener: ((error: unknown) => void) | null = null;
  const unsubscribe = vi.fn();
  const deps: AuthIdentityDeps<TestAuth, TestUser> = {
    onAuthStateChanged: (auth, next, error) => {
      expect(auth).toBe(testAuth);
      authStateListener = next;
      authErrorListener = error;

      return unsubscribe;
    },
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
  };
  const testAuth: TestAuth = { currentUser: null };

  return {
    deps,
    emitAuthError: (error: unknown) => authErrorListener?.(error),
    emitAuthState: (user: TestUser | null) => authStateListener?.(user),
    testAuth,
    unsubscribe,
  };
}

describe("Firebase Auth identity boundary", () => {
  it("subscribes to Firebase auth state and maps users into a minimal identity snapshot", () => {
    const { deps, emitAuthError, emitAuthState, testAuth, unsubscribe } = createTestDeps();
    const listener = vi.fn();
    const client = createFirebaseIdentityClient(testAuth, deps);

    const dispose = client.subscribe(listener);

    emitAuthState(null);
    expect(listener).toHaveBeenLastCalledWith({ status: "ready", user: null });

    emitAuthState({
      displayName: "Guest Pilot",
      email: null,
      isAnonymous: true,
      photoURL: null,
      uid: "guest-1",
    });
    expect(listener).toHaveBeenLastCalledWith({
      status: "ready",
      user: {
        displayName: "Guest Pilot",
        email: null,
        isAnonymous: true,
        photoURL: null,
        uid: "guest-1",
      },
    });

    emitAuthError(new Error("Auth emulator offline."));
    expect(listener).toHaveBeenLastCalledWith({
      message: "Auth emulator offline.",
      status: "error",
    });

    dispose();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("signs in as a guest through Firebase anonymous auth", async () => {
    const { deps, testAuth } = createTestDeps();
    vi.mocked(deps.signInAnonymously).mockResolvedValue({
      user: {
        displayName: null,
        email: null,
        isAnonymous: true,
        photoURL: null,
        uid: "guest-2",
      },
    });

    const client = createFirebaseIdentityClient(testAuth, deps);

    await expect(client.signInAsGuest()).resolves.toEqual({
      displayName: null,
      email: null,
      isAnonymous: true,
      photoURL: null,
      uid: "guest-2",
    });
    expect(deps.signInAnonymously).toHaveBeenCalledWith(testAuth);
  });

  it("signs out through the auth boundary", async () => {
    const { deps, testAuth } = createTestDeps();
    const client = createFirebaseIdentityClient(testAuth, deps);

    await client.signOut();

    expect(deps.signOut).toHaveBeenCalledWith(testAuth);
  });

  it("returns null when Firebase browser config is not available", () => {
    expect(getFirebaseIdentityClient({})).toBeNull();
  });

  it("keeps the identity boundary away from Firestore write APIs", () => {
    const source = readFileSync(join(process.cwd(), "src/firebase/authIdentity.ts"), "utf8");

    expect(source).not.toContain("firebase/firestore");
    expect(source).not.toMatch(/\b(setDoc|addDoc|updateDoc|deleteDoc|writeBatch|runTransaction)\b/);
  });
});
