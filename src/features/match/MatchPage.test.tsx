import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MatchMoveLogEntry } from "@contracts/roomMatch";
import type { MatchReadState, RoomMatchIntentClient, RoomMatchReadClient } from "@/firebase";
import { createLocalConnect4Match } from "@/features/match/connect4LocalMatch";
import { MatchPage } from "@/features/match/MatchPage";

type MatchMoveLogReadState =
  | {
      status: "ready";
      data: MatchMoveLogEntry[];
    }
  | {
      status: "error";
      message: string;
    };

const roomReadMocks = vi.hoisted(() => ({
  getGuestReadyRoomMatchIntentClient: vi.fn(),
  getRoomMatchIntentClient: vi.fn(),
  getRoomMatchReadClient: vi.fn(),
  submitMove: vi.fn(),
  subscribeToMatch: vi.fn(),
  subscribeToMatchMoves: vi.fn(),
  subscribeToRoom: vi.fn(),
}));

vi.mock("@/firebase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/firebase")>();

  return {
    ...actual,
    getGuestReadyRoomMatchIntentClient: roomReadMocks.getGuestReadyRoomMatchIntentClient,
    getRoomMatchIntentClient: roomReadMocks.getRoomMatchIntentClient,
    getRoomMatchReadClient: roomReadMocks.getRoomMatchReadClient,
  };
});

function mockRoomIntentClient() {
  const client: RoomMatchIntentClient = {
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    startMatch: vi.fn(),
    submitMove: roomReadMocks.submitMove,
  };

  roomReadMocks.getGuestReadyRoomMatchIntentClient.mockResolvedValue(client);
  roomReadMocks.getRoomMatchIntentClient.mockReturnValue(client);
  roomReadMocks.submitMove.mockResolvedValue({
    matchId: "match-1",
    stateVersion: 4,
    status: "active",
  });
}

function mockRoomReadClient() {
  const client = {
    subscribeToMatch: roomReadMocks.subscribeToMatch,
    subscribeToMatchMoves: roomReadMocks.subscribeToMatchMoves,
    subscribeToRoom: roomReadMocks.subscribeToRoom,
  } as RoomMatchReadClient & {
    subscribeToMatchMoves(
      matchId: string,
      listener: (state: MatchMoveLogReadState) => void,
    ): () => void;
  };

  roomReadMocks.getRoomMatchReadClient.mockReturnValue(client);
  roomReadMocks.subscribeToMatch.mockReturnValue(() => undefined);
  roomReadMocks.subscribeToMatchMoves.mockReturnValue(() => undefined);
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

function createOfficialMoveLogEntry(
  input: Pick<MatchMoveLogEntry, "actorSeatIndex" | "actorUid" | "id" | "payload" | "sequence">,
): MatchMoveLogEntry {
  return {
    actorSeatIndex: input.actorSeatIndex,
    actorUid: input.actorUid,
    createdAtMs: 1_000 + input.sequence,
    gameId: "connect-4",
    id: input.id,
    matchId: "match-1",
    moveType: "drop-disc",
    payload: input.payload,
    sequence: input.sequence,
    stateVersionAfter: input.sequence,
    stateVersionBefore: input.sequence - 1,
  };
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
    mockRoomIntentClient();
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
    expect(roomReadMocks.subscribeToMatchMoves).not.toHaveBeenCalled();
  });

  it("subscribes non-demo match routes through the official read boundary", async () => {
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
    expect(screen.getByRole("button", { name: "Drop disc in column 4" })).toBeEnabled();
  });

  it("submits official Connect 4 moves through the callable intent boundary", async () => {
    let matchListener: ((state: MatchReadState) => void) | null = null;
    roomReadMocks.subscribeToMatch.mockImplementation(
      (_matchId: string, listener: (state: MatchReadState) => void) => {
        matchListener = listener;

        return () => undefined;
      },
    );

    renderMatchRoute("/matches/match-1");

    act(() => {
      matchListener?.(createOfficialMatchReadState("match-1"));
    });

    const columnButton = await screen.findByRole("button", { name: "Drop disc in column 4" });
    expect(columnButton).toBeEnabled();

    fireEvent.click(columnButton);

    await waitFor(() => {
      expect(roomReadMocks.submitMove).toHaveBeenCalledWith({
        matchId: "match-1",
        payload: { column: 3 },
      });
    });
    expect(
      await screen.findByText("Move submitted. Waiting for official state..."),
    ).toBeInTheDocument();
  });

  it("subscribes official match routes to server-written move logs", async () => {
    let matchListener: ((state: MatchReadState) => void) | null = null;
    let moveLogListener: ((state: MatchMoveLogReadState) => void) | null = null;
    roomReadMocks.subscribeToMatch.mockImplementation(
      (_matchId: string, listener: (state: MatchReadState) => void) => {
        matchListener = listener;

        return () => undefined;
      },
    );
    roomReadMocks.subscribeToMatchMoves.mockImplementation(
      (_matchId: string, listener: (state: MatchMoveLogReadState) => void) => {
        moveLogListener = listener;

        return () => undefined;
      },
    );

    renderMatchRoute("/matches/match-1");

    act(() => {
      matchListener?.(createOfficialMatchReadState("match-1"));
      moveLogListener?.({ status: "ready", data: [] });
    });

    await waitFor(() => {
      expect(roomReadMocks.subscribeToMatchMoves).toHaveBeenCalledWith(
        "match-1",
        expect.any(Function),
      );
    });
    expect(await screen.findByText("Waiting for official move log entries.")).toBeInTheDocument();

    act(() => {
      moveLogListener?.({
        status: "ready",
        data: [
          createOfficialMoveLogEntry({
            actorSeatIndex: 0,
            actorUid: "host-1",
            id: "move-1",
            payload: { column: 3 },
            sequence: 1,
          }),
          createOfficialMoveLogEntry({
            actorSeatIndex: 1,
            actorUid: "guest-1",
            id: "move-2",
            payload: { column: 2 },
            sequence: 2,
          }),
        ],
      });
    });

    expect(await screen.findByText("P1 dropped in Column 4")).toBeInTheDocument();
    expect(screen.getByText("P2 dropped in Column 3")).toBeInTheDocument();
  });

  it("shows official move-log read errors", async () => {
    let matchListener: ((state: MatchReadState) => void) | null = null;
    let moveLogListener: ((state: MatchMoveLogReadState) => void) | null = null;
    roomReadMocks.subscribeToMatch.mockImplementation(
      (_matchId: string, listener: (state: MatchReadState) => void) => {
        matchListener = listener;

        return () => undefined;
      },
    );
    roomReadMocks.subscribeToMatchMoves.mockImplementation(
      (_matchId: string, listener: (state: MatchMoveLogReadState) => void) => {
        moveLogListener = listener;

        return () => undefined;
      },
    );

    renderMatchRoute("/matches/match-1");

    act(() => {
      matchListener?.(createOfficialMatchReadState("match-1"));
      moveLogListener?.({ message: "Missing or insufficient permissions.", status: "error" });
    });

    expect(
      await screen.findByText(
        "Official move log unavailable: Missing or insufficient permissions.",
      ),
    ).toBeInTheDocument();
  });

  it("shows official move intent errors without mutating local state", async () => {
    let matchListener: ((state: MatchReadState) => void) | null = null;
    roomReadMocks.subscribeToMatch.mockImplementation(
      (_matchId: string, listener: (state: MatchReadState) => void) => {
        matchListener = listener;

        return () => undefined;
      },
    );
    roomReadMocks.submitMove.mockRejectedValue(new Error("invalid-move:not-your-turn"));

    renderMatchRoute("/matches/match-1");

    act(() => {
      matchListener?.(createOfficialMatchReadState("match-1"));
    });

    fireEvent.click(await screen.findByRole("button", { name: "Drop disc in column 4" }));

    expect(await screen.findByText("invalid-move:not-your-turn")).toBeInTheDocument();
    expect(screen.getByText("State version 3")).toBeInTheDocument();
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
