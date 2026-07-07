import { describe, expect, it } from "vitest";

import { runAuthenticatedRoomMatchSmokeFlow } from "./authenticatedRoomMatchSmokeFlow";
import { createAuthenticatedRoomMatchEmulatorHarness } from "./authenticatedRoomMatchEmulatorClients";

const hasRequiredEmulators =
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined &&
  process.env.FIRESTORE_EMULATOR_HOST !== undefined;

const describeWithEmulators = hasRequiredEmulators ? describe : describe.skip;

describeWithEmulators("authenticated room/match emulator smoke flow", () => {
  it("uses Auth and Firestore emulators to create, join, start, and submit one move", async () => {
    const harness = createAuthenticatedRoomMatchEmulatorHarness({
      projectId: "vboard-arena-local",
    });

    try {
      const result = await runAuthenticatedRoomMatchSmokeFlow(harness.clients);

      expect(result.host.uid).not.toEqual(result.guest.uid);
      expect(result.createdRoom.status).toBe("open");
      expect(result.joinedRoom.status).toBe("full");
      expect(result.startedMatch.status).toBe("active");
      expect(result.submittedMove.stateVersion).toBe(1);
      expect(result.room.status).toBe("in-match");
      expect(result.room.matchId).toBe(result.startedMatch.matchId);
      expect(result.match.status).toBe("active");
      expect(result.match.stateVersion).toBe(1);
      expect(result.moves).toEqual([
        expect.objectContaining({
          actorUid: result.host.uid,
          matchId: result.startedMatch.matchId,
          payload: { column: 3 },
          sequence: 1,
        }),
      ]);
    } finally {
      await harness.cleanup();
    }
  });
});
