import { describe, expect, it } from "vitest";

import {
  createInitialPublicProfile,
  createInitialUserPrivate,
  gameIds,
  normalizeDisplayName,
  publicProfileDefaults,
  supportedAuthProviders,
  userAccountStatuses,
  userCollectionPaths,
  userRoles,
} from "./userProfile";

describe("user/profile contract constants", () => {
  it("pins Firestore collection names for private and public user documents", () => {
    expect(userCollectionPaths).toEqual({
      privateUsers: "users",
      publicProfiles: "profilesPublic",
    });
  });

  it("keeps enum-like values narrow and reviewable", () => {
    expect(supportedAuthProviders).toEqual(["email", "google", "guest"]);
    expect(userRoles).toEqual(["player", "moderator", "admin"]);
    expect(userAccountStatuses).toEqual(["active", "suspended", "deleted"]);
    expect(gameIds).toEqual(["connect-4", "caro"]);
  });
});

describe("createInitialUserPrivate", () => {
  it("creates a private account document without public profile fields", () => {
    const user = createInitialUserPrivate({
      uid: "user_123",
      email: "khanh@example.com",
      emailVerified: true,
      providerIds: ["email", "google"],
      nowMs: 1000,
    });

    expect(user).toEqual({
      uid: "user_123",
      email: "khanh@example.com",
      emailVerified: true,
      providerIds: ["email", "google"],
      role: "player",
      status: "active",
      createdAtMs: 1000,
      updatedAtMs: 1000,
      lastLoginAtMs: 1000,
    });
    expect(user).not.toHaveProperty("displayName");
    expect(user).not.toHaveProperty("avatarUrl");
  });
});

describe("createInitialPublicProfile", () => {
  it("creates a public profile with default game stats for every MVP game", () => {
    const profile = createInitialPublicProfile({
      uid: "user_123",
      displayName: "  Khanh   Arena  ",
      avatarUrl: "https://example.com/avatar.png",
      nowMs: 2000,
    });

    expect(profile.uid).toBe("user_123");
    expect(profile.displayName).toBe("Khanh Arena");
    expect(profile.avatarUrl).toBe("https://example.com/avatar.png");
    expect(profile.level).toBe(1);
    expect(profile.xp).toBe(0);
    expect(profile.createdAtMs).toBe(2000);
    expect(profile.updatedAtMs).toBe(2000);
    expect(profile.statsByGame).toEqual({
      "connect-4": publicProfileDefaults.gameStats,
      caro: publicProfileDefaults.gameStats,
    });
  });
});

describe("normalizeDisplayName", () => {
  it("falls back to Player and caps long names", () => {
    expect(normalizeDisplayName("   ")).toBe("Player");
    expect(normalizeDisplayName("This name is intentionally too long for UI cards")).toBe(
      "This name is intentionally",
    );
  });
});
