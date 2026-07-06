export const gameCatalogCollectionPath = "games";

export const gameIds = ["connect-4", "caro"] as const;
export type GameId = (typeof gameIds)[number];

export const gameStatuses = ["available", "coming-soon", "disabled"] as const;
export type GameStatus = (typeof gameStatuses)[number];

export const gameRenderers = ["pixi"] as const;
export type GameRenderer = (typeof gameRenderers)[number];

export type GameCatalogEntry = {
  id: GameId;
  displayName: string;
  shortName: string;
  summary: string;
  status: GameStatus;
  enabled: boolean;
  minPlayers: number;
  maxPlayers: number;
  estimatedRoundMinutes: number;
  renderer: GameRenderer;
  rulesEngineKey: string;
  rulesRoute: string;
  lobbyRoute: string;
  matchRoutePattern: string;
};

export const gameCatalogEntries: Record<GameId, GameCatalogEntry> = {
  "connect-4": {
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
  },
  caro: {
    id: "caro",
    displayName: "Caro",
    shortName: "Caro",
    summary: "Five-in-row tactical board game prepared for the shared match shell.",
    status: "coming-soon",
    enabled: false,
    minPlayers: 2,
    maxPlayers: 2,
    estimatedRoundMinutes: 15,
    renderer: "pixi",
    rulesEngineKey: "caro",
    rulesRoute: "/games/caro/rules",
    lobbyRoute: "/lobby?game=caro",
    matchRoutePattern: "/matches/:matchId",
  },
};

export function getGameCatalogEntry(gameId: GameId): GameCatalogEntry | undefined {
  return gameCatalogEntries[gameId];
}
