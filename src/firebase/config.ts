import type { FirebaseOptions } from "firebase/app";

export type FirebaseEnv = Record<string, string | boolean | undefined>;

export type FirebaseEmulatorConfig = {
  enabled: boolean;
  authHost: string;
  firestoreHost: string;
  functionsHost: string;
  databaseHost: string;
  storageHost: string;
};

const requiredWebConfigKeys = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
] as const;

function readString(env: FirebaseEnv, key: string) {
  const value = env[key];

  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(env: FirebaseEnv, key: string) {
  const value = env[key];

  return value === true || value === "true";
}

export function readFirebaseWebConfig(env: FirebaseEnv): FirebaseOptions | null {
  const hasAllRequiredValues = requiredWebConfigKeys.every(
    (key) => readString(env, key).length > 0,
  );

  if (!hasAllRequiredValues) {
    return null;
  }

  const measurementId = readString(env, "VITE_FIREBASE_MEASUREMENT_ID");

  return {
    apiKey: readString(env, "VITE_FIREBASE_API_KEY"),
    authDomain: readString(env, "VITE_FIREBASE_AUTH_DOMAIN"),
    projectId: readString(env, "VITE_FIREBASE_PROJECT_ID"),
    storageBucket: readString(env, "VITE_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readString(env, "VITE_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readString(env, "VITE_FIREBASE_APP_ID"),
    ...(measurementId ? { measurementId } : {}),
  };
}

export function readFirebaseEmulatorConfig(env: FirebaseEnv): FirebaseEmulatorConfig {
  return {
    enabled: readBoolean(env, "VITE_USE_FIREBASE_EMULATORS"),
    authHost: readString(env, "VITE_AUTH_EMULATOR_HOST") || "localhost:9099",
    firestoreHost: readString(env, "VITE_FIRESTORE_EMULATOR_HOST") || "localhost:8080",
    functionsHost: readString(env, "VITE_FUNCTIONS_EMULATOR_HOST") || "localhost:5001",
    databaseHost: readString(env, "VITE_DATABASE_EMULATOR_HOST") || "localhost:9000",
    storageHost: readString(env, "VITE_STORAGE_EMULATOR_HOST") || "localhost:9199",
  };
}
