import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RoomMatchIntentClient } from "@/firebase";
import { LobbyPage } from "@/features/lobby/LobbyPages";

const roomIntentMocks = vi.hoisted(() => ({
  createRoom: vi.fn(),
  getRoomMatchIntentClient: vi.fn(),
  joinRoom: vi.fn(),
  startMatch: vi.fn(),
  submitMove: vi.fn(),
}));

vi.mock("@/firebase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/firebase")>();

  return {
    ...actual,
    getRoomMatchIntentClient: roomIntentMocks.getRoomMatchIntentClient,
  };
});

function mockRoomIntentClient() {
  const client: RoomMatchIntentClient = {
    createRoom: roomIntentMocks.createRoom,
    joinRoom: roomIntentMocks.joinRoom,
    startMatch: roomIntentMocks.startMatch,
    submitMove: roomIntentMocks.submitMove,
  };

  roomIntentMocks.getRoomMatchIntentClient.mockReturnValue(client);
}

describe("LobbyPage backend intents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoomIntentClient();
  });

  it("submits quick room creation through the room intent boundary", async () => {
    roomIntentMocks.createRoom.mockResolvedValue({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "open",
    });

    render(<LobbyPage />);

    fireEvent.click(screen.getByRole("button", { name: "Start searching" }));

    await waitFor(() => {
      expect(roomIntentMocks.createRoom).toHaveBeenCalledWith({ gameId: "connect-4" });
    });
    expect(
      await screen.findByText("Room VB-1042 created. Waiting room room-1 is ready."),
    ).toBeInTheDocument();
  });

  it("submits normalized room code joins through the room intent boundary", async () => {
    roomIntentMocks.joinRoom.mockResolvedValue({
      roomCode: "VB-1042",
      roomId: "room-1",
      status: "full",
    });

    render(<LobbyPage />);

    fireEvent.change(screen.getByLabelText("Room code"), { target: { value: "vb-1042" } });
    fireEvent.click(screen.getByRole("button", { name: "Enter arena" }));

    await waitFor(() => {
      expect(roomIntentMocks.joinRoom).toHaveBeenCalledWith({ roomCode: "VB-1042" });
    });
    expect(
      await screen.findByText("Joined room VB-1042. Room room-1 status is full."),
    ).toBeInTheDocument();
  });

  it("shows local errors when a callable intent fails", async () => {
    roomIntentMocks.joinRoom.mockRejectedValue(new Error("Room code expired."));

    render(<LobbyPage />);

    fireEvent.change(screen.getByLabelText("Room code"), { target: { value: "VB-1042" } });
    fireEvent.click(screen.getByRole("button", { name: "Enter arena" }));

    expect(await screen.findByText("Room code expired.")).toBeInTheDocument();
  });

  it("shows a local error when the Firebase intent client is missing", async () => {
    roomIntentMocks.getRoomMatchIntentClient.mockReturnValue(null);

    render(<LobbyPage />);

    fireEvent.click(screen.getByRole("button", { name: "Start searching" }));

    expect(
      await screen.findByText("Firebase room actions are not configured for this environment."),
    ).toBeInTheDocument();
  });
});
