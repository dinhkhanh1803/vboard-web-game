import { useMemo, useState } from "react";

import { publicRooms } from "@/shared/constants/staticDemoData";

const roomCodePattern = /^VB-\d{4}$/;

export function LobbyPage() {
  const [roomCode, setRoomCode] = useState("");
  const normalizedRoomCode = roomCode.trim().toUpperCase();
  const hasRoomCode = normalizedRoomCode.length > 0;
  const isRoomCodeValid = roomCodePattern.test(normalizedRoomCode);
  const roomCodeStatus = useMemo(() => {
    if (!hasRoomCode) {
      return "Enter a room code to preview validation.";
    }

    if (!isRoomCodeValid) {
      return "Use a code like VB-1042.";
    }

    return "Code format ready for backend wiring.";
  }, [hasRoomCode, isRoomCodeValid]);

  return (
    <section className="screen" aria-labelledby="lobby-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Rooms</p>
        <h1 id="lobby-title">Lobby</h1>
        <p>
          Find a local preview path, validate room codes, and review public rooms before backend
          matchmaking is connected.
        </p>
      </header>

      <div className="two-column-layout lobby-entry-grid">
        <section className="panel lobby-action-panel" aria-labelledby="quick-match-title">
          <div className="panel-title-row">
            <div>
              <p className="meta-label">Connect 4 queue</p>
              <h2 id="quick-match-title">Quick Match</h2>
            </div>
            <span className="status-pill">UI-only preview</span>
          </div>
          <p>Matchmaking is intentionally disabled until Cloud Functions owns the queue.</p>
          <button type="button" disabled>
            Find quick match
          </button>
        </section>

        <section className="panel lobby-action-panel" aria-labelledby="join-room-title">
          <div className="panel-title-row">
            <div>
              <p className="meta-label">Manual entry</p>
              <h2 id="join-room-title">Join By Code</h2>
            </div>
            <span className="status-pill">UI-only preview</span>
          </div>
          <label className="field-label" htmlFor="room-code">
            Room code
          </label>
          <input
            id="room-code"
            name="room-code"
            onChange={(event) => setRoomCode(event.target.value)}
            placeholder="VB-1042"
            value={roomCode}
          />
          <p className={`field-help form-status ${isRoomCodeValid ? "is-success" : "is-error"}`}>
            {roomCodeStatus}
          </p>
          <button type="button" disabled={!isRoomCodeValid}>
            Join room preview
          </button>
        </section>
      </div>

      <section className="panel table-panel" aria-labelledby="public-rooms-title">
        <div className="panel-title-row public-room-heading">
          <div>
            <p className="meta-label">Local room list</p>
            <h2 id="public-rooms-title">Public Rooms</h2>
          </div>
          <span className="status-pill">Preview data</span>
        </div>
        <div className="table-like" role="table" aria-label="Public rooms preview">
          <div role="row" className="table-row table-head">
            <span role="columnheader">Code</span>
            <span role="columnheader">Game</span>
            <span role="columnheader">Host</span>
            <span role="columnheader">Seats</span>
            <span role="columnheader">Status</span>
          </div>
          {publicRooms.map((room) => (
            <div role="row" className="table-row" key={room.code}>
              <span role="cell">{room.code}</span>
              <span role="cell">{room.game}</span>
              <span role="cell">{room.host}</span>
              <span role="cell">{room.seats}</span>
              <span role="cell">{room.status}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export function WaitingRoomPage() {
  return (
    <section className="screen" aria-labelledby="waiting-room-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Waiting room</p>
        <h1 id="waiting-room-title">Waiting Room</h1>
        <p>Static room state for reviewing invite flow, player slots, and ready check clarity.</p>
      </header>

      <div className="two-column-layout waiting-room-layout">
        <section className="panel stack-panel room-code-card" aria-labelledby="room-code-title">
          <p className="meta-label">Room Code</p>
          <h2 id="room-code-title" className="room-code-display">
            VB-1042
          </h2>
          <p>Local room preview</p>
          <dl className="compact-facts">
            <div>
              <dt>Game</dt>
              <dd>Connect 4</dd>
            </div>
            <div>
              <dt>Seats</dt>
              <dd>1 of 2 filled</dd>
            </div>
          </dl>
          <button type="button" disabled>
            Copy invite link
          </button>
        </section>

        <section className="panel stack-panel" aria-labelledby="ready-check-title">
          <p className="meta-label">Ready Check</p>
          <h2 id="ready-check-title">Player Slots</h2>
          <ul className="room-player-list" aria-label="Waiting room player slots">
            <li className="room-player-row is-ready">
              <span className="room-player-marker" aria-hidden="true" />
              <div>
                <strong>Khanh</strong>
                <span>Host ready</span>
              </div>
            </li>
            <li className="room-player-row">
              <span className="room-player-marker" aria-hidden="true" />
              <div>
                <strong>Open seat</strong>
                <span>Opponent slot open</span>
              </div>
            </li>
          </ul>
          <button type="button" disabled>
            Start match
          </button>
        </section>
      </div>
    </section>
  );
}
