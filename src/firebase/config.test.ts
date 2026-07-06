import { describe, expect, it } from "vitest";

import { readFirebaseEmulatorConfig, readFirebaseWebConfig } from "@/firebase/config";

describe("Firebase web config", () => {
  it("returns null when required Firebase browser config is missing", () => {
    expect(readFirebaseWebConfig({})).toBeNull();
  });

  it("maps Vite Firebase env keys into FirebaseOptions", () => {
    expect(
      readFirebaseWebConfig({
        VITE_FIREBASE_API_KEY: "demo-api-key",
        VITE_FIREBASE_AUTH_DOMAIN: "demo.firebaseapp.com",
        VITE_FIREBASE_PROJECT_ID: "demo-project",
        VITE_FIREBASE_STORAGE_BUCKET: "demo.appspot.com",
        VITE_FIREBASE_MESSAGING_SENDER_ID: "123456",
        VITE_FIREBASE_APP_ID: "1:123456:web:abcdef",
        VITE_FIREBASE_MEASUREMENT_ID: "G-DEMO",
      }),
    ).toEqual({
      apiKey: "demo-api-key",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo.appspot.com",
      messagingSenderId: "123456",
      appId: "1:123456:web:abcdef",
      measurementId: "G-DEMO",
    });
  });
});

describe("Firebase emulator config", () => {
  it("keeps emulators disabled by default", () => {
    expect(readFirebaseEmulatorConfig({}).enabled).toBe(false);
  });

  it("reads local emulator hosts from Vite env keys", () => {
    expect(
      readFirebaseEmulatorConfig({
        VITE_USE_FIREBASE_EMULATORS: "true",
        VITE_AUTH_EMULATOR_HOST: "localhost:9099",
        VITE_FIRESTORE_EMULATOR_HOST: "localhost:8080",
        VITE_FUNCTIONS_EMULATOR_HOST: "localhost:5001",
        VITE_DATABASE_EMULATOR_HOST: "localhost:9000",
        VITE_STORAGE_EMULATOR_HOST: "localhost:9199",
      }),
    ).toEqual({
      enabled: true,
      authHost: "localhost:9099",
      firestoreHost: "localhost:8080",
      functionsHost: "localhost:5001",
      databaseHost: "localhost:9000",
      storageHost: "localhost:9199",
    });
  });
});
