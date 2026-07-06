import { demoMoves } from "@/shared/constants/staticDemoData";

export function MatchPage() {
  return (
    <section className="screen match-screen" aria-labelledby="match-title">
      <header className="screen-header compact-screen-header">
        <p className="screen-eyebrow">Realtime play preview</p>
        <h1 id="match-title">Connect 4 Match</h1>
        <p>
          PixiJS will mount inside the board boundary; this screen only owns layout and intents.
        </p>
      </header>

      <div className="match-layout">
        <aside className="panel player-panel" aria-label="Player status">
          <div>
            <p className="meta-label">Red</p>
            <h2>Khanh</h2>
            <p>Turn ready</p>
          </div>
          <div>
            <p className="meta-label">Yellow</p>
            <h2>Arena Bot</h2>
            <p>Waiting</p>
          </div>
        </aside>

        <div className="board-stage" aria-label="PixiJS board mount">
          <div className="board-stage-label">Canvas placeholder</div>
          <div className="board-preview" aria-hidden="true">
            {Array.from({ length: 42 }, (_, index) => (
              <span
                key={index}
                className={index % 5 === 0 ? "disc red" : index % 7 === 0 ? "disc yellow" : "disc"}
              />
            ))}
          </div>
        </div>

        <aside className="panel move-panel" aria-labelledby="move-log-title">
          <h2 id="move-log-title">Move Log</h2>
          <ol>
            {demoMoves.map((move, index) => (
              <li key={`${move}-${index}`}>{move}</li>
            ))}
          </ol>
          <button type="button" disabled>
            Resign match
          </button>
        </aside>
      </div>
    </section>
  );
}
