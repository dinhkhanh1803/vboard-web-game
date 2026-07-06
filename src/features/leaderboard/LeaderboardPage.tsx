import { leaderboardPlayers } from "@/shared/constants/staticDemoData";

export function LeaderboardPage() {
  return (
    <section className="screen" aria-labelledby="leaderboard-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Ranking</p>
        <h1 id="leaderboard-title">Leaderboard</h1>
        <p>Static ranking view for approval before public reads and security rules are wired.</p>
      </header>

      <section className="panel table-panel" aria-label="Season leaderboard preview">
        <div className="table-like" role="table" aria-label="Season Rank">
          <div role="row" className="table-row table-head">
            <span role="columnheader">Season Rank</span>
            <span role="columnheader">Player</span>
            <span role="columnheader">Game</span>
            <span role="columnheader">Elo</span>
            <span role="columnheader">Record</span>
          </div>
          {leaderboardPlayers.map((player) => (
            <div role="row" className="table-row" key={player.rank}>
              <span role="cell">#{player.rank}</span>
              <span role="cell">{player.name}</span>
              <span role="cell">{player.game}</span>
              <span role="cell">{player.elo}</span>
              <span role="cell">{player.record}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
