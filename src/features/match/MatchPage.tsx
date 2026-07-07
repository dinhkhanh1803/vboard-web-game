import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";

import type { GameId } from "@contracts/gameCatalog";
import { getRoomMatchReadClient, type MatchReadState } from "@/firebase";
import { CaroPixiBoard } from "@/features/match/CaroPixiBoard";
import { Connect4PixiBoard } from "@/features/match/Connect4PixiBoard";
import { createLocalCaroMatchSource, getCaroPublicState } from "@/features/match/caroLocalMatch";
import {
  createLocalConnect4MatchSource,
  getConnect4PublicState,
} from "@/features/match/connect4LocalMatch";

export type MatchPageProps = {
  initialGameId?: GameId;
};

type OfficialMatchReadState = MatchReadState | { status: "loading"; message: string };

export function MatchPage({ initialGameId = "connect-4" }: MatchPageProps) {
  const { matchId } = useParams<{ matchId: string }>();

  if (initialGameId === "caro") {
    return <CaroMatchPage />;
  }

  if (matchId && matchId !== "demo-match") {
    return <OfficialConnect4MatchPage matchId={matchId} />;
  }

  return <Connect4MatchPage />;
}

function OfficialConnect4MatchPage({ matchId }: { matchId: string }) {
  const roomMatchReadClient = useMemo(() => getRoomMatchReadClient(), []);
  const [matchReadState, setMatchReadState] = useState<OfficialMatchReadState>({
    message: "Loading official match state...",
    status: "loading",
  });
  const effectiveMatchReadState = useMemo<OfficialMatchReadState>(() => {
    if (roomMatchReadClient === null) {
      return {
        message: "Firebase match reads are not configured for this environment.",
        status: "error",
      };
    }

    return matchReadState;
  }, [matchReadState, roomMatchReadClient]);

  useEffect(() => {
    if (roomMatchReadClient === null) {
      return undefined;
    }

    return roomMatchReadClient.subscribeToMatch(matchId, setMatchReadState);
  }, [matchId, roomMatchReadClient]);

  if (effectiveMatchReadState.status !== "ready") {
    return (
      <section className="screen match-screen-high-fid" aria-labelledby="match-title">
        <header className="match-header-block">
          <h1 id="match-title" className="match-visible-title">
            Connect 4 Match
          </h1>
          <p className="match-subtitle-text">Official Arena Match</p>
        </header>
        <div className="match-layout-high-fid">
          <div className="match-col match-center-col">
            <div className="match-history-card">
              <div className="history-header">
                <h2 className="history-title">MATCH STATE</h2>
              </div>
              <div className="history-logs-container">
                <p className="no-moves-placeholder">
                  {getOfficialMatchReadMessage(effectiveMatchReadState, matchId)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const match = effectiveMatchReadState.data;

  if (match.gameId !== "connect-4") {
    return (
      <section className="screen match-screen-high-fid" aria-labelledby="match-title">
        <header className="match-header-block">
          <h1 id="match-title" className="match-visible-title">
            Match
          </h1>
          <p className="match-subtitle-text">Official Arena Match</p>
        </header>
        <p className="no-moves-placeholder">
          Official game {match.gameId} is not supported here yet.
        </p>
      </section>
    );
  }

  const publicState = readConnect4PublicState(match);

  const p1 = match.players[0] ?? { displayName: "Player One", seatIndex: 0 };
  const p2 = match.players[1] ?? { displayName: "Opponent", seatIndex: 1 };
  const isP1Turn = match.turn.activeSeatIndex === 0;
  const isP2Turn = match.turn.activeSeatIndex === 1;
  const matchCompleted = match.status === "completed";
  const winner = match.players.find((player) => player.seatIndex === match.result.winnerSeatIndex);

  return (
    <section className="screen match-screen-high-fid" aria-labelledby="match-title">
      <header className="match-header-block">
        <h1 id="match-title" className="match-visible-title">
          Connect 4 Match
        </h1>
        <p className="match-subtitle-text">Official Arena Match</p>
      </header>
      <div className="match-layout-high-fid">
        <div className="match-col match-left-col">
          <div className="player-status-card p1-card">
            <div className="card-header-status">
              <span className={`status-pill-high-fid ${isP1Turn ? "p1-turn" : "waiting"}`}>
                {isP1Turn ? "YOUR TURN" : "WAITING..."}
              </span>
            </div>
            <div className="card-player-info">
              <div className="player-avatar-wrapper p1-avatar" aria-hidden="true" />
              <h2 className="player-name-text">{p1.displayName}</h2>
            </div>
          </div>

          <div className="match-history-card">
            <div className="history-header">
              <h3 className="history-title">OFFICIAL MATCH STATE</h3>
            </div>
            <div className="history-logs-container">
              <p className="no-moves-placeholder">
                Official match {match.id} is {match.status}.
              </p>
              <p className="waiting-text">State version {match.stateVersion}</p>
              <p className="waiting-text">Room {match.roomId}</p>
            </div>
          </div>
        </div>

        <div className="match-col match-center-col">
          <div className="match-hud-bar">
            <div className="hud-turn-display">
              <span className={`hud-pulse-dot ${isP1Turn ? "p1-active" : "p2-active"}`} />
              <span className="hud-turn-text">
                {matchCompleted
                  ? winner
                    ? `${winner.displayName.toUpperCase()} WINS`
                    : "MATCH COMPLETE"
                  : isP1Turn
                    ? "YOUR TURN"
                    : "OPPONENT'S TURN"}
              </span>
            </div>
            <div className="hud-timer-display">
              <span className="hud-timer-text">| Official timer</span>
            </div>
          </div>

          <div className="board-stage-wrapper">
            {publicState ? (
              <Connect4PixiBoard disabled onColumnSelect={() => undefined} state={publicState} />
            ) : (
              <p className="no-moves-placeholder">Official public state is not available yet.</p>
            )}
          </div>

          <div className="game-controls-row">
            <button className="control-btn reset-btn" type="button" disabled>
              OFFICIAL READ ONLY
            </button>
          </div>
        </div>

        <div className="match-col match-right-col">
          <div className="player-status-card p2-card">
            <div className="card-header-status">
              <span className={`status-pill-high-fid ${isP2Turn ? "p2-turn" : "waiting"}`}>
                {isP2Turn ? "YOUR TURN" : "WAITING..."}
              </span>
            </div>
            <div className="card-player-info">
              <div className="player-avatar-wrapper p2-avatar" aria-hidden="true" />
              <h2 className="player-name-text">{p2.displayName}</h2>
            </div>
          </div>

          <div className="room-code-widget-match">
            <span className="room-code-title">MATCH STATUS</span>
            <div className="room-code-row">
              <span className="room-code-val">{match.status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function readConnect4PublicState(match: Parameters<typeof getConnect4PublicState>[0]) {
  try {
    return getConnect4PublicState(match);
  } catch {
    return null;
  }
}

function getOfficialMatchReadMessage(state: OfficialMatchReadState, matchId: string) {
  if (state.status === "loading") {
    return state.message;
  }

  if (state.status === "missing") {
    return `Official match ${state.id} was not found.`;
  }

  if (state.status === "error") {
    return `Official match ${matchId} unavailable: ${state.message}`;
  }

  return `Official match ${state.data.id} is ${state.data.status}.`;
}

function Connect4MatchPage() {
  const matchSource = useMemo(
    () => createLocalConnect4MatchSource({ matchId: "demo-match", nowMs: 1_000 }),
    [],
  );
  const snapshot = useSyncExternalStore(
    matchSource.subscribe,
    matchSource.getSnapshot,
    matchSource.getSnapshot,
  );
  const publicState = getConnect4PublicState(snapshot.match);
  const winner = snapshot.match.players.find(
    (player) => player.seatIndex === snapshot.match.result.winnerSeatIndex,
  );
  const matchCompleted = snapshot.match.status === "completed";
  const handleColumnSelect = useCallback(
    (column: number) => {
      matchSource.submitMove(column);
    },
    [matchSource],
  );

  // Mute toggles for Voice Lobby
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  // Copy status tooltip
  const [copied, setCopied] = useState(false);

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText("VB-A47X");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Static stats for players
  const player1Stats = { rank: "#12", winRate: "74%" };
  const player2Stats = { rank: "#42", winRate: "61%" };

  const p1 = snapshot.match.players[0] || { displayName: "Player One" };
  const p2 = snapshot.match.players[1] || { displayName: "CyberGhost" };

  const isP1Turn = snapshot.match.turn.activeSeatIndex === 0;
  const isP2Turn = snapshot.match.turn.activeSeatIndex === 1;

  return (
    <section className="screen match-screen-high-fid" aria-labelledby="match-title">
      <header className="match-header-block">
        <h1 id="match-title" className="match-visible-title">
          Connect 4 Match
        </h1>
        <p className="match-subtitle-text">Local Practice Arena</p>
      </header>
      <div className="match-layout-high-fid">
        {/* Left Column: Player One Card & Match History */}
        <div className="match-col match-left-col">
          {/* Player 1 Card */}
          <div className="player-status-card p1-card">
            <div className="card-header-status">
              {!matchCompleted && isP1Turn ? (
                <span className="status-pill-high-fid p1-turn">YOUR TURN</span>
              ) : (
                <span className="status-pill-high-fid waiting">WAITING...</span>
              )}
            </div>
            <div className="card-player-info">
              <div className="player-avatar-wrapper p1-avatar">
                <svg
                  className="avatar-svg"
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
              <h2 className="player-name-text">{p1.displayName}</h2>
            </div>
            <div className="player-stats-subgrid">
              <div className="stat-box">
                <span className="stat-label">Rank</span>
                <span className="stat-value">{player1Stats.rank}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">{player1Stats.winRate}</span>
              </div>
            </div>
          </div>

          {/* Match History */}
          <div className="match-history-card">
            <div className="history-header">
              <h3 id="move-log-title" className="history-title">
                <svg
                  className="history-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                MATCH HISTORY
              </h3>
            </div>
            <div className="history-logs-container">
              {snapshot.moveLogEntries.length === 0 ? (
                <p className="no-moves-placeholder">No moves yet. Make a move on the board!</p>
              ) : (
                <ol className="history-list-flow">
                  {snapshot.moveLogEntries.map((move, idx) => {
                    const isP1 = move.actorSeatIndex === 0;
                    return (
                      <li key={move.id} className="history-log-item">
                        <span className={`bullet-badge ${isP1 ? "p1-bullet" : "p2-bullet"}`}>
                          {idx + 1}
                        </span>
                        <span className="log-text-content">
                          {isP1 ? "P1" : "P2"} dropped in Column {Number(move.payload.column) + 1}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              {!matchCompleted && (
                <div className="waiting-for-move-row">
                  <span className="pulsing-status-dot" />
                  <span className="waiting-text">Waiting for move...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Timer & Turn, Board, Game Controls */}
        <div className="match-col match-center-col">
          {/* Timer & Turn HUD */}
          <div className="match-hud-bar">
            <div className="hud-turn-display">
              <span
                className={`hud-pulse-dot ${!matchCompleted && isP1Turn ? "p1-active" : "p2-active"}`}
              />
              <span className="hud-turn-text">
                {matchCompleted
                  ? winner
                    ? `${winner.displayName.toUpperCase()} WINS`
                    : "DRAW MATCH"
                  : isP1Turn
                    ? "YOUR TURN"
                    : "OPPONENT'S TURN"}
              </span>
            </div>
            <div className="hud-timer-display">
              <span className="hud-timer-text">| 00:24</span>
            </div>
          </div>

          {/* Interactive Game Board */}
          <div className="board-stage-wrapper">
            <Connect4PixiBoard
              disabled={matchCompleted}
              onColumnSelect={handleColumnSelect}
              state={publicState}
            />
          </div>

          {/* Bottom Game Controls */}
          <div className="game-controls-row">
            <button
              className="control-btn reset-btn"
              type="button"
              onClick={() => matchSource.reset()}
              aria-label="Reset local match"
            >
              <svg
                className="control-svg-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              RESET GAME
            </button>

            <button
              className="control-btn draw-btn"
              type="button"
              disabled={matchCompleted}
              onClick={() => alert("Draw offered to opponent!")}
            >
              <svg
                className="control-svg-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              OFFER DRAW
            </button>

            <button
              className="control-btn forfeit-btn"
              type="button"
              disabled={matchCompleted}
              onClick={() => alert("You have forfeited the match.")}
            >
              <svg
                className="control-svg-icon"
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
              FORFEIT
            </button>
          </div>
        </div>

        {/* Right Column: Player Two Card, Voice Lobby, Room Code */}
        <div className="match-col match-right-col">
          {/* Player 2 Card */}
          <div className="player-status-card p2-card">
            <div className="card-header-status">
              {!matchCompleted && isP2Turn ? (
                <span className="status-pill-high-fid p2-turn">YOUR TURN</span>
              ) : (
                <span className="status-pill-high-fid waiting">WAITING...</span>
              )}
            </div>
            <div className="card-player-info">
              <div className="player-avatar-wrapper p2-avatar">
                <svg
                  className="avatar-svg"
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
              <h2 className="player-name-text">{p2.displayName}</h2>
            </div>
            <div className="player-stats-subgrid">
              <div className="stat-box">
                <span className="stat-label">Rank</span>
                <span className="stat-value">{player2Stats.rank}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">{player2Stats.winRate}</span>
              </div>
            </div>
          </div>

          {/* Voice Lobby */}
          <div className="voice-lobby-card">
            <h3 className="voice-lobby-title">VOICE LOBBY</h3>
            <div className="voice-lobby-body">
              <div className="voice-status">
                <span className="voice-active-dot" />
                Connected
              </div>
              <div className="voice-controls">
                <button
                  onClick={() => setMicMuted(!micMuted)}
                  className={`voice-btn ${micMuted ? "muted" : ""}`}
                  aria-label={micMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {micMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="voice-svg"
                    >
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="voice-svg"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => setSpeakerMuted(!speakerMuted)}
                  className={`voice-btn ${speakerMuted ? "muted" : ""}`}
                  aria-label={speakerMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {speakerMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="voice-svg"
                    >
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v6a3 3 0 0 0 3 3H8a3 3 0 0 0-3-3V9a3 3 0 0 0 3-3h4" />
                      <path d="M17.54 8.46a5 5 0 0 1 0 7.07M20.36 5.64a9 9 0 0 1 0 12.72" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="voice-svg"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Room Code */}
          <div className="room-code-widget-match">
            <span className="room-code-title">ROOM CODE</span>
            <div className="room-code-row">
              <span className="room-code-val">[VB] - A 4 7 X</span>
              <button
                className={`room-code-copy-btn ${copied ? "copied" : ""}`}
                onClick={handleCopyRoomCode}
                aria-label="Copy Room Code"
              >
                {copied ? (
                  <span className="copied-text">Copied!</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="copy-svg"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CaroMatchPage() {
  const matchSource = useMemo(
    () => createLocalCaroMatchSource({ matchId: "demo-caro", nowMs: 1_000 }),
    [],
  );
  const snapshot = useSyncExternalStore(
    matchSource.subscribe,
    matchSource.getSnapshot,
    matchSource.getSnapshot,
  );
  const publicState = getCaroPublicState(snapshot.match);
  const winner = snapshot.match.players.find(
    (player) => player.seatIndex === snapshot.match.result.winnerSeatIndex,
  );
  const matchCompleted = snapshot.match.status === "completed";
  const handleCellSelect = useCallback(
    (row: number, column: number) => {
      matchSource.submitMove(row, column);
    },
    [matchSource],
  );

  // Mute toggles for Voice Lobby
  const [micMuted, setMicMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  // Copy status tooltip
  const [copied, setCopied] = useState(false);

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText("VB-A47X");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Static stats for players
  const player1Stats = { rank: "#12", winRate: "74%" };
  const player2Stats = { rank: "#42", winRate: "61%" };

  const p1 = snapshot.match.players[0] || { displayName: "Player One" };
  const p2 = snapshot.match.players[1] || { displayName: "CyberGhost" };

  const isP1Turn = snapshot.match.turn.activeSeatIndex === 0;
  const isP2Turn = snapshot.match.turn.activeSeatIndex === 1;

  return (
    <section className="screen match-screen-high-fid" aria-labelledby="match-title">
      <header className="match-header-block">
        <h1 id="match-title" className="match-visible-title">
          Caro Match
        </h1>
        <p className="match-subtitle-text">Local Practice Arena</p>
      </header>
      <div className="match-layout-high-fid">
        {/* Left Column: Player One Card & Match History */}
        <div className="match-col match-left-col">
          {/* Player 1 Card */}
          <div className="player-status-card p1-card">
            <div className="card-header-status">
              {!matchCompleted && isP1Turn ? (
                <span className="status-pill-high-fid p1-turn">YOUR TURN</span>
              ) : (
                <span className="status-pill-high-fid waiting">WAITING...</span>
              )}
            </div>
            <div className="card-player-info">
              <div className="player-avatar-wrapper p1-avatar">
                <svg
                  className="avatar-svg"
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
              <h2 className="player-name-text">{p1.displayName}</h2>
            </div>
            <div className="player-stats-subgrid">
              <div className="stat-box">
                <span className="stat-label">Rank</span>
                <span className="stat-value">{player1Stats.rank}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">{player1Stats.winRate}</span>
              </div>
            </div>
          </div>

          {/* Match History */}
          <div className="match-history-card">
            <div className="history-header">
              <h3 id="move-log-title" className="history-title">
                <svg
                  className="history-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                MATCH HISTORY
              </h3>
            </div>
            <div className="history-logs-container">
              {snapshot.moveLogEntries.length === 0 ? (
                <p className="no-moves-placeholder">No moves yet. Make a move on the board!</p>
              ) : (
                <ol className="history-list-flow">
                  {snapshot.moveLogEntries.map((move, idx) => {
                    const isP1 = move.actorSeatIndex === 0;
                    return (
                      <li key={move.id} className="history-log-item">
                        <span className={`bullet-badge ${isP1 ? "p1-bullet" : "p2-bullet"}`}>
                          {idx + 1}
                        </span>
                        <span className="log-text-content">
                          {isP1 ? "P1" : "P2"} placed stone at R{Number(move.payload.row) + 1} C
                          {Number(move.payload.column) + 1}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              {!matchCompleted && (
                <div className="waiting-for-move-row">
                  <span className="pulsing-status-dot" />
                  <span className="waiting-text">Waiting for move...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Timer & Turn, Board, Game Controls */}
        <div className="match-col match-center-col">
          {/* Timer & Turn HUD */}
          <div className="match-hud-bar">
            <div className="hud-turn-display">
              <span
                className={`hud-pulse-dot ${!matchCompleted && isP1Turn ? "p1-active" : "p2-active"}`}
              />
              <span className="hud-turn-text">
                {matchCompleted
                  ? winner
                    ? `${winner.displayName.toUpperCase()} WINS`
                    : "DRAW MATCH"
                  : isP1Turn
                    ? "YOUR TURN"
                    : "OPPONENT'S TURN"}
              </span>
            </div>
            <div className="hud-timer-display">
              <span className="hud-timer-text">| 00:24</span>
            </div>
          </div>

          {/* Interactive Game Board */}
          <div className="board-stage-wrapper caro-board-wrapper">
            <CaroPixiBoard
              disabled={matchCompleted}
              onCellSelect={handleCellSelect}
              state={publicState}
            />
          </div>

          {/* Bottom Game Controls */}
          <div className="game-controls-row">
            <button
              className="control-btn reset-btn"
              type="button"
              onClick={() => matchSource.reset()}
              aria-label="Reset local match"
            >
              <svg
                className="control-svg-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              RESET GAME
            </button>

            <button
              className="control-btn draw-btn"
              type="button"
              disabled={matchCompleted}
              onClick={() => alert("Draw offered to opponent!")}
            >
              <svg
                className="control-svg-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              OFFER DRAW
            </button>

            <button
              className="control-btn forfeit-btn"
              type="button"
              disabled={matchCompleted}
              onClick={() => alert("You have forfeited the match.")}
            >
              <svg
                className="control-svg-icon"
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
              FORFEIT
            </button>
          </div>
        </div>

        {/* Right Column: Player Two Card, Voice Lobby, Room Code */}
        <div className="match-col match-right-col">
          {/* Player 2 Card */}
          <div className="player-status-card p2-card">
            <div className="card-header-status">
              {!matchCompleted && isP2Turn ? (
                <span className="status-pill-high-fid p2-turn">YOUR TURN</span>
              ) : (
                <span className="status-pill-high-fid waiting">WAITING...</span>
              )}
            </div>
            <div className="card-player-info">
              <div className="player-avatar-wrapper p2-avatar">
                <svg
                  className="avatar-svg"
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
              <h2 className="player-name-text">{p2.displayName}</h2>
            </div>
            <div className="player-stats-subgrid">
              <div className="stat-box">
                <span className="stat-label">Rank</span>
                <span className="stat-value">{player2Stats.rank}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Win Rate</span>
                <span className="stat-value">{player2Stats.winRate}</span>
              </div>
            </div>
          </div>

          {/* Voice Lobby */}
          <div className="voice-lobby-card">
            <h3 className="voice-lobby-title">VOICE LOBBY</h3>
            <div className="voice-lobby-body">
              <div className="voice-status">
                <span className="voice-active-dot" />
                Connected
              </div>
              <div className="voice-controls">
                <button
                  onClick={() => setMicMuted(!micMuted)}
                  className={`voice-btn ${micMuted ? "muted" : ""}`}
                  aria-label={micMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {micMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="voice-svg"
                    >
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="voice-svg"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => setSpeakerMuted(!speakerMuted)}
                  className={`voice-btn ${speakerMuted ? "muted" : ""}`}
                  aria-label={speakerMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {speakerMuted ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="voice-svg"
                    >
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v6a3 3 0 0 0 3 3H8a3 3 0 0 0-3-3V9a3 3 0 0 0 3-3h4" />
                      <path d="M17.54 8.46a5 5 0 0 1 0 7.07M20.36 5.64a9 9 0 0 1 0 12.72" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="voice-svg"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Room Code */}
          <div className="room-code-widget-match">
            <span className="room-code-title">ROOM CODE</span>
            <div className="room-code-row">
              <span className="room-code-val">[VB] - A 4 7 X</span>
              <button
                className={`room-code-copy-btn ${copied ? "copied" : ""}`}
                onClick={handleCopyRoomCode}
                aria-label="Copy Room Code"
              >
                {copied ? (
                  <span className="copied-text">Copied!</span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="copy-svg"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
