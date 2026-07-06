import { getApps, initializeApp, type App } from "firebase-admin/app";

export function getFirebaseAdminApp(): App {
  return getApps()[0] ?? initializeApp();
}
