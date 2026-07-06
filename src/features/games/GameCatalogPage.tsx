import { staticGames } from "@/shared/constants/staticDemoData";

export function GameCatalogPage() {
  return (
    <section className="screen" aria-labelledby="games-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Catalog</p>
        <h1 id="games-title">Games</h1>
        <p>
          Review the first playable game paths before backend writes exist. Actions stay disabled
          until Firebase and match rules are connected.
        </p>
      </header>

      <div className="game-grid">
        {staticGames.map((game) => (
          <article className="panel game-card" key={game.id}>
            <div>
              <p className="meta-label">{game.status}</p>
              <h2>{game.name}</h2>
              <p>{game.summary}</p>
            </div>
            <dl className="compact-facts" aria-label={`${game.name} facts`}>
              <div>
                <dt>Players</dt>
                <dd>{game.players}</dd>
              </div>
              <div>
                <dt>Round</dt>
                <dd>{game.roundTime}</dd>
              </div>
            </dl>
            <button type="button" disabled aria-label={`Open ${game.name} lobby`}>
              Open lobby
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
