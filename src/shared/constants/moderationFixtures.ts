import {
  createGameFeatureFlagPreviews,
  createModerationReport,
  moderationCollectionPaths,
  type GameFeatureFlagPreview,
  type ModerationReport,
} from "@contracts/moderationSafety";

export const moderationPreviewNowMs = 1_700_000_000_000;

export const demoModerationReports: ModerationReport[] = [
  createModerationReport({
    details: "Suspicious perfect moves in the endgame.",
    nowMs: moderationPreviewNowMs,
    reason: "cheating",
    reportedDisplayName: "Arena Bot",
    reportedUid: "uid_arena_bot",
    reporterUid: "uid_khanh",
    sourceMatchId: "match_connect4_demo",
  }),
];

export const demoGameFeatureFlags: GameFeatureFlagPreview[] = createGameFeatureFlagPreviews({
  nowMs: moderationPreviewNowMs,
});

export function formatFeatureFlagMatchmaking(flag: GameFeatureFlagPreview) {
  return flag.matchmakingEnabled ? "Matchmaking enabled" : "Matchmaking disabled";
}

export function formatFeatureFlagVisibility(flag: GameFeatureFlagPreview) {
  return flag.publicCatalogVisible ? "Visible in catalog" : "Hidden from catalog";
}

export function getReportCollectionLabel() {
  return `${moderationCollectionPaths.reports}/{reportId}`;
}
