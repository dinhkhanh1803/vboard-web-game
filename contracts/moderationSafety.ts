import {
  gameCatalogEntries,
  gameIds,
  type GameCatalogEntry,
  type GameId,
  type GameStatus,
} from "./gameCatalog";
import type { UserRole } from "./userProfile";

export const moderationCollectionPaths = {
  appConfig: "appConfig",
  reports: "reports",
} as const;

export const moderationReportReasons = [
  "harassment",
  "cheating",
  "spam",
  "inappropriate-name",
  "other",
] as const;
export type ModerationReportReason = (typeof moderationReportReasons)[number];

export const moderationReportStatuses = ["open", "reviewing", "actioned", "dismissed"] as const;
export type ModerationReportStatus = (typeof moderationReportStatuses)[number];

export type ModerationReport = {
  id: string;
  reporterUid: string;
  reportedUid: string;
  reportedDisplayName: string;
  reason: ModerationReportReason;
  details: string;
  sourceMatchId: string | null;
  sourceRoomId: string | null;
  status: ModerationReportStatus;
  createdAtMs: number;
  updatedAtMs: number;
};

export type CreateModerationReportInput = {
  reporterUid: string;
  reportedUid: string;
  reportedDisplayName: string;
  reason: ModerationReportReason;
  details?: string | null;
  sourceMatchId?: string | null;
  sourceRoomId?: string | null;
  nowMs: number;
};

export type GameFeatureFlagPreview = {
  id: string;
  gameId: GameId;
  displayName: string;
  status: GameStatus;
  publicCatalogVisible: boolean;
  matchmakingEnabled: boolean;
  maintenanceMode: boolean;
  updatedAtMs: number;
};

export type CreateGameFeatureFlagPreviewInput = {
  game: GameCatalogEntry;
  nowMs: number;
};

const maxReportDetailsLength = 500;

export function normalizeReportDetails(details: string | null | undefined) {
  const normalized = details?.trim().replace(/\s+/g, " ") ?? "";

  return normalized.slice(0, maxReportDetailsLength).trimEnd();
}

export function createModerationReport(input: CreateModerationReportInput): ModerationReport {
  return {
    id: `report_${input.reportedUid}_${input.reporterUid}_${input.nowMs}`,
    reporterUid: input.reporterUid,
    reportedUid: input.reportedUid,
    reportedDisplayName: input.reportedDisplayName,
    reason: input.reason,
    details: normalizeReportDetails(input.details),
    sourceMatchId: input.sourceMatchId ?? null,
    sourceRoomId: input.sourceRoomId ?? null,
    status: "open",
    createdAtMs: input.nowMs,
    updatedAtMs: input.nowMs,
  };
}

export function canAccessAdminPreview(role: UserRole) {
  return role === "admin";
}

export function createGameFeatureFlagPreview(
  input: CreateGameFeatureFlagPreviewInput,
): GameFeatureFlagPreview {
  const publicCatalogVisible = input.game.status !== "disabled";

  return {
    id: `game_${input.game.id}`,
    gameId: input.game.id,
    displayName: input.game.displayName,
    status: input.game.status,
    publicCatalogVisible,
    matchmakingEnabled: input.game.enabled && input.game.status === "available",
    maintenanceMode: false,
    updatedAtMs: input.nowMs,
  };
}

export function createGameFeatureFlagPreviews({ nowMs }: { nowMs: number }) {
  return gameIds.map((gameId) =>
    createGameFeatureFlagPreview({ game: gameCatalogEntries[gameId], nowMs }),
  );
}
