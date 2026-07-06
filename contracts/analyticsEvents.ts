import type { GameId } from "./gameCatalog";
import type { MatchResultReason, MatchStatus } from "./roomMatch";
import type { SupportedAuthProvider } from "./userProfile";

export const analyticsEventCategories = [
  "navigation",
  "auth",
  "profile",
  "game_catalog",
  "lobby",
  "room",
  "match",
] as const;
export type AnalyticsEventCategory = (typeof analyticsEventCategories)[number];

export const analyticsEventNames = [
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
] as const;
export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsEventDefinition<TName extends AnalyticsEventName = AnalyticsEventName> = {
  name: TName;
  category: AnalyticsEventCategory;
  description: string;
};

export const analyticsEvents: {
  [TName in AnalyticsEventName]: AnalyticsEventDefinition<TName>;
} = {
  app_route_viewed: {
    name: "app_route_viewed",
    category: "navigation",
    description: "A route became visible in the web app.",
  },
  auth_entry_viewed: {
    name: "auth_entry_viewed",
    category: "auth",
    description: "A player viewed the auth entry UI.",
  },
  auth_provider_selected: {
    name: "auth_provider_selected",
    category: "auth",
    description: "A player selected an auth provider option.",
  },
  profile_viewed: {
    name: "profile_viewed",
    category: "profile",
    description: "A public profile or own profile screen was viewed.",
  },
  game_catalog_viewed: {
    name: "game_catalog_viewed",
    category: "game_catalog",
    description: "A player viewed the game catalog.",
  },
  game_selected: {
    name: "game_selected",
    category: "game_catalog",
    description: "A player selected a game from catalog or lobby UI.",
  },
  lobby_viewed: {
    name: "lobby_viewed",
    category: "lobby",
    description: "A player viewed the lobby screen.",
  },
  quick_match_clicked: {
    name: "quick_match_clicked",
    category: "lobby",
    description: "A player clicked the quick match entry point.",
  },
  room_created: {
    name: "room_created",
    category: "room",
    description: "A room was created through an official workflow.",
  },
  room_joined: {
    name: "room_joined",
    category: "room",
    description: "A player joined a room through an official workflow.",
  },
  room_ready_changed: {
    name: "room_ready_changed",
    category: "room",
    description: "A player changed ready state inside a waiting room.",
  },
  match_viewed: {
    name: "match_viewed",
    category: "match",
    description: "A player viewed a match screen.",
  },
  match_started: {
    name: "match_started",
    category: "match",
    description: "A match transitioned into active play.",
  },
  match_move_submitted: {
    name: "match_move_submitted",
    category: "match",
    description: "A player submitted a move intent.",
  },
  match_completed: {
    name: "match_completed",
    category: "match",
    description: "A match reached a terminal result.",
  },
};

export type AnalyticsEventPayloadMap = {
  app_route_viewed: {
    routeId: string;
    path: string;
  };
  auth_entry_viewed: {
    sourceRoute: string | null;
  };
  auth_provider_selected: {
    provider: SupportedAuthProvider;
    mode: "sign-in" | "sign-up";
  };
  profile_viewed: {
    profileUid: string;
    ownProfile: boolean;
  };
  game_catalog_viewed: Record<string, never>;
  game_selected: {
    gameId: GameId;
    source: "catalog" | "lobby" | "room" | "match";
  };
  lobby_viewed: {
    gameId: GameId | null;
  };
  quick_match_clicked: {
    gameId: GameId;
  };
  room_created: {
    roomId: string;
    gameId: GameId;
    visibility: "public" | "private";
  };
  room_joined: {
    roomId: string;
    gameId: GameId;
    joinSource: "code" | "public_list" | "invite" | "quick_match";
  };
  room_ready_changed: {
    roomId: string;
    gameId: GameId;
    ready: boolean;
  };
  match_viewed: {
    matchId: string;
    roomId: string | null;
    gameId: GameId;
  };
  match_started: {
    matchId: string;
    roomId: string;
    gameId: GameId;
    playerCount: number;
  };
  match_move_submitted: {
    matchId: string;
    gameId: GameId;
    moveType: string;
    sequence: number;
    stateVersionBefore: number;
  };
  match_completed: {
    matchId: string;
    roomId: string | null;
    gameId: GameId;
    status: MatchStatus;
    reason: MatchResultReason | null;
    winnerUid: string | null;
    durationMs: number | null;
    moveCount: number;
  };
};

export type AnalyticsEventEnvelope<TName extends AnalyticsEventName = AnalyticsEventName> = {
  name: TName;
  category: (typeof analyticsEvents)[TName]["category"];
  payload: AnalyticsEventPayloadMap[TName];
  createdAtMs: number;
};

export type CreateAnalyticsEventInput<TName extends AnalyticsEventName> = {
  name: TName;
  payload: AnalyticsEventPayloadMap[TName];
  createdAtMs: number;
};

export function createAnalyticsEvent<TName extends AnalyticsEventName>(
  input: CreateAnalyticsEventInput<TName>,
): AnalyticsEventEnvelope<TName> {
  return {
    name: input.name,
    category: analyticsEvents[input.name].category,
    payload: input.payload,
    createdAtMs: input.createdAtMs,
  };
}
