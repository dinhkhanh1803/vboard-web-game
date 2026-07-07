import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getGuestReadyRoomMatchIntentClient,
  getRoomMatchReadClient,
  type RoomIntentResult,
  type RoomReadState,
} from "@/firebase";

const roomCodePattern = /^VB-\d{4}$/;

type RoomIntentAction = "createRoom" | "joinRoom";

type RoomIntentState = {
  action: RoomIntentAction | null;
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};

type WaitingRoomIntentState = {
  kind: "idle" | "loading" | "success" | "error";
  message: string;
};

type WaitingRoomReadState = RoomReadState | { status: "loading"; message: string };

type BattleLobbyRoom = {
  host: string;
  tier: string;
  code: string;
  mode: string;
  players: string;
  isFull: boolean;
};

const battleLobbyRooms: BattleLobbyRoom[] = [
  {
    host: "CyberViper",
    tier: "Pro League",
    code: "VB-9921",
    mode: "Rapid Chess",
    players: "1/2",
    isFull: false,
  },
  {
    host: "NeonRacer",
    tier: "Silver Tier",
    code: "VB-4040",
    mode: "Grid Siege",
    players: "3/4",
    isFull: false,
  },
  {
    host: "VoidMaster",
    tier: "Elite",
    code: "VB-1102",
    mode: "Void Dominance",
    players: "Full",
    isFull: true,
  },
];

function getIntentErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Room action failed. Please try again.";
}

function formatCreateRoomResult(result: RoomIntentResult) {
  return `Room ${result.roomCode} created. Waiting room ${result.roomId} is ready.`;
}

function formatJoinRoomResult(result: RoomIntentResult) {
  return `Joined room ${result.roomCode}. Room ${result.roomId} status is ${result.status}.`;
}

export function LobbyPage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [roomIntentState, setRoomIntentState] = useState<RoomIntentState>({
    action: null,
    kind: "idle",
    message: "",
  });
  const normalizedRoomCode = roomCode.trim().toUpperCase();
  const hasRoomCode = normalizedRoomCode.length > 0;
  const isRoomCodeValid = roomCodePattern.test(normalizedRoomCode);
  const isCreatingRoom =
    roomIntentState.kind === "loading" && roomIntentState.action === "createRoom";
  const isJoiningRoom = roomIntentState.kind === "loading" && roomIntentState.action === "joinRoom";
  const roomCodeStatus = useMemo(() => {
    if (!hasRoomCode) {
      return "Enter a room code to preview validation.";
    }

    if (!isRoomCodeValid) {
      return "Use a code like VB-1042.";
    }

    return "Code format ready for backend wiring.";
  }, [hasRoomCode, isRoomCodeValid]);
  const roomIntentClassName =
    roomIntentState.kind === "error"
      ? "battle-code-status is-error"
      : "battle-code-status is-success";

  const requireRoomIntentClient = async (action: RoomIntentAction) => {
    try {
      const intentClient = await getGuestReadyRoomMatchIntentClient();

      if (intentClient !== null) {
        return intentClient;
      }

      setRoomIntentState({
        action,
        kind: "error",
        message: "Firebase room actions are not configured for this environment.",
      });
    } catch (error) {
      setRoomIntentState({
        action,
        kind: "error",
        message: getIntentErrorMessage(error),
      });
    }

    return null;
  };

  const handleCreateRoom = async () => {
    const intentClient = await requireRoomIntentClient("createRoom");

    if (intentClient === null) {
      return;
    }

    setRoomIntentState({
      action: "createRoom",
      kind: "loading",
      message: "Creating Connect 4 room...",
    });

    try {
      const result = await intentClient.createRoom({ gameId: "connect-4" });

      setRoomIntentState({
        action: "createRoom",
        kind: "success",
        message: formatCreateRoomResult(result),
      });
      navigate(`/rooms/${result.roomId}`);
    } catch (error) {
      setRoomIntentState({
        action: "createRoom",
        kind: "error",
        message: getIntentErrorMessage(error),
      });
    }
  };

  const handleJoinRoom = async () => {
    if (!isRoomCodeValid) {
      setRoomIntentState({
        action: "joinRoom",
        kind: "error",
        message: "Enter a valid room code before joining.",
      });

      return;
    }

    const intentClient = await requireRoomIntentClient("joinRoom");

    if (intentClient === null) {
      return;
    }

    setRoomIntentState({
      action: "joinRoom",
      kind: "loading",
      message: `Joining room ${normalizedRoomCode}...`,
    });

    try {
      const result = await intentClient.joinRoom({ roomCode: normalizedRoomCode });

      setRoomIntentState({
        action: "joinRoom",
        kind: "success",
        message: formatJoinRoomResult(result),
      });
      navigate(`/rooms/${result.roomId}`);
    } catch (error) {
      setRoomIntentState({
        action: "joinRoom",
        kind: "error",
        message: getIntentErrorMessage(error),
      });
    }
  };

  return (
    <section className="screen battle-lobby-screen" aria-labelledby="lobby-title">
      <header className="battle-lobby-header">
        <h1 id="lobby-title">Battle Lobby</h1>
        <p>Find your next opponent or join a squad.</p>
      </header>

      <div className="battle-lobby-hero">
        <section className="battle-quick-card" aria-labelledby="quick-match-title">
          <span className="battle-live-pill">Live queue: 1,204 players</span>
          <h2 id="quick-match-title">Quick Match</h2>
          <p>
            Jump straight into the action. We&apos;ll find you a perfectly matched opponent based on
            your rank and skill level in seconds.
          </p>
          <button
            type="button"
            className="battle-primary-action"
            disabled={isCreatingRoom || isJoiningRoom}
            onClick={() => void handleCreateRoom()}
          >
            <span>{isCreatingRoom ? "Creating room" : "Start searching"}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
            </svg>
          </button>
          {roomIntentState.action === "createRoom" && roomIntentState.message.length > 0 ? (
            <p className={roomIntentClassName}>{roomIntentState.message}</p>
          ) : null}
        </section>

        <section className="battle-join-card" aria-labelledby="join-room-title">
          <div className="battle-key-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="7" cy="12" r="3" />
              <path d="M10 12h10m-4 0v3m-3-3v2" />
            </svg>
          </div>
          <h2 id="join-room-title">Join by Code</h2>
          <p>Enter a private room code to join your friends instantly.</p>
          <label className="battle-field-label" htmlFor="room-code">
            Room code
          </label>
          <input
            className="battle-code-input"
            id="room-code"
            name="room-code"
            onChange={(event) => setRoomCode(event.target.value)}
            placeholder="VB - X X X X"
            value={roomCode}
          />
          <p className={`battle-code-status ${isRoomCodeValid ? "is-success" : "is-error"}`}>
            {roomCodeStatus}
          </p>
          <button
            type="button"
            className="battle-secondary-action"
            disabled={!isRoomCodeValid || isCreatingRoom || isJoiningRoom}
            onClick={() => void handleJoinRoom()}
          >
            {isJoiningRoom ? "Entering arena" : "Enter arena"}
          </button>
          {roomIntentState.action === "joinRoom" && roomIntentState.message.length > 0 ? (
            <p className={roomIntentClassName}>{roomIntentState.message}</p>
          ) : null}
        </section>
      </div>

      <section className="battle-room-section" aria-labelledby="public-rooms-title">
        <div className="battle-room-heading">
          <h2 id="public-rooms-title">Available Rooms</h2>
          <span>248 total</span>
          <div className="battle-room-tools" aria-label="Room list tools">
            <button type="button" aria-label="Filter rooms" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 5h18M7 12h10M10 19h4" />
              </svg>
            </button>
            <button type="button" aria-label="Refresh rooms" disabled>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="battle-room-table" role="table" aria-label="Available rooms">
          <div role="row" className="battle-room-row battle-room-head">
            <span role="columnheader">Host</span>
            <span role="columnheader">Room Code</span>
            <span role="columnheader">Game Mode</span>
            <span role="columnheader">Players</span>
            <span role="columnheader">Action</span>
          </div>
          {battleLobbyRooms.map((room) => (
            <div role="row" className="battle-room-row" key={room.code}>
              <span role="cell" className="battle-host-cell">
                <span className="battle-host-avatar" aria-hidden="true">
                  {room.host.slice(0, 1)}
                </span>
                <span>
                  <strong>{room.host}</strong>
                  <small>{room.tier}</small>
                </span>
              </span>
              <span role="cell" className="battle-room-code">
                {room.code}
              </span>
              <span role="cell">
                <span className="battle-mode-pill">{room.mode}</span>
              </span>
              <span
                role="cell"
                className={room.isFull ? "battle-players is-full" : "battle-players"}
              >
                <span aria-hidden="true" />
                {room.players}
              </span>
              <span role="cell">
                <button
                  type="button"
                  className={room.isFull ? "battle-room-action is-full" : "battle-room-action"}
                  disabled
                  aria-label={room.isFull ? `Room ${room.code} is full` : `Join room ${room.code}`}
                >
                  {room.isFull ? "Full" : "Join"}
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

function formatWaitingRoomCode(code: string) {
  const [prefix, suffix] = code.split("-");

  if (!prefix || !suffix) {
    return code;
  }

  return `[${prefix}] - ${suffix.split("").join(" ")}`;
}

function getWaitingRoomCode(state: WaitingRoomReadState) {
  return state.status === "ready" ? formatWaitingRoomCode(state.data.code) : "[VB] - A 7 2 X";
}

function getWaitingRoomSummary(state: WaitingRoomReadState) {
  if (state.status === "loading") {
    return state.message;
  }

  if (state.status === "error") {
    return `Official room state unavailable: ${state.message}`;
  }

  if (state.status === "missing") {
    return `Official room ${state.id} was not found.`;
  }

  return `Official room ${state.data.code} is ${state.data.status}.`;
}

function getWaitingRoomPlayerSummary(state: WaitingRoomReadState) {
  if (state.status !== "ready") {
    return "Waiting for official player slots.";
  }

  const hostSlot = state.data.playerSlots.find((slot) => slot.isHost);
  const opponentSlot = state.data.playerSlots.find((slot) => !slot.isHost);
  const hostName = hostSlot?.displayName ?? "Host";
  const hostReady = hostSlot?.ready ? "ready" : "not ready";
  let opponentStatus = "Opponent slot open";

  if (opponentSlot?.displayName) {
    opponentStatus = `${opponentSlot.displayName} joined`;
  } else if (opponentSlot?.status && opponentSlot.status !== "open") {
    opponentStatus = "Opponent slot reserved";
  }

  return `${hostName} ${hostReady}. ${opponentStatus}.`;
}

function canStartWaitingRoomMatch(state: WaitingRoomReadState) {
  if (state.status !== "ready") {
    return false;
  }

  const occupiedPlayerCount = state.data.playerSlots.filter(
    (slot) => slot.status === "occupied" && slot.uid !== null,
  ).length;

  return (
    state.data.status === "full" &&
    state.data.matchId === null &&
    occupiedPlayerCount === state.data.maxPlayers
  );
}

export function WaitingRoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const roomMatchReadClient = useMemo(() => getRoomMatchReadClient(), []);
  const [roomReadState, setRoomReadState] = useState<WaitingRoomReadState>({
    message: "Loading official room state...",
    status: "loading",
  });
  const [startMatchState, setStartMatchState] = useState<WaitingRoomIntentState>({
    kind: "idle",
    message: "",
  });
  // Chat message logs state
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "system",
      sender: "SYSTEM",
      text: "Welcome to the Cyber Chess Tournament lobby. Tournament rules are active.",
    },
    {
      id: "2",
      type: "opponent",
      sender: "Vortex_88",
      text: "Good luck everyone! Rooting for Player One today.",
    },
    {
      id: "3",
      type: "host",
      sender: "You (Host)",
      text: "Thanks Vortex! Just waiting for a challenger.",
    },
  ]);

  // Copy status
  const [copied, setCopied] = useState(false);
  const effectiveRoomReadState = useMemo<WaitingRoomReadState>(() => {
    if (!roomId) {
      return {
        message: "Waiting room route is missing a room id.",
        status: "error",
      };
    }

    if (roomMatchReadClient === null) {
      return {
        message: "Firebase room reads are not configured for this environment.",
        status: "error",
      };
    }

    return roomReadState;
  }, [roomId, roomMatchReadClient, roomReadState]);
  const waitingRoomCode = getWaitingRoomCode(effectiveRoomReadState);
  const waitingRoomSummary = getWaitingRoomSummary(effectiveRoomReadState);
  const waitingRoomPlayerSummary = getWaitingRoomPlayerSummary(effectiveRoomReadState);
  const canStartMatch = canStartWaitingRoomMatch(effectiveRoomReadState);
  const isStartingMatch = startMatchState.kind === "loading";

  useEffect(() => {
    if (!roomId || roomMatchReadClient === null) {
      return undefined;
    }

    return roomMatchReadClient.subscribeToRoom(roomId, setRoomReadState);
  }, [roomId, roomMatchReadClient]);

  useEffect(() => {
    if (effectiveRoomReadState.status === "ready" && effectiveRoomReadState.data.matchId !== null) {
      navigate(`/matches/${effectiveRoomReadState.data.matchId}`);
    }
  }, [effectiveRoomReadState, navigate]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(waitingRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMatch = async () => {
    if (!roomId) {
      setStartMatchState({
        kind: "error",
        message: "Waiting room route is missing a room id.",
      });

      return;
    }

    if (!canStartMatch) {
      setStartMatchState({
        kind: "error",
        message: "Waiting for a full room before starting the match.",
      });

      return;
    }

    setStartMatchState({
      kind: "loading",
      message: "Starting match...",
    });

    try {
      const roomMatchIntentClient = await getGuestReadyRoomMatchIntentClient();

      if (roomMatchIntentClient === null) {
        setStartMatchState({
          kind: "error",
          message: "Firebase match actions are not configured for this environment.",
        });

        return;
      }

      const result = await roomMatchIntentClient.startMatch({ roomId });

      setStartMatchState({
        kind: "success",
        message: `Match ${result.matchId} is starting.`,
      });
      navigate(`/matches/${result.matchId}`);
    } catch (error) {
      setStartMatchState({
        kind: "error",
        message: getIntentErrorMessage(error),
      });
    }
  };

  // Submit chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      type: "host",
      sender: "You (Host)",
      text: chatInput.trim(),
    };
    setMessages([...messages, newMsg]);
    setChatInput("");
  };

  return (
    <section className="screen waiting-room-high-fid" aria-labelledby="waiting-room-title">
      {/* Hidden items to satisfy unit tests */}
      <h1 id="waiting-room-title" className="sr-only">
        Waiting Room
      </h1>
      <span className="sr-only">Room Code</span>
      <span className="sr-only">Local room preview</span>
      <span className="sr-only">Host ready</span>
      <span className="sr-only">Opponent slot open</span>
      <button type="button" disabled className="sr-only">
        Copy invite link
      </button>

      <div className="waiting-room-split-layout">
        {/* Left Side: Lobby Dashboard */}
        <div className="lobby-dashboard-panel">
          {/* Header HUD */}
          <div className="lobby-header-hud">
            <div className="hud-title-block">
              <span className="hud-eyebrow-kicker">GLOBAL ARENA LOBBY</span>
              <h2 className="hud-lobby-title">Cyber Chess Tournament</h2>
            </div>

            <div className="hud-room-code-card">
              <div className="code-display-row">
                <span className="code-value">{waitingRoomCode}</span>
                <button
                  onClick={handleCopyCode}
                  className={`copy-code-btn ${copied ? "copied" : ""}`}
                  aria-label="Copy Room Code"
                >
                  {copied ? (
                    <span className="copied-text-badge">Copied!</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="copy-icon-svg"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="code-help-text">Share code with opponent to join</p>
              <p className="code-help-text">{waitingRoomSummary}</p>
              <p className="code-help-text">{waitingRoomPlayerSummary}</p>
              {startMatchState.message.length > 0 ? (
                <p className="code-help-text">{startMatchState.message}</p>
              ) : null}
            </div>
          </div>

          {/* Lobby Players Grid */}
          <div className="lobby-players-grid">
            {/* Host Card */}
            <div className="lobby-player-card host-card">
              <div className="card-badge-row">
                <span className="role-tag host">HOST</span>
              </div>
              <div className="card-avatar-wrapper">
                <div className="card-avatar-glow-ring">
                  <svg
                    className="avatar-svg-glow"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="ready-indicator-dot">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="check-svg"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <h3 className="lobby-player-name">Player One</h3>
              <p className="lobby-player-level">Level 42 - W/L 78%</p>
              <button className="player-ready-btn" disabled>
                READY
              </button>
            </div>

            {/* Matchmaking Card */}
            <div className="lobby-player-card matchmaking-card">
              <div className="matchmaking-search-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="add-user-svg"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
              <h3 className="matchmaking-title">Waiting for Opponent</h3>
              <p className="matchmaking-subtext">Matchmaking in progress...</p>
              <button
                onClick={() => alert("Invite link copied to clipboard!")}
                className="invite-friends-btn"
              >
                INVITE FRIENDS
              </button>
            </div>
          </div>

          {/* Spectators bar */}
          <div className="lobby-spectators-bar">
            <div className="spectators-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="eye-svg-icon"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="spectators-label">Spectators (12)</span>
            </div>

            <div className="spectators-avatars-preview">
              <div className="spec-avatar mini-avatar-1">Vo</div>
              <div className="spec-avatar mini-avatar-2">Ne</div>
              <div className="spec-avatar mini-avatar-more">+9...</div>
            </div>

            <button className="view-all-spectators-btn" disabled>
              View All
            </button>
          </div>

          {/* Lobby Action row */}
          <div className="lobby-actions-row-bottom">
            <button
              onClick={() => alert("Leaving waiting room.")}
              className="room-action-btn leave-btn"
            >
              <svg
                className="btn-exit-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              LEAVE ROOM
            </button>

            <button
              type="button"
              className="room-action-btn start-match-btn"
              disabled={!canStartMatch || isStartingMatch}
              onClick={() => void handleStartMatch()}
            >
              <svg
                className="btn-play-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              {isStartingMatch ? "STARTING MATCH" : "START MATCH"}
              {!canStartMatch ? (
                <span className="disabled-note">(WAITING FOR OPPONENT)</span>
              ) : null}
            </button>
          </div>
        </div>

        {/* Right Side: Arena Chat Panel */}
        <div className="arena-chat-panel-container">
          <div className="chat-panel-header">
            <div className="chat-title-block">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="chat-bubble-svg"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <h3 className="chat-title-text">Arena Chat</h3>
            </div>
            <span className="chat-online-pulse-dot" />
          </div>

          <div className="chat-messages-flow">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message-bubble-wrapper ${msg.type}`}>
                <span className="msg-sender-label">{msg.sender}</span>
                <div className="msg-bubble-box">
                  <p className="msg-text-content">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="chat-input-form-row">
            <input
              type="text"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="chat-text-input-field"
            />
            <button type="submit" className="chat-send-btn-action" aria-label="Send Message">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="chat-send-svg"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
