import { describe, expect, it } from "vitest";

import { createRealtimeTwoClientRoomMatchHarness } from "./realtimeTwoClientRoomMatchHarness";

const hasRequiredEmulators =
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined &&
  process.env.FIRESTORE_EMULATOR_HOST !== undefined;

const describeWithEmulators = hasRequiredEmulators ? describe : describe.skip;

describeWithEmulators("realtime two-client room/match smoke flow", () => {
  it("lets both signed-in clients observe official match and move-log updates", async () => {
    const harness = await createRealtimeTwoClientRoomMatchHarness({
      projectId: "vboard-arena-local",
    });

    try {
      const createdRoom = await harness.host.intentClient.createRoom({ gameId: "connect-4" });
      const joinedRoom = await harness.guest.intentClient.joinRoom({
        roomId: createdRoom.roomId,
      });
      const startedMatch = await harness.host.intentClient.startMatch({
        roomId: createdRoom.roomId,
      });

      const hostMatchAfterMove = harness.host.waitForMatchState(
        startedMatch.matchId,
        (match) => match.stateVersion === 1,
      );
      const guestMatchAfterMove = harness.guest.waitForMatchState(
        startedMatch.matchId,
        (match) => match.stateVersion === 1,
      );
      const hostMovesAfterMove = harness.host.waitForMoveLog(
        startedMatch.matchId,
        (moves) => moves.length === 1,
      );
      const guestMovesAfterMove = harness.guest.waitForMoveLog(
        startedMatch.matchId,
        (moves) => moves.length === 1,
      );

      const submittedMove = await harness.host.intentClient.submitMove({
        matchId: startedMatch.matchId,
        payload: { column: 3 },
      });

      const [hostMatch, guestMatch, hostMoves, guestMoves] = await Promise.all([
        hostMatchAfterMove,
        guestMatchAfterMove,
        hostMovesAfterMove,
        guestMovesAfterMove,
      ]);

      expect(harness.host.identity.uid).not.toEqual(harness.guest.identity.uid);
      expect(createdRoom.status).toBe("open");
      expect(joinedRoom.status).toBe("full");
      expect(startedMatch.status).toBe("active");
      expect(submittedMove.stateVersion).toBe(1);
      expect(hostMatch.stateVersion).toBe(1);
      expect(guestMatch.stateVersion).toBe(1);
      expect(hostMoves).toEqual([
        expect.objectContaining({
          actorUid: harness.host.identity.uid,
          matchId: startedMatch.matchId,
          payload: { column: 3 },
          sequence: 1,
        }),
      ]);
      expect(guestMoves).toEqual(hostMoves);
    } finally {
      await harness.cleanup();
    }
  }, 20_000);
});
