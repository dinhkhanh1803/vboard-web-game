import { describe, expect, it } from "vitest";

import { appRoutes, getRouteById, mainNavigationRoutes } from "@/routes/routeConfig";

describe("routeConfig", () => {
  it("defines the MVP route stubs in a stable order", () => {
    expect(appRoutes.map((route) => route.path)).toEqual([
      "/",
      "/games",
      "/lobby",
      "/rooms/:roomId",
      "/matches/:matchId",
      "/profile/:userId?",
      "/leaderboard",
      "/admin",
      "/privacy-policy",
      "/terms",
      "/contact",
    ]);
  });

  it("exposes navigation routes for the development shell", () => {
    expect(mainNavigationRoutes.map((route) => route.id)).toEqual([
      "home",
      "games",
      "lobby",
      "leaderboard",
      "profile",
      "admin",
    ]);
  });

  it("can look up route metadata by id", () => {
    expect(getRouteById("match")?.path).toBe("/matches/:matchId");
    expect(getRouteById("missing")).toBeUndefined();
  });
});
