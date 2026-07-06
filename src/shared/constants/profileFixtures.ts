import {
  createInitialPublicProfile,
  type PublicProfile,
  type PublicProfileGameStats,
} from "@contracts/userProfile";

const createdAtMs = 1_725_000_000_000;

const connect4Stats: PublicProfileGameStats = {
  elo: 1240,
  wins: 12,
  losses: 3,
  draws: 0,
  gamesPlayed: 15,
  currentStreak: 2,
  bestStreak: 5,
};

const caroStats: PublicProfileGameStats = {
  elo: 1195,
  wins: 8,
  losses: 5,
  draws: 0,
  gamesPlayed: 13,
  currentStreak: 0,
  bestStreak: 3,
};

const baseProfile = createInitialPublicProfile({
  uid: "demo-user-khanh",
  displayName: "Khanh",
  countryCode: "VN",
  bio: "Solo builder profile preview before Firebase Auth is wired.",
  nowMs: createdAtMs,
});

export const demoPublicProfile: PublicProfile = {
  ...baseProfile,
  avatarUrl: null,
  level: 1,
  xp: 320,
  statsByGame: {
    ...baseProfile.statsByGame,
    "connect-4": connect4Stats,
    caro: caroStats,
  },
};

export const demoProfilePrimaryGameId = "connect-4" as const;
