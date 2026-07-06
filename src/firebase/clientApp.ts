import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase, type Database } from "firebase/database";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";

import {
  readFirebaseEmulatorConfig,
  readFirebaseWebConfig,
  type FirebaseEnv,
} from "@/firebase/config";

export type FirebaseClientServices = {
  app: FirebaseApp;
  auth: Auth;
  database: Database;
  firestore: Firestore;
  functions: Functions;
  storage: FirebaseStorage;
};

let emulatorConnectionsStarted = false;

function splitHostPort(hostWithPort: string) {
  const [host, port] = hostWithPort.split(":");

  return {
    host: host || "localhost",
    port: Number(port),
  };
}

export function getFirebaseClientApp(env: FirebaseEnv = import.meta.env): FirebaseApp | null {
  const config = readFirebaseWebConfig(env);

  if (!config) {
    return null;
  }

  return getApps().length > 0 ? getApp() : initializeApp(config);
}

export function getFirebaseClientServices(
  env: FirebaseEnv = import.meta.env,
): FirebaseClientServices | null {
  const app = getFirebaseClientApp(env);

  if (!app) {
    return null;
  }

  const services: FirebaseClientServices = {
    app,
    auth: getAuth(app),
    database: getDatabase(app),
    firestore: getFirestore(app),
    functions: getFunctions(app),
    storage: getStorage(app),
  };

  const emulatorConfig = readFirebaseEmulatorConfig(env);

  if (emulatorConfig.enabled && !emulatorConnectionsStarted) {
    const firestore = splitHostPort(emulatorConfig.firestoreHost);
    const functions = splitHostPort(emulatorConfig.functionsHost);
    const database = splitHostPort(emulatorConfig.databaseHost);
    const storage = splitHostPort(emulatorConfig.storageHost);

    connectAuthEmulator(services.auth, `http://${emulatorConfig.authHost}`, {
      disableWarnings: true,
    });
    connectFirestoreEmulator(services.firestore, firestore.host, firestore.port);
    connectFunctionsEmulator(services.functions, functions.host, functions.port);
    connectDatabaseEmulator(services.database, database.host, database.port);
    connectStorageEmulator(services.storage, storage.host, storage.port);
    emulatorConnectionsStarted = true;
  }

  return services;
}
