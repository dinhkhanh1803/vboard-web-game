// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";
import { deleteApp, getApps } from "firebase-admin/app";

import { getFirebaseAdminApp } from "../src/integrations/firebaseAdmin";

afterEach(async () => {
  await Promise.all(getApps().map((app) => deleteApp(app)));
});

describe("Firebase Admin boundary", () => {
  it("initializes Firebase Admin once and reuses the same app", () => {
    const first = getFirebaseAdminApp();
    const second = getFirebaseAdminApp();

    expect(first).toBe(second);
    expect(getApps()).toHaveLength(1);
  });
});
