export type StaticGame = {
  id: "connect-4" | "caro";
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

export const staticGames: StaticGame[] = [
  {
    id: "connect-4",
    name: "Connect 4",
    status: "UI ready, rules next",
    players: "2 players",
    roundTime: "10 min match",
    summary: "Drop discs into a seven-column board and connect four before your opponent.",
  },
  {
    id: "caro",
    name: "Caro",
    status: "Planned after Connect 4",
    players: "2 players",
    roundTime: "15 min match",
    summary: "Five-in-row tactical board game prepared for the shared match shell.",
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
