import { gameCatalogEntries, type GameId } from "@contracts/gameCatalog";

export type StaticGame = {
  id: GameId;
  name: string;
  status: string;
  players: string;
  roundTime: string;
  summary: string;
};

export type PublicRoom = {
  code: string;
  game: string;
  host: string;
  seats: string;
  status: string;
};

export type LeaderboardPlayer = {
  rank: number;
  name: string;
  game: string;
  elo: number;
  record: string;
};

const connect4 = gameCatalogEntries["connect-4"];
const caro = gameCatalogEntries.caro;

export const staticGames: StaticGame[] = [
  {
    id: connect4.id,
    name: connect4.displayName,
    status: "UI ready, rules next",
    players: `${connect4.minPlayers} players`,
    roundTime: `${connect4.estimatedRoundMinutes} min match`,
    summary: connect4.summary,
  },
  {
    id: caro.id,
    name: caro.displayName,
    status: "Planned after Connect 4",
    players: `${caro.minPlayers} players`,
    roundTime: `${caro.estimatedRoundMinutes} min match`,
    summary: caro.summary,
  },
];

export const publicRooms: PublicRoom[] = [
  {
    code: "VB-1042",
    game: "Connect 4",
    host: "Khanh",
    seats: "1/2",
    status: "Waiting",
  },
  {
    code: "VB-2207",
    game: "Caro",
    host: "Arena Bot",
    seats: "1/2",
    status: "Preview",
  },
];

export const leaderboardPlayers: LeaderboardPlayer[] = [
  { rank: 1, name: "Khanh", game: "Connect 4", elo: 1240, record: "12W 3L" },
  { rank: 2, name: "Arena Bot", game: "Caro", elo: 1195, record: "8W 5L" },
  { rank: 3, name: "Guest Pilot", game: "Connect 4", elo: 1130, record: "6W 4L" },
];

export const demoMoves = ["Red C4", "Yellow C3", "Red C4", "Yellow C5"];
