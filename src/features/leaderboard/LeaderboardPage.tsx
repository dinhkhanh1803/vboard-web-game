import {
  demoLeaderboardEntries,
  formatRecord,
  getDisplayNameForGame,
} from "@/shared/constants/progressionFixtures";

export function LeaderboardPage() {
  return (
    <section className="screen" aria-labelledby="leaderboard-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Ranking</p>
        <h1 id="leaderboard-title">Leaderboard</h1>
        <p>Contract-backed ranking preview before public Firebase reads are wired.</p>
      </header>

      <section className="panel table-panel" aria-label="Season leaderboard preview">
        <div className="table-like leaderboard-table" role="table" aria-label="Leaderboard entries">
          <div role="row" className="table-row table-head leaderboard-row">
            <span role="columnheader">Season Rank</span>
            <span role="columnheader">Player</span>
            <span role="columnheader">Game</span>
            <span role="columnheader">Elo</span>
            <span role="columnheader">Win Rate</span>
            <span role="columnheader">Record</span>
          </div>
          {demoLeaderboardEntries.map((entry) => (
            <div
              role="row"
              className="table-row leaderboard-row"
              key={`${entry.gameId}-${entry.uid}`}
            >
              <span role="cell">#{entry.rank}</span>
              <span role="cell">{entry.displayName}</span>
              <span role="cell">{getDisplayNameForGame(entry.gameId)}</span>
              <span role="cell">{entry.elo}</span>
              <span role="cell">{entry.winRatePercent}%</span>
              <span role="cell">
                {formatRecord({ draws: entry.draws, losses: entry.losses, wins: entry.wins })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
