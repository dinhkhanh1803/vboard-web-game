export const userCollectionPaths = {
  privateUsers: "users",
  publicProfiles: "profilesPublic",
} as const;

export const supportedAuthProviders = ["email", "google", "guest"] as const;
export type SupportedAuthProvider = (typeof supportedAuthProviders)[number];

export const userRoles = ["player", "moderator", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const userAccountStatuses = ["active", "suspended", "deleted"] as const;
export type UserAccountStatus = (typeof userAccountStatuses)[number];

export const gameIds = ["connect-4", "caro"] as const;
export type GameId = (typeof gameIds)[number];

export type UserPrivate = {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  providerIds: SupportedAuthProvider[];
  role: UserRole;
  status: UserAccountStatus;
  createdAtMs: number;
  updatedAtMs: number;
  lastLoginAtMs: number | null;
};

export type PublicProfileGameStats = {
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  currentStreak: number;
  bestStreak: number;
};

export type PublicProfile = {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  countryCode: string | null;
  bio: string | null;
  level: number;
  xp: number;
  statsByGame: Record<GameId, PublicProfileGameStats>;
  createdAtMs: number;
  updatedAtMs: number;
};

export type CreateInitialUserPrivateInput = {
  uid: string;
  email?: string | null;
  emailVerified?: boolean;
  providerIds?: SupportedAuthProvider[];
  nowMs: number;
};

export type CreateInitialPublicProfileInput = {
  uid: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  countryCode?: string | null;
  bio?: string | null;
  nowMs: number;
};

const maxDisplayNameLength = 26;

export const publicProfileDefaults = {
  displayName: "Player",
  level: 1,
  xp: 0,
  gameStats: {
    elo: 1000,
    wins: 0,
    losses: 0,
    draws: 0,
    gamesPlayed: 0,
    currentStreak: 0,
    bestStreak: 0,
  },
} as const;

export function normalizeDisplayName(displayName: string | null | undefined) {
  const normalized = displayName?.trim().replace(/\s+/g, " ") ?? "";

  if (!normalized) {
    return publicProfileDefaults.displayName;
  }

  return normalized.slice(0, maxDisplayNameLength).trimEnd();
}

function createInitialStatsByGame(): Record<GameId, PublicProfileGameStats> {
  return gameIds.reduce<Record<GameId, PublicProfileGameStats>>(
    (statsByGame, gameId) => ({
      ...statsByGame,
      [gameId]: { ...publicProfileDefaults.gameStats },
    }),
    {} as Record<GameId, PublicProfileGameStats>,
  );
}

export function createInitialUserPrivate(input: CreateInitialUserPrivateInput): UserPrivate {
  return {
    uid: input.uid,
    email: input.email ?? null,
    emailVerified: input.emailVerified ?? false,
    providerIds: input.providerIds ?? ["guest"],
    role: "player",
    status: "active",
    createdAtMs: input.nowMs,
    updatedAtMs: input.nowMs,
    lastLoginAtMs: input.nowMs,
  };
}

export function createInitialPublicProfile(input: CreateInitialPublicProfileInput): PublicProfile {
  return {
    uid: input.uid,
    displayName: normalizeDisplayName(input.displayName),
    avatarUrl: input.avatarUrl ?? null,
    countryCode: input.countryCode ?? null,
    bio: input.bio ?? null,
    level: publicProfileDefaults.level,
    xp: publicProfileDefaults.xp,
    statsByGame: createInitialStatsByGame(),
    createdAtMs: input.nowMs,
    updatedAtMs: input.nowMs,
  };
}
