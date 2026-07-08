import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  FirebaseIdentityClient,
  FirebaseIdentityUser,
  MatchMoveLogReadState,
  MatchReadState,
  RoomMatchIntentClient,
  RoomMatchReadClient,
  RoomReadState,
} from "@/firebase";
import { App } from "@/app/App";
import { createLocalConnect4Match } from "@/features/match/connect4LocalMatch";

const appFlowMocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  getFirebaseIdentityClient: vi.fn(),
  getGuestReadyRoomMatchIntentClient: vi.fn(),
  getRoomMatchIntentClient: vi.fn(),
  getRoomMatchReadClient: vi.fn(),
  joinRoom: vi.fn(),
  leaveRoom: vi.fn(),
  startMatch: vi.fn(),
  submitMove: vi.fn(),
  subscribeToMatch: vi.fn(),
  subscribeToMatchMoves: vi.fn(),
  subscribeToRoom: vi.fn(),
}));

vi.mock("@/firebase", () => ({
  getFirebaseIdentityClient: appFlowMocks.getFirebaseIdentityClient,
  getGuestReadyRoomMatchIntentClient: appFlowMocks.getGuestReadyRoomMatchIntentClient,
  getRoomMatchIntentClient: appFlowMocks.getRoomMatchIntentClient,
  getRoomMatchReadClient: appFlowMocks.getRoomMatchReadClient,
}));

function createIdentityUser(uid: string): FirebaseIdentityUser {
  return {
    displayName: uid,
    email: null,
    isAnonymous: true,
    photoURL: null,
    uid,
  };
}

function createIdentityClient(user: FirebaseIdentityUser | null): FirebaseIdentityClient {
  const fallbackGuest = createIdentityUser("guest-signed-in");

  return {
    readCurrentUser: vi.fn(() => user),
    signInAsGuest: vi.fn().mockResolvedValue(user ?? fallbackGuest),
    signOut: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn((listener) => {
      listener({ status: "ready", user });

      return () => undefined;
    }),
  };
}

function renderApp(path = "/lobby") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function createIntentClient(): RoomMatchIntentClient {
  return {
    createRoom: appFlowMocks.createRoom,
    joinRoom: appFlowMocks.joinRoom,
    leaveRoom: appFlowMocks.leaveRoom,
    startMatch: appFlowMocks.startMatch,
    submitMove: appFlowMocks.submitMove,
  };
}

function createReadClient(): RoomMatchReadClient {
  return {
    subscribeToMatch: appFlowMocks.subscribeToMatch,
    subscribeToMatchMoves: appFlowMocks.subscribeToMatchMoves,
    subscribeToRoom: appFlowMocks.subscribeToRoom,
  };
}

function createFullRoomState(): RoomReadState {
  return {
    data: {
      code: "VB-1042",
      createdAtMs: 1_000,
      expiresAtMs: 3_600_000,
      gameId: "connect-4",
      hostUid: "host-1",
      id: "room-1",
      matchId: null,
      maxPlayers: 2,
      playerSlots: [
        {
          avatarUrl: null,
          displayName: "Player One",
          isHost: true,
          joinedAtMs: 1_000,
          ready: true,
          seatIndex: 0,
          status: "occupied",
          uid: "host-1",
        },
        {
          avatarUrl: null,
          displayName: "Player Two",
          isHost: false,
          joinedAtMs: 2_000,
          ready: true,
          seatIndex: 1,
          status: "occupied",
          uid: "guest-1",
        },
      ],
      status: "full",
      updatedAtMs: 2_000,
      visibility: "private",
    },
    status: "ready",
  };
}

function createOfficialMatchState(): MatchReadState {
  const snapshot = createLocalConnect4Match({
    matchId: "match-1",
    nowMs: 3_000,
    players: [
      {
        displayName: "Player One",
        seatIndex: 0,
        uid: "host-1",
      },
      {
        displayName: "Player Two",
        seatIndex: 1,
        uid: "guest-1",
      },
    ],
  });

  return {
    data: {
      ...snapshot.match,
      roomId: "room-1",
    },
    status: "ready",
  };
}

function createMoveLogState(): MatchMoveLogReadState {
  return {
    data: [
      {
        actorSeatIndex: 0,
        actorUid: "host-1",
        createdAtMs: 4_000,
        gameId: "connect-4",
        id: "move-1",
        matchId: "match-1",
        moveType: "drop-disc",
        payload: { column: 3 },
        sequence: 1,
        stateVersionAfter: 1,
        stateVersionBefore: 0,
      },
    ],
    status: "ready",
  };
}

describe("official web app room/match flow", () => {
  let matchListener: ((state: MatchReadState) => void) | null = null;
  let moveLogListener: ((state: MatchMoveLogReadState) => void) | null = null;
  let roomListener: ((state: RoomReadState) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    matchListener = null;
    moveLogListener = null;
    roomListener = null;

    const intentClient = createIntentClient();
    appFlowMocks.getFirebaseIdentityClient.mockReturnValue(
      createIdentityClient(createIdentityUser("host-1")),
    );
    appFlowMocks.getGuestReadyRoomMatchIntentClient.mockResolvedValue(intentClient);
    appFlowMocks.getRoomMatchIntentClient.mockReturnValue(intentClient);
    appFlowMocks.getRoomMatchReadClient.mockReturnValue(createReadClient());
    appFlowMocks.createRoom.mockResolvedValue({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "open",
    });
    appFlowMocks.startMatch.mockResolvedValue({
      matchId: "match-1",
      roomId: "room-1",
      status: "active",
    });
    appFlowMocks.submitMove.mockResolvedValue({
      matchId: "match-1",
      stateVersion: 1,
      status: "active",
    });
    appFlowMocks.subscribeToRoom.mockImplementation(
      (_roomId: string, listener: (state: RoomReadState) => void) => {
        roomListener = listener;

        return () => undefined;
      },
    );
    appFlowMocks.subscribeToMatch.mockImplementation(
      (_matchId: string, listener: (state: MatchReadState) => void) => {
        matchListener = listener;

        return () => undefined;
      },
    );
    appFlowMocks.subscribeToMatchMoves.mockImplementation(
      (_matchId: string, listener: (state: MatchMoveLogReadState) => void) => {
        moveLogListener = listener;

        return () => undefined;
      },
    );
  });

  it("signs in for guest-ready intents across lobby, waiting room, and match routes", async () => {
    renderApp();

    fireEvent.click(screen.getByRole("button", { name: "Start searching" }));

    await waitFor(() => {
      expect(appFlowMocks.getGuestReadyRoomMatchIntentClient).toHaveBeenCalled();
    });
    expect(appFlowMocks.createRoom).toHaveBeenCalledWith({ gameId: "connect-4" });

    await waitFor(() => {
      expect(appFlowMocks.subscribeToRoom).toHaveBeenCalledWith("room-1", expect.any(Function));
    });

    act(() => {
      roomListener?.(createFullRoomState());
    });

    const startMatchButton = await screen.findByRole("button", { name: /^start match$/i });
    await waitFor(() => {
      expect(startMatchButton).toBeEnabled();
    });
    fireEvent.click(startMatchButton);

    await waitFor(() => {
      expect(appFlowMocks.startMatch).toHaveBeenCalledWith({ roomId: "room-1" });
    });
    await waitFor(() => {
      expect(appFlowMocks.subscribeToMatch).toHaveBeenCalledWith("match-1", expect.any(Function));
      expect(appFlowMocks.subscribeToMatchMoves).toHaveBeenCalledWith(
        "match-1",
        expect.any(Function),
      );
    });

    act(() => {
      matchListener?.(createOfficialMatchState());
      moveLogListener?.({ data: [], status: "ready" });
    });

    fireEvent.click(await screen.findByRole("button", { name: "Drop disc in column 4" }));

    await waitFor(() => {
      expect(appFlowMocks.submitMove).toHaveBeenCalledWith({
        matchId: "match-1",
        payload: { column: 3 },
      });
    });

    act(() => {
      moveLogListener?.(createMoveLogState());
    });

    expect(await screen.findByText("P1 dropped in Column 4")).toBeInTheDocument();
    expect(appFlowMocks.getGuestReadyRoomMatchIntentClient).toHaveBeenCalledTimes(3);
  });
});
