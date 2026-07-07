import {
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
  type Auth,
  type User,
} from "firebase/auth";

import { getFirebaseClientServices } from "@/firebase/clientApp";
import type { FirebaseEnv } from "@/firebase/config";

export type FirebaseIdentityUser = {
  displayName: string | null;
  email: string | null;
  isAnonymous: boolean;
  photoURL: string | null;
  uid: string;
};

export type FirebaseIdentityState =
  | {
      status: "ready";
      user: FirebaseIdentityUser | null;
    }
  | {
      message: string;
      status: "error";
    };

export type FirebaseIdentityListener = (state: FirebaseIdentityState) => void;
export type FirebaseIdentityReader = () => FirebaseIdentityUser | null;

export type AuthIdentityUserLike = {
  displayName: string | null;
  email: string | null;
  isAnonymous: boolean;
  photoURL: string | null;
  uid: string;
};

export type AuthIdentityAuth<TUser extends AuthIdentityUserLike> = {
  currentUser: TUser | null;
};

export type AuthIdentityDeps<TAuth, TUser extends AuthIdentityUserLike> = {
  onAuthStateChanged(
    auth: TAuth,
    next: (user: TUser | null) => void,
    error: (error: unknown) => void,
  ): () => void;
  signInAnonymously(auth: TAuth): Promise<{ user: TUser }>;
  signOut(auth: TAuth): Promise<void>;
};

export type FirebaseIdentityClient = {
  readCurrentUser: FirebaseIdentityReader;
  signInAsGuest(): Promise<FirebaseIdentityUser>;
  signOut(): Promise<void>;
  subscribe(listener: FirebaseIdentityListener): () => void;
};

const firebaseAuthIdentityDeps: AuthIdentityDeps<Auth, User> = {
  onAuthStateChanged: (auth, next, error) => onAuthStateChanged(auth, next, error),
  signInAnonymously,
  signOut: firebaseSignOut,
};

export function createFirebaseIdentityClient<
  TAuth extends AuthIdentityAuth<TUser>,
  TUser extends AuthIdentityUserLike,
>(auth: TAuth, deps: AuthIdentityDeps<TAuth, TUser>): FirebaseIdentityClient {
  return {
    readCurrentUser: () => readFirebaseIdentityFromAuth(auth),
    signInAsGuest: async () => {
      const result = await deps.signInAnonymously(auth);

      return mapFirebaseIdentityUser(result.user);
    },
    signOut: () => deps.signOut(auth),
    subscribe: (listener) =>
      deps.onAuthStateChanged(
        auth,
        (user) => {
          listener({
            status: "ready",
            user: user === null ? null : mapFirebaseIdentityUser(user),
          });
        },
        (error) => {
          listener({
            message: getAuthErrorMessage(error),
            status: "error",
          });
        },
      ),
  };
}

export function getFirebaseIdentityClient(
  env: FirebaseEnv = import.meta.env,
): FirebaseIdentityClient | null {
  const services = getFirebaseClientServices(env);

  if (services === null) {
    return null;
  }

  return createFirebaseIdentityClient(services.auth, firebaseAuthIdentityDeps);
}

export function readFirebaseIdentityFromAuth<TUser extends AuthIdentityUserLike>(
  auth: AuthIdentityAuth<TUser>,
): FirebaseIdentityUser | null {
  return auth.currentUser === null ? null : mapFirebaseIdentityUser(auth.currentUser);
}

export function mapFirebaseIdentityUser(user: AuthIdentityUserLike): FirebaseIdentityUser {
  return {
    displayName: user.displayName,
    email: user.email,
    isAnonymous: user.isAnonymous,
    photoURL: user.photoURL,
    uid: user.uid,
  };
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Firebase Auth state is unavailable.";
}
