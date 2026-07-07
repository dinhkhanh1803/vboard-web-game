import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RoomMatchIntentClient, RoomMatchReadClient, RoomReadState } from "@/firebase";
import { LobbyPage, WaitingRoomPage } from "@/features/lobby/LobbyPages";

const roomMocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  getRoomMatchIntentClient: vi.fn(),
  getRoomMatchReadClient: vi.fn(),
  joinRoom: vi.fn(),
  startMatch: vi.fn(),
  submitMove: vi.fn(),
  subscribeToMatch: vi.fn(),
  subscribeToRoom: vi.fn(),
}));

vi.mock("@/firebase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/firebase")>();

  return {
    ...actual,
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

  roomMocks.getRoomMatchIntentClient.mockReturnValue(client);
}

function mockRoomReadClient() {
  const client: RoomMatchReadClient = {
    subscribeToMatch: roomMocks.subscribeToMatch,
    subscribeToRoom: roomMocks.subscribeToRoom,
  };

  roomMocks.getRoomMatchReadClient.mockReturnValue(client);
  roomMocks.subscribeToRoom.mockReturnValue(() => undefined);
  roomMocks.subscribeToMatch.mockReturnValue(() => undefined);
}

describe("LobbyPage backend intents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoomIntentClient();
    mockRoomReadClient();
  });

  it("submits quick room creation through the room intent boundary", async () => {
    roomMocks.createRoom.mockResolvedValue({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "open",
    });

    render(<LobbyPage />);

    fireEvent.click(screen.getByRole("button", { name: "Start searching" }));

    await waitFor(() => {
      expect(roomMocks.createRoom).toHaveBeenCalledWith({ gameId: "connect-4" });
    });
    expect(
      await screen.findByText("Room VB-1042 created. Waiting room room-1 is ready."),
    ).toBeInTheDocument();
  });

  it("submits normalized room code joins through the room intent boundary", async () => {
    roomMocks.joinRoom.mockResolvedValue({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "full",
    });

    render(<LobbyPage />);

    fireEvent.change(screen.getByLabelText("Room code"), { target: { value: "vb-1042" } });
    fireEvent.click(screen.getByRole("button", { name: "Enter arena" }));

    await waitFor(() => {
      expect(roomMocks.joinRoom).toHaveBeenCalledWith({ roomCode: "VB-1042" });
    });
    expect(
      await screen.findByText("Joined room VB-1042. Room room-1 status is full."),
    ).toBeInTheDocument();
  });

  it("shows local errors when a callable intent fails", async () => {
    roomMocks.joinRoom.mockRejectedValue(new Error("Room code expired."));

    render(<LobbyPage />);

    fireEvent.change(screen.getByLabelText("Room code"), { target: { value: "VB-1042" } });
    fireEvent.click(screen.getByRole("button", { name: "Enter arena" }));

    expect(await screen.findByText("Room code expired.")).toBeInTheDocument();
  });

  it("shows a local error when the Firebase intent client is missing", async () => {
    roomMocks.getRoomMatchIntentClient.mockReturnValue(null);

    render(<LobbyPage />);

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

    render(
      <MemoryRouter initialEntries={["/rooms/room-1"]}>
        <Routes>
          <Route path="/rooms/:roomId" element={<WaitingRoomPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(roomMocks.subscribeToRoom).toHaveBeenCalledWith("room-1", expect.any(Function));
    });

    act(() => {
      roomListener?.({
        data: {
          code: "VB-1042",
          createdAtMs: 1,
          expiresAtMs: 2,
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
              joinedAtMs: 1,
              ready: true,
              seatIndex: 0,
              status: "occupied",
              uid: "host-1",
            },
            {
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
          status: "open",
          updatedAtMs: 1,
          visibility: "private",
        },
        status: "ready",
      });
    });

    expect(await screen.findByText("Official room VB-1042 is open.")).toBeInTheDocument();
    expect(screen.getByText("Player One ready. Opponent slot open.")).toBeInTheDocument();
  });
});
