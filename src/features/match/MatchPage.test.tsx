import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MatchReadState, RoomMatchReadClient } from "@/firebase";
import { createLocalConnect4Match } from "@/features/match/connect4LocalMatch";
import { MatchPage } from "@/features/match/MatchPage";

const roomReadMocks = vi.hoisted(() => ({
  getRoomMatchReadClient: vi.fn(),
  subscribeToMatch: vi.fn(),
  subscribeToRoom: vi.fn(),
}));

vi.mock("@/firebase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/firebase")>();

  return {
    ...actual,
    getRoomMatchReadClient: roomReadMocks.getRoomMatchReadClient,
  };
});

function mockRoomReadClient() {
  const client: RoomMatchReadClient = {
    subscribeToMatch: roomReadMocks.subscribeToMatch,
    subscribeToRoom: roomReadMocks.subscribeToRoom,
  };

  roomReadMocks.getRoomMatchReadClient.mockReturnValue(client);
  roomReadMocks.subscribeToMatch.mockReturnValue(() => undefined);
  roomReadMocks.subscribeToRoom.mockReturnValue(() => undefined);
}

function renderMatchRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/matches/:matchId" element={<MatchPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function createOfficialMatchReadState(matchId = "match-1"): MatchReadState {
  const snapshot = createLocalConnect4Match({
    matchId,
    nowMs: 1_000,
    players: [
      {
        displayName: "Player One",
        seatIndex: 0,
        uid: "host-1",
      },
      {
        displayName: "StrategyKing",
        seatIndex: 1,
        uid: "guest-1",
      },
    ],
  });

  return {
    data: {
      ...snapshot.match,
      stateVersion: 3,
    },
    status: "ready",
  };
}

describe("MatchPage gameplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoomReadClient();
  });

  it("renders a local Connect 4 gameplay state and accepts column moves", () => {
    render(<MatchPage />);

    expect(screen.getByRole("heading", { name: "Connect 4 Match" })).toBeInTheDocument();
    expect(screen.getByLabelText("Interactive Connect 4 PixiJS board")).toBeInTheDocument();
    expect(screen.getAllByText("YOUR TURN").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Drop disc in column 4" }));

    expect(screen.getAllByText("OPPONENT'S TURN").length).toBeGreaterThan(0);
    expect(screen.getByText("P1 dropped in Column 4")).toBeInTheDocument();
  });

  it("shows the result panel when the local match completes", () => {
    render(<MatchPage />);

    for (const column of [1, 1, 2, 2, 3, 3, 4]) {
      fireEvent.click(screen.getByRole("button", { name: `Drop disc in column ${column}` }));
    }

    expect(screen.getByText("KHANH WINS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset local match" })).toBeInTheDocument();
  });

  it("keeps the Connect 4 demo route on local gameplay", () => {
    renderMatchRoute("/matches/demo-match");

    expect(screen.getByText("Local Practice Arena")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drop disc in column 4" })).toBeEnabled();
    expect(roomReadMocks.subscribeToMatch).not.toHaveBeenCalled();
  });

  it("subscribes non-demo match routes through the read-only boundary", async () => {
    let matchListener: ((state: MatchReadState) => void) | null = null;
    roomReadMocks.subscribeToMatch.mockImplementation(
      (_matchId: string, listener: (state: MatchReadState) => void) => {
        matchListener = listener;

        return () => undefined;
      },
    );

    renderMatchRoute("/matches/match-1");

    expect(screen.getByText("Loading official match state...")).toBeInTheDocument();
    await waitFor(() => {
      expect(roomReadMocks.subscribeToMatch).toHaveBeenCalledWith("match-1", expect.any(Function));
    });

    act(() => {
      matchListener?.(createOfficialMatchReadState("match-1"));
    });

    expect(await screen.findByText("Official match match-1 is active.")).toBeInTheDocument();
    expect(screen.getByText("State version 3")).toBeInTheDocument();
    expect(screen.getByText("Player One")).toBeInTheDocument();
    expect(screen.getByText("StrategyKing")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Drop disc in column 4" })).toBeDisabled();
  });

  it("shows read boundary errors for official match routes", async () => {
    let matchListener: ((state: MatchReadState) => void) | null = null;
    roomReadMocks.subscribeToMatch.mockImplementation(
      (_matchId: string, listener: (state: MatchReadState) => void) => {
        matchListener = listener;

        return () => undefined;
      },
    );

    renderMatchRoute("/matches/missing-match");

    act(() => {
      matchListener?.({ id: "missing-match", status: "missing" });
    });

    expect(
      await screen.findByText("Official match missing-match was not found."),
    ).toBeInTheDocument();
  });

  it("renders a local Caro gameplay state and accepts cell moves", () => {
    render(<MatchPage initialGameId="caro" />);

    expect(screen.getByRole("heading", { name: "Caro Match" })).toBeInTheDocument();
    expect(screen.getByLabelText("Interactive Caro PixiJS board")).toBeInTheDocument();
    expect(screen.getAllByText("YOUR TURN").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Place stone at row 8 column 8" }));

    expect(screen.getAllByText("OPPONENT'S TURN").length).toBeGreaterThan(0);
    expect(screen.getByText("P1 placed stone at R8 C8")).toBeInTheDocument();
  });

  it("shows the Caro result panel when the local match completes", () => {
    render(<MatchPage initialGameId="caro" />);

    for (const [row, column] of [
      [8, 8],
      [9, 8],
      [8, 9],
      [9, 9],
      [8, 10],
      [9, 10],
      [8, 11],
      [9, 11],
      [8, 12],
    ]) {
      fireEvent.click(
        screen.getByRole("button", { name: `Place stone at row ${row} column ${column}` }),
      );
    }

    expect(screen.getByText("KHANH WINS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset local match" })).toBeInTheDocument();
  });
});
