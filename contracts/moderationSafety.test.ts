import { describe, expect, it } from "vitest";

import { gameCatalogEntries } from "./gameCatalog";
import {
  createGameFeatureFlagPreview,
  createGameFeatureFlagPreviews,
  createModerationReport,
  moderationCollectionPaths,
  moderationReportReasons,
} from "./moderationSafety";

describe("moderation and safety contracts", () => {
  it("pins collection paths for reports and app config", () => {
    expect(moderationCollectionPaths).toEqual({
      appConfig: "appConfig",
      reports: "reports",
    });
  });

  it("creates a normalized user report for the moderation queue", () => {
    const report = createModerationReport({
      details: "  Suspicious perfect moves in the endgame.  ",
      nowMs: 1_700_000_000_000,
      reason: moderationReportReasons[1],
      reportedDisplayName: "Arena Bot",
      reportedUid: "uid_reported",
      reporterUid: "uid_reporter",
      sourceMatchId: "match_123",
      sourceRoomId: null,
    });

    expect(report).toEqual({
      createdAtMs: 1_700_000_000_000,
      details: "Suspicious perfect moves in the endgame.",
      id: "report_uid_reported_uid_reporter_1700000000000",
      reason: "cheating",
      reportedDisplayName: "Arena Bot",
      reportedUid: "uid_reported",
      reporterUid: "uid_reporter",
      sourceMatchId: "match_123",
      sourceRoomId: null,
      status: "open",
      updatedAtMs: 1_700_000_000_000,
    });
  });

  it("caps report details for compact moderation documents", () => {
    const report = createModerationReport({
      details: "x".repeat(560),
      nowMs: 1_700_000_000_001,
      reason: "harassment",
      reportedDisplayName: "Guest Pilot",
      reportedUid: "uid_guest",
      reporterUid: "uid_owner",
    });

    expect(report.details).toHaveLength(500);
  });

  it("creates game feature flag previews from catalog availability", () => {
    const connect4Flag = createGameFeatureFlagPreview({
      game: gameCatalogEntries["connect-4"],
      nowMs: 1_700_000_000_010,
    });
    const caroFlag = createGameFeatureFlagPreview({
      game: gameCatalogEntries.caro,
      nowMs: 1_700_000_000_010,
    });

    expect(connect4Flag).toMatchObject({
      displayName: "Connect 4",
      gameId: "connect-4",
      id: "game_connect-4",
      maintenanceMode: false,
      matchmakingEnabled: true,
      publicCatalogVisible: true,
      status: "available",
    });
    expect(caroFlag).toMatchObject({
      displayName: "Caro",
      gameId: "caro",
      id: "game_caro",
      maintenanceMode: false,
      matchmakingEnabled: false,
      publicCatalogVisible: true,
      status: "coming-soon",
    });
  });

  it("creates one feature flag preview per supported game", () => {
    expect(createGameFeatureFlagPreviews({ nowMs: 1_700_000_000_020 })).toHaveLength(2);
  });
});
