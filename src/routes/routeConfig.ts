import type { ReactNode } from "react";

export type RouteId =
  | "home"
  | "games"
  | "lobby"
  | "room"
  | "match"
  | "profile"
  | "leaderboard"
  | "admin"
  | "privacy"
  | "terms"
  | "contact";

export type AppRoute = {
  id: RouteId;
  path: string;
  label: string;
  summary: string;
  navigationPath?: string;
  showInMainNav?: boolean;
  stubTitle?: string;
  stubEyebrow?: string;
  stubBody?: ReactNode;
};

export const appRoutes: AppRoute[] = [
  {
    id: "home",
    path: "/",
    label: "Home",
    summary: "Product overview and selected stack.",
    showInMainNav: true,
  },
  {
    id: "games",
    path: "/games",
    label: "Games",
    summary: "Game catalog for Connect 4, Caro, and future board games.",
    showInMainNav: true,
    stubTitle: "Games",
    stubEyebrow: "Catalog",
    stubBody: "Game list stub for Connect 4 and Caro metadata.",
  },
  {
    id: "lobby",
    path: "/lobby",
    label: "Lobby",
    summary: "Public rooms, quick match, and join-by-code entry points.",
    showInMainNav: true,
    stubTitle: "Lobby",
    stubEyebrow: "Rooms",
    stubBody: "Lobby stub for public rooms, quick match, and room codes.",
  },
  {
    id: "room",
    path: "/rooms/:roomId",
    label: "Room",
    summary: "Waiting room before a match starts.",
    navigationPath: "/rooms/demo-room",
    stubTitle: "Room",
    stubEyebrow: "Waiting room",
    stubBody: "Waiting room stub for invite links, player slots, and ready state.",
  },
  {
    id: "match",
    path: "/matches/:matchId",
    label: "Match",
    summary: "Realtime match screen rendered from official public state.",
    navigationPath: "/matches/demo-match",
    stubTitle: "Match",
    stubEyebrow: "Realtime play",
    stubBody: "Realtime match screen stub",
  },
  {
    id: "profile",
    path: "/profile/:userId?",
    label: "Profile",
    summary: "User profile, stats, and match history.",
    navigationPath: "/profile/me",
    showInMainNav: true,
    stubTitle: "Profile",
    stubEyebrow: "Identity",
    stubBody: "Profile stub for avatar, level, XP, and match history.",
  },
  {
    id: "leaderboard",
    path: "/leaderboard",
    label: "Leaderboard",
    summary: "Public ranking and seasonal stats.",
    showInMainNav: true,
    stubTitle: "Leaderboard",
    stubEyebrow: "Ranking",
    stubBody: "Leaderboard stub for Elo, wins, losses, and seasons.",
  },
  {
    id: "admin",
    path: "/admin",
    label: "Admin",
    summary: "Operational shell for reports, users, flags, and config.",
    showInMainNav: true,
    stubTitle: "Admin",
    stubEyebrow: "Operations",
    stubBody: "Admin stub for reports, game config, and feature flags.",
  },
  {
    id: "privacy",
    path: "/privacy-policy",
    label: "Privacy",
    summary: "Privacy policy content shell.",
    stubTitle: "Privacy Policy",
    stubEyebrow: "Policy",
    stubBody: "Privacy policy content stub before production deploy.",
  },
  {
    id: "terms",
    path: "/terms",
    label: "Terms",
    summary: "Terms of service content shell.",
    stubTitle: "Terms",
    stubEyebrow: "Policy",
    stubBody: "Terms content stub before production deploy.",
  },
  {
    id: "contact",
    path: "/contact",
    label: "Contact",
    summary: "Contact and support content shell.",
    stubTitle: "Contact",
    stubEyebrow: "Support",
    stubBody: "Contact content stub before production deploy.",
  },
];

const mainNavigationOrder: RouteId[] = [
  "home",
  "games",
  "lobby",
  "leaderboard",
  "profile",
  "admin",
];

export const mainNavigationRoutes = mainNavigationOrder
  .map((routeId) => appRoutes.find((route) => route.id === routeId))
  .filter((route): route is AppRoute => Boolean(route?.showInMainNav));

export function getRouteById(id: string) {
  return appRoutes.find((route) => route.id === id);
}

export function getRouteHref(route: AppRoute) {
  return route.navigationPath ?? route.path;
}
