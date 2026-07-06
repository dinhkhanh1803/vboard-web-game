import { describe, expect, it } from "vitest";

import {
  gameCatalogCollectionPath,
  gameCatalogEntries,
  gameIds,
  gameStatuses,
  getGameCatalogEntry,
} from "./gameCatalog";

describe("game catalog contract constants", () => {
  it("pins the Firestore collection and MVP game ids", () => {
    expect(gameCatalogCollectionPath).toBe("games");
    expect(gameIds).toEqual(["connect-4", "caro"]);
    expect(gameStatuses).toEqual(["available", "coming-soon", "disabled"]);
  });

  it("keeps one catalog entry for every MVP game", () => {
    expect(Object.keys(gameCatalogEntries)).toEqual(gameIds);
  });
});

describe("gameCatalogEntries", () => {
  it("defines Connect 4 as the first available PixiJS game", () => {
    expect(gameCatalogEntries["connect-4"]).toEqual({
      id: "connect-4",
      displayName: "Connect 4",
      shortName: "Connect 4",
      summary: "Drop discs into a seven-column board and connect four before your opponent.",
      status: "available",
      enabled: true,
      minPlayers: 2,
      maxPlayers: 2,
      estimatedRoundMinutes: 10,
      renderer: "pixi",
      rulesEngineKey: "connect4",
      rulesRoute: "/games/connect-4/how-to-play",
      lobbyRoute: "/lobby?game=connect-4",
      matchRoutePattern: "/matches/:matchId",
    });
  });

  it("keeps Caro represented but not enabled before its rules phase", () => {
    expect(gameCatalogEntries.caro.status).toBe("coming-soon");
    expect(gameCatalogEntries.caro.enabled).toBe(false);
    expect(gameCatalogEntries.caro.rulesEngineKey).toBe("caro");
  });
});

describe("getGameCatalogEntry", () => {
  it("returns the requested game metadata", () => {
    expect(getGameCatalogEntry("connect-4")?.displayName).toBe("Connect 4");
    expect(getGameCatalogEntry("caro")?.displayName).toBe("Caro");
  });
});
