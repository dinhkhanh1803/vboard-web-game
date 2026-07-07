import { Link } from "react-router-dom";

import { staticGames } from "@/shared/constants/staticDemoData";

function getGameAction(gameId: string) {
  if (gameId === "connect-4") {
    return {
      href: "/matches/demo-match",
      label: "Play Connect 4 demo",
      status: "Playable now",
      disabled: false,
    };
  }

  return {
    href: "/matches/demo-caro",
    label: "Caro demo locked",
    status: "Preview locked",
    disabled: true,
  };
}

export function GameCatalogPage() {
  return (
    <section className="screen" aria-labelledby="games-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Catalog</p>
        <h1 id="games-title">Games</h1>
        <p>
          Pick a playable local demo or inspect upcoming games before matchmaking and Firebase reads
          are connected.
        </p>
      </header>

      <div className="game-grid polished-game-grid">
        {staticGames.map((game) => {
          const action = getGameAction(game.id);

          return (
            <article className="panel game-card polished-game-card" key={game.id}>
              <div className="panel-title-row">
                <div>
                  <p className="meta-label">{action.status}</p>
                  <h2>{game.name}</h2>
                </div>
                <span className="status-pill">{game.players}</span>
              </div>
              <p>{game.summary}</p>
              <dl className="compact-facts" aria-label={`${game.name} facts`}>
                <div>
                  <dt>Round</dt>
                  <dd>{game.roundTime}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{game.status}</dd>
                </div>
              </dl>
              <div className="game-card-actions">
                {action.disabled ? (
                  <button type="button" disabled aria-label={action.label}>
                    Coming soon
                  </button>
                ) : (
                  <Link className="button-link primary-action" to={action.href}>
                    {action.label}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
