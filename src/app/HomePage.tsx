import { Link } from "react-router-dom";

import { techStack } from "@/shared/constants/techStack";

export function HomePage() {
  return (
    <section className="app-hero home-hero" aria-labelledby="app-title">
      <div className="home-hero-layout">
        <div className="home-hero-copy">
          <p className="app-kicker">Realtime board game arena</p>
          <h1 id="app-title">VBoard Arena</h1>
          <p className="app-copy">
            Jump into local Connect 4, inspect the lobby flow, and keep the Firebase wiring behind a
            controlled boundary until the UI feels right.
          </p>
          <div className="hero-actions" aria-label="Primary game actions">
            <Link className="button-link primary-action" to="/matches/demo-match">
              Play Connect 4
            </Link>
            <Link className="button-link secondary-action" to="/lobby">
              Open Lobby
            </Link>
          </div>
        </div>

        <aside className="panel hero-panel" aria-label="Current build status">
          <p className="meta-label">Playable now</p>
          <h2>Local web preview</h2>
          <p>PixiJS boards and local match state are ready for UI review before backend writes.</p>
          <dl className="compact-facts">
            <div>
              <dt>Renderer</dt>
              <dd>{techStack.renderer}</dd>
            </div>
            <div>
              <dt>Web</dt>
              <dd>{techStack.app}</dd>
            </div>
            <div>
              <dt>Backend</dt>
              <dd>Firebase later</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
