import { publicRooms } from "@/shared/constants/staticDemoData";

export function LobbyPage() {
  return (
    <section className="screen" aria-labelledby="lobby-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Rooms</p>
        <h1 id="lobby-title">Lobby</h1>
        <p>
          Entry points are visible now, but all actions remain local-only until backend contracts
          exist.
        </p>
      </header>

      <div className="two-column-layout">
        <section className="panel" aria-labelledby="quick-match-title">
          <h2 id="quick-match-title">Quick Match</h2>
          <p>Matchmaking placeholder for the first Connect 4 queue.</p>
          <button type="button" disabled>
            Find quick match
          </button>
        </section>

        <section className="panel" aria-labelledby="join-room-title">
          <h2 id="join-room-title">Join By Code</h2>
          <label className="field-label" htmlFor="room-code">
            Room code
          </label>
          <input id="room-code" name="room-code" placeholder="VB-1042" />
          <button type="button" disabled>
            Join room
          </button>
        </section>
      </div>

      <section className="panel table-panel" aria-labelledby="public-rooms-title">
        <h2 id="public-rooms-title">Public Rooms</h2>
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
        <p>
          Static room state for reviewing invite, player slots, ready check, and start controls.
        </p>
      </header>

      <div className="two-column-layout">
        <section className="panel stack-panel" aria-labelledby="room-code-title">
          <p className="meta-label">Room Code</p>
          <h2 id="room-code-title">VB-1042</h2>
          <p>Invite link and room ownership will be generated after Firebase Functions exist.</p>
          <button type="button" disabled>
            Copy invite link
          </button>
        </section>

        <section className="panel stack-panel" aria-labelledby="ready-check-title">
          <p className="meta-label">Ready Check</p>
          <h2 id="ready-check-title">2 Player Slots</h2>
          <ul className="status-list">
            <li>Host: Khanh - ready</li>
            <li>Opponent: waiting</li>
          </ul>
          <button type="button" disabled>
            Start match
          </button>
        </section>
      </div>
    </section>
  );
}
