import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useParams } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RoomMatchIntentClient, RoomMatchReadClient, RoomReadState } from "@/firebase";
import { LobbyPage, WaitingRoomPage } from "@/features/lobby/LobbyPages";

const roomMocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  getGuestReadyRoomMatchIntentClient: vi.fn(),
  getRoomMatchIntentClient: vi.fn(),
  getRoomMatchReadClient: vi.fn(),
  joinRoom: vi.fn(),
  startMatch: vi.fn(),
  submitMove: vi.fn(),
  subscribeToMatch: vi.fn(),
  subscribeToMatchMoves: vi.fn(),
  subscribeToRoom: vi.fn(),
}));

vi.mock("@/firebase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/firebase")>();

  return {
    ...actual,
    getGuestReadyRoomMatchIntentClient: roomMocks.getGuestReadyRoomMatchIntentClient,
    getRoomMatchIntentClient: roomMocks.getRoomMatchIntentClient,
    getRoomMatchReadClient: roomMocks.getRoomMatchReadClient,
  };
});

function mockRoomIntentClient() {
  const client: RoomMatchIntentClient = {
    createRoom: roomMocks.createRoom,
    joinRoom: roomMocks.joinRoom,
    startMatch: roomMocks.startMatch,
    submitMove: roomMocks.submitMove,
  };

  roomMocks.getGuestReadyRoomMatchIntentClient.mockResolvedValue(client);
  roomMocks.getRoomMatchIntentClient.mockReturnValue(client);
}

function mockRoomReadClient() {
  const client: RoomMatchReadClient = {
    subscribeToMatch: roomMocks.subscribeToMatch,
    subscribeToMatchMoves: roomMocks.subscribeToMatchMoves,
    subscribeToRoom: roomMocks.subscribeToRoom,
  };

  roomMocks.getRoomMatchReadClient.mockReturnValue(client);
  roomMocks.subscribeToRoom.mockReturnValue(() => undefined);
  roomMocks.subscribeToMatch.mockReturnValue(() => undefined);
  roomMocks.subscribeToMatchMoves.mockReturnValue(() => undefined);
}

function RoomRouteProbe() {
  const { roomId } = useParams<{ roomId: string }>();

  return <p>Waiting room route {roomId}</p>;
}

function MatchRouteProbe() {
  const { matchId } = useParams<{ matchId: string }>();

  return <p>Match route {matchId}</p>;
}

function renderLobbyRoute() {
  return render(
    <MemoryRouter initialEntries={["/lobby"]}>
      <Routes>
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/rooms/:roomId" element={<RoomRouteProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderWaitingRoomRoute() {
  return render(
    <MemoryRouter initialEntries={["/rooms/room-1"]}>
      <Routes>
        <Route path="/rooms/:roomId" element={<WaitingRoomPage />} />
        <Route path="/matches/:matchId" element={<MatchRouteProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

function createReadyRoomState(
  input: {
    matchId?: string | null;
    opponentOccupied?: boolean;
    status?: "open" | "full" | "in-match";
  } = {},
): RoomReadState {
  const opponentOccupied = input.opponentOccupied ?? false;

  return {
    data: {
      code: "VB-1042",
      createdAtMs: 1,
      expiresAtMs: 2,
      gameId: "connect-4",
      hostUid: "host-1",
      id: "room-1",
      matchId: input.matchId ?? null,
      maxPlayers: 2,
      playerSlots: [
        {
          avatarUrl: null,
          displayName: "Player One",
          isHost: true,
          joinedAtMs: 1,
          ready: true,
          seatIndex: 0,
          status: "occupied",
          uid: "host-1",
        },
        opponentOccupied
          ? {
              avatarUrl: null,
              displayName: "Player Two",
              isHost: false,
              joinedAtMs: 2,
              ready: true,
              seatIndex: 1,
              status: "occupied",
              uid: "guest-1",
            }
          : {
              avatarUrl: null,
              displayName: null,
              isHost: false,
              joinedAtMs: null,
              ready: false,
              seatIndex: 1,
              status: "open",
              uid: null,
            },
      ],
      status: input.status ?? (opponentOccupied ? "full" : "open"),
      updatedAtMs: 1,
      visibility: "private",
    },
    status: "ready",
  };
}

describe("LobbyPage backend intents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoomIntentClient();
    mockRoomReadClient();
  });

  it("submits quick room creation through the room intent boundary and navigates to the room", async () => {
    roomMocks.createRoom.mockResolvedValue({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "open",
    });

    renderLobbyRoute();

    fireEvent.click(screen.getByRole("button", { name: "Start searching" }));

    await waitFor(() => {
      expect(roomMocks.createRoom).toHaveBeenCalledWith({ gameId: "connect-4" });
    });
    expect(await screen.findByText("Waiting room route room-1")).toBeInTheDocument();
  });

  it("submits normalized room code joins through the room intent boundary and navigates to the room", async () => {
    roomMocks.joinRoom.mockResolvedValue({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "full",
    });

    renderLobbyRoute();

    fireEvent.change(screen.getByLabelText("Room code"), { target: { value: "vb-1042" } });
    fireEvent.click(screen.getByRole("button", { name: "Enter arena" }));

    await waitFor(() => {
      expect(roomMocks.joinRoom).toHaveBeenCalledWith({ roomCode: "VB-1042" });
    });
    expect(await screen.findByText("Waiting room route room-1")).toBeInTheDocument();
  });

  it("normalizes display-formatted room codes before joining", async () => {
    roomMocks.joinRoom.mockResolvedValue({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "full",
    });

    renderLobbyRoute();

    fireEvent.change(screen.getByLabelText("Room code"), { target: { value: "[VB] - 1 0 4 2" } });
    fireEvent.click(screen.getByRole("button", { name: "Enter arena" }));

    await waitFor(() => {
      expect(roomMocks.joinRoom).toHaveBeenCalledWith({ roomCode: "VB-1042" });
    });
    expect(await screen.findByText("Waiting room route room-1")).toBeInTheDocument();
  });
  it("shows local errors when a callable intent fails", async () => {
    roomMocks.joinRoom.mockRejectedValue(new Error("Room code expired."));

    renderLobbyRoute();

    fireEvent.change(screen.getByLabelText("Room code"), { target: { value: "VB-1042" } });
    fireEvent.click(screen.getByRole("button", { name: "Enter arena" }));

    expect(await screen.findByText("Room code expired.")).toBeInTheDocument();
  });

  it("shows a local error when the Firebase intent client is missing", async () => {
    roomMocks.getGuestReadyRoomMatchIntentClient.mockResolvedValue(null);
    roomMocks.getRoomMatchIntentClient.mockReturnValue(null);

    renderLobbyRoute();

    fireEvent.click(screen.getByRole("button", { name: "Start searching" }));

    expect(
      await screen.findByText("Firebase room actions are not configured for this environment."),
    ).toBeInTheDocument();
  });
});

describe("WaitingRoomPage room reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoomIntentClient();
    mockRoomReadClient();
  });

  it("subscribes to the route room id through the read-only boundary", async () => {
    let roomListener: ((state: RoomReadState) => void) | null = null;
    roomMocks.subscribeToRoom.mockImplementation(
      (_roomId: string, listener: (state: RoomReadState) => void) => {
        roomListener = listener;

        return () => undefined;
      },
    );

    renderWaitingRoomRoute();

    await waitFor(() => {
      expect(roomMocks.subscribeToRoom).toHaveBeenCalledWith("room-1", expect.any(Function));
    });

    act(() => {
      roomListener?.(createReadyRoomState());
    });

    expect(await screen.findByText("Official room VB-1042 is open.")).toBeInTheDocument();
    expect(screen.getByText("Player One ready. Opponent slot open.")).toBeInTheDocument();
  });

  it("copies the raw room code instead of the display-formatted code", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    let roomListener: ((state: RoomReadState) => void) | null = null;
    roomMocks.subscribeToRoom.mockImplementation(
      (_roomId: string, listener: (state: RoomReadState) => void) => {
        roomListener = listener;

        return () => undefined;
      },
    );

    renderWaitingRoomRoute();

    act(() => {
      roomListener?.(createReadyRoomState());
    });

    fireEvent.click(await screen.findByRole("button", { name: "Copy Room Code" }));

    expect(writeText).toHaveBeenCalledWith("VB-1042");
  });
  it("starts a full room through the intent boundary and navigates to the match", async () => {
    let roomListener: ((state: RoomReadState) => void) | null = null;
    roomMocks.subscribeToRoom.mockImplementation(
      (_roomId: string, listener: (state: RoomReadState) => void) => {
        roomListener = listener;

        return () => undefined;
      },
    );
    roomMocks.startMatch.mockResolvedValue({
      matchId: "match-1",
      roomId: "room-1",
      status: "active",
    });

    renderWaitingRoomRoute();

    act(() => {
      roomListener?.(createReadyRoomState({ opponentOccupied: true }));
    });

    fireEvent.click(await screen.findByRole("button", { name: /^start match$/i }));

    await waitFor(() => {
      expect(roomMocks.startMatch).toHaveBeenCalledWith({ roomId: "room-1" });
    });
    expect(await screen.findByText("Match route match-1")).toBeInTheDocument();
  });

  it("navigates to the match when the subscribed room already has a match id", async () => {
    let roomListener: ((state: RoomReadState) => void) | null = null;
    roomMocks.subscribeToRoom.mockImplementation(
      (_roomId: string, listener: (state: RoomReadState) => void) => {
        roomListener = listener;

        return () => undefined;
      },
    );

    renderWaitingRoomRoute();

    act(() => {
      roomListener?.(
        createReadyRoomState({
          matchId: "match-2",
          opponentOccupied: true,
          status: "in-match",
        }),
      );
    });

    expect(await screen.findByText("Match route match-2")).toBeInTheDocument();
  });
});
