# Firebase Admin Integrations

This folder owns server-side Firebase Admin initialization for Cloud Functions.

Use `getFirebaseAdminApp()` instead of calling `initializeApp()` in callable handlers directly. This keeps backend Firebase setup in one place and makes future emulator/test wiring easier to control.
