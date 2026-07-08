import { describe, expect, it } from "vitest";

import {
  createRealtimeTwoClientRoomMatchHarness,
  playConnect4Columns,
} from "./realtimeTwoClientRoomMatchHarness";

const hasRequiredEmulators =
  process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined &&
  process.env.FIRESTORE_EMULATOR_HOST !== undefined;

const describeWithEmulators = hasRequiredEmulators ? describe : describe.skip;
const hostWinningColumns = [0, 0, 1, 1, 2, 2, 3] as const;

describeWithEmulators("realtime completed Connect 4 smoke flow", () => {
  it("lets both signed-in clients observe the official completed match result", async () => {
    const harness = await createRealtimeTwoClientRoomMatchHarness({
      projectId: "vboard-arena-local",
    });

    try {
      const createdRoom = await harness.host.intentClient.createRoom({ gameId: "connect-4" });
      await harness.guest.intentClient.joinRoom({
        roomId: createdRoom.roomId,
      });
      const startedMatch = await harness.host.intentClient.startMatch({
        roomId: createdRoom.roomId,
      });

      const hostCompletedMatch = harness.host.waitForMatchState(
        startedMatch.matchId,
        (match) => match.status === "completed" && match.stateVersion === hostWinningColumns.length,
      );
      const guestCompletedMatch = harness.guest.waitForMatchState(
        startedMatch.matchId,
        (match) => match.status === "completed" && match.stateVersion === hostWinningColumns.length,
      );
      const hostFinalMoveLog = harness.host.waitForMoveLog(
        startedMatch.matchId,
        (moves) => moves.length === hostWinningColumns.length,
      );
      const guestFinalMoveLog = harness.guest.waitForMoveLog(
        startedMatch.matchId,
        (moves) => moves.length === hostWinningColumns.length,
      );

      const submittedMoves = await playConnect4Columns({
        columns: hostWinningColumns,
        harness,
        matchId: startedMatch.matchId,
      });

      const [hostMatch, guestMatch, hostMoves, guestMoves] = await Promise.all([
        hostCompletedMatch,
        guestCompletedMatch,
        hostFinalMoveLog,
        guestFinalMoveLog,
      ]);

      expect(submittedMoves.at(-1)).toEqual(
        expect.objectContaining({
          matchId: startedMatch.matchId,
          stateVersion: hostWinningColumns.length,
          status: "completed",
        }),
      );
      expect(hostMatch.result).toEqual({
        completedAtMs: expect.any(Number),
        reason: "win",
        winnerSeatIndex: 0,
        winnerUid: harness.host.identity.uid,
      });
      expect(guestMatch.result).toEqual(hostMatch.result);
      expect(hostMatch.completedAtMs).toEqual(hostMatch.result.completedAtMs);
      expect(hostMatch.turn.activeSeatIndex).toBeNull();
      expect(guestMatch.turn.activeSeatIndex).toBeNull();
      expect(hostMoves.map((move) => move.sequence)).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(hostMoves.at(-1)).toEqual(
        expect.objectContaining({
          actorSeatIndex: 0,
          actorUid: harness.host.identity.uid,
          matchId: startedMatch.matchId,
          payload: { column: 3 },
          stateVersionAfter: hostWinningColumns.length,
        }),
      );
      expect(guestMoves).toEqual(hostMoves);
    } finally {
      await harness.cleanup();
    }
  }, 30_000);
});
