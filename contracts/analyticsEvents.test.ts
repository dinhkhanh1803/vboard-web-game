import { describe, expect, it } from "vitest";

import {
  analyticsEventCategories,
  analyticsEventNames,
  analyticsEvents,
  createAnalyticsEvent,
} from "./analyticsEvents";

describe("analytics event contract constants", () => {
  it("pins the first stable product event names and categories", () => {
    expect(analyticsEventCategories).toEqual([
      "navigation",
      "auth",
      "profile",
      "game_catalog",
      "lobby",
      "room",
      "match",
    ]);

    expect(analyticsEventNames).toEqual([
      "app_route_viewed",
      "auth_entry_viewed",
      "auth_provider_selected",
      "profile_viewed",
      "game_catalog_viewed",
      "game_selected",
      "lobby_viewed",
      "quick_match_clicked",
      "room_created",
      "room_joined",
      "room_ready_changed",
      "match_viewed",
      "match_started",
      "match_move_submitted",
      "match_completed",
    ]);
  });

  it("maps each event name to one category and description", () => {
    expect(Object.keys(analyticsEvents)).toEqual(analyticsEventNames);
    expect(analyticsEvents.game_selected).toEqual({
      name: "game_selected",
      category: "game_catalog",
      description: "A player selected a game from catalog or lobby UI.",
    });
    expect(analyticsEvents.match_move_submitted.category).toBe("match");
  });
});

describe("createAnalyticsEvent", () => {
  it("creates a route event with stable envelope fields", () => {
    expect(
      createAnalyticsEvent({
        name: "app_route_viewed",
        payload: {
          routeId: "lobby",
          path: "/lobby",
        },
        createdAtMs: 1000,
      }),
    ).toEqual({
      name: "app_route_viewed",
      category: "navigation",
      payload: {
        routeId: "lobby",
        path: "/lobby",
      },
      createdAtMs: 1000,
    });
  });

  it("creates typed game and match payloads without wiring analytics SDK calls", () => {
    expect(
      createAnalyticsEvent({
        name: "game_selected",
        payload: {
          gameId: "connect-4",
          source: "catalog",
        },
        createdAtMs: 2000,
      }),
    ).toMatchObject({
      name: "game_selected",
      category: "game_catalog",
      payload: {
        gameId: "connect-4",
        source: "catalog",
      },
    });

    expect(
      createAnalyticsEvent({
        name: "match_completed",
        payload: {
          matchId: "match-1",
          roomId: "room-1",
          gameId: "connect-4",
          status: "completed",
          reason: "win",
          winnerUid: "user-1",
          durationMs: 120000,
          moveCount: 17,
        },
        createdAtMs: 3000,
      }),
    ).toMatchObject({
      name: "match_completed",
      category: "match",
      payload: {
        reason: "win",
        moveCount: 17,
      },
    });
  });
});
