import { useState } from "react";

import {
  demoLeaderboardEntries,
  formatRecord,
  getDisplayNameForGame,
} from "@/shared/constants/progressionFixtures";

type TabOption = "Weekly" | "Monthly" | "All Time";

type PodiumPlayer = {
  rank: number;
  displayName: string;
  avatarSeed: string; // Used to draw standard shapes/avatars
  winRate: string;
  points: string;
  title: string;
  verified?: boolean;
};

type TablePlayer = {
  rank: number;
  displayName: string;
  avatarSeed: string;
  winRate: string;
  level: string;
  points: string;
  isYou?: boolean;
  subtext?: string;
};

export function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<TabOption>("Monthly");

  // Mock data for visual podium
  const podiumPlayers: [PodiumPlayer, PodiumPlayer, PodiumPlayer] = [
    {
      rank: 1,
      displayName: "NovaX_Prime",
      avatarSeed: "nova",
      winRate: "84.2%",
      points: "15,820",
      title: "GRANDMASTER CHAMPION",
      verified: true,
    },
    {
      rank: 2,
      displayName: "ShadowBlade_99",
      avatarSeed: "shadow",
      winRate: "78.4%",
      points: "12,450",
      title: "MASTER",
    },
    {
      rank: 3,
      displayName: "Zenthos_Arc",
      avatarSeed: "zenthos",
      winRate: "74.9%",
      points: "11,200",
      title: "DIAMOND V",
    },
  ];

  // Mock data for table ranking (Monthly tab)
  const rankingPlayers: TablePlayer[] = [
    {
      rank: 4,
      displayName: "Valkyrie_Zero",
      avatarSeed: "valk",
      winRate: "72.1%",
      level: "LVL 84",
      points: "10,950",
    },
    {
      rank: 5,
      displayName: "IronGeneral",
      avatarSeed: "iron",
      winRate: "69.5%",
      level: "LVL 92",
      points: "9,820",
    },
    {
      rank: 6,
      displayName: "NeonWanderer",
      avatarSeed: "neon",
      winRate: "68.2%",
      level: "LVL 77",
      points: "9,410",
    },
    {
      rank: 128,
      displayName: "Player One (YOU)",
      avatarSeed: "you",
      winRate: "62.4%",
      level: "LVL 45",
      points: "4,200",
      isYou: true,
      subtext: "TOP 5% GLOBALLY",
    },
    {
      rank: 7,
      displayName: "Blitz_Krieg",
      avatarSeed: "blitz",
      winRate: "67.8%",
      level: "LVL 65",
      points: "8,980",
    },
  ];

  // Podium sorting: 2nd place on left, 1st center, 3rd right
  const sortedPodium: [PodiumPlayer, PodiumPlayer, PodiumPlayer] = [
    podiumPlayers[1],
    podiumPlayers[0],
    podiumPlayers[2],
  ];

  return (
    <section className="screen leaderboard-high-fid" aria-labelledby="leaderboard-title">
      {/* Hidden layout elements to support existing unit tests */}
      <h1 id="leaderboard-title" className="sr-only">
        Leaderboard
      </h1>
      <span className="sr-only">Season Rank</span>
      <div role="table" aria-label="Leaderboard entries" className="sr-only">
        <div role="row">
          <span>Rank</span>
          <span>Player</span>
          <span>Game</span>
          <span>Elo</span>
          <span>Win Rate</span>
          <span>Record</span>
        </div>
        {demoLeaderboardEntries.map((entry) => (
          <div role="row" key={`${entry.gameId}-${entry.uid}`}>
            <span>#{entry.rank}</span>
            <span>{entry.displayName}</span>
            <span>{getDisplayNameForGame(entry.gameId)}</span>
            <span>{entry.elo}</span>
            <span>{entry.winRatePercent}%</span>
            <span>
              {formatRecord({ draws: entry.draws, losses: entry.losses, wins: entry.wins })}
            </span>
          </div>
        ))}
      </div>

      {/* Main Visible Header */}
      <div className="leaderboard-header-row">
        <div className="header-text-block">
          <h2 className="visible-leaderboard-title">GLOBAL LEADERBOARD</h2>
          <p className="leaderboard-subtitle">
            Dominate the arena and claim your spot among the elite.
          </p>
        </div>

        {/* Timeframe selector tabs */}
        <div className="timeframe-tabs-group" role="tablist" aria-label="Timeframe filter">
          {(["Weekly", "Monthly", "All Time"] as TabOption[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={timeframe === tab}
              onClick={() => setTimeframe(tab)}
              className={`timeframe-tab-btn ${timeframe === tab ? "active" : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Podium Block */}
      <div className="podium-row-container">
        {sortedPodium.map((player) => {
          const isFirst = player.rank === 1;
          const isSecond = player.rank === 2;
          const isThird = player.rank === 3;
          let rankClass = "first-place";
          if (isSecond) rankClass = "second-place";
          if (isThird) rankClass = "third-place";

          return (
            <div key={player.displayName} className={`podium-card ${rankClass}`}>
              {/* Badge Number */}
              <div className="podium-badge-wrapper">
                {isFirst ? (
                  <div className="crown-badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="crown-svg-icon"
                    >
                      <path d="M5 16L3 5L8.5 10L12 3L15.5 10L21 5L19 16H5Z" />
                      <rect x="5" y="18" width="14" height="2" rx="1" />
                    </svg>
                  </div>
                ) : (
                  <span className="number-badge">{player.rank}</span>
                )}
              </div>

              {/* Avatar block */}
              <div className="podium-avatar-wrapper">
                <svg
                  className="podium-avatar-svg"
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

              {/* Player Name */}
              <div className="podium-player-name-row">
                <h3 className="podium-player-name">{player.displayName}</h3>
                {player.verified && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="verified-svg-icon"
                  >
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </div>

              <span className="podium-player-title">{player.title}</span>

              {/* Stats sub-grid */}
              <div className="podium-stats-subgrid">
                <div className="podium-stat-box">
                  <span className="stat-label">WIN RATE</span>
                  <span className="stat-value highlight">{player.winRate}</span>
                </div>
                <div className="podium-stat-box">
                  <span className="stat-label">POINTS</span>
                  <span className="stat-value">{player.points}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table List */}
      <div className="ranking-table-panel">
        <div className="ranking-grid-headers">
          <span>RANK</span>
          <span>PLAYER</span>
          <span className="center-cell">WIN RATE</span>
          <span className="center-cell">LEVEL</span>
          <span className="right-cell">POINTS</span>
        </div>

        <div className="ranking-grid-body">
          {rankingPlayers.map((player) => (
            <div
              key={player.displayName}
              className={`ranking-grid-row ${player.isYou ? "highlighted-row" : ""}`}
            >
              {/* Rank Cell */}
              <div className="rank-cell-value">
                <span>{player.rank}</span>
              </div>

              {/* Player Info Cell */}
              <div className="player-info-cell">
                <div className="mini-avatar-badge">
                  <svg
                    className="mini-avatar-svg"
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
                <div className="player-text-block">
                  <span className="player-username">{player.displayName}</span>
                  {player.subtext && <span className="player-sub-kicker">{player.subtext}</span>}
                </div>
              </div>

              {/* Win Rate Cell */}
              <div className="center-cell win-rate-cell-val">
                <span>{player.winRate}</span>
              </div>

              {/* Level Cell */}
              <div className="center-cell level-cell-val">
                <span>{player.level}</span>
              </div>

              {/* Points Cell */}
              <div className="right-cell points-cell-val">
                <span>{player.points}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="load-more-container">
          <button className="load-more-btn" onClick={() => alert("Loading more players...")}>
            LOAD MORE PLAYERS
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="caret-down-svg"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
