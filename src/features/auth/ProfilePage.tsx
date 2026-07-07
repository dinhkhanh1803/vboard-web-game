type SkillMetric = {
  label: string;
  value: number;
  tone: "primary" | "secondary";
};

type MatchHistoryRow = {
  game: string;
  result: "Victory" | "Defeat";
  opponent: string;
  duration: string;
  date: string;
  iconTone: "blue" | "coral";
};

const headlineStats = [
  { label: "Total Wins", value: "1,248", delta: "+12 Today", tone: "success" },
  { label: "Total Losses", value: "314", delta: "-2 Today", tone: "danger" },
] as const;

const skillMetrics: SkillMetric[] = [
  { label: "Tactics", value: 94, tone: "primary" },
  { label: "Economy", value: 82, tone: "secondary" },
  { label: "Speed", value: 88, tone: "secondary" },
  { label: "Luck", value: 45, tone: "primary" },
];

const weeklyActivity = [42, 61, 55, 100, 58, 51, 28];

const matchHistoryRows: MatchHistoryRow[] = [
  {
    game: "Neon Chess",
    result: "Victory",
    opponent: "CyberKnight_99",
    duration: "14:22",
    date: "Today, 2:45 PM",
    iconTone: "blue",
  },
  {
    game: "Deck Masters",
    result: "Defeat",
    opponent: "Glitch_Void",
    duration: "08:15",
    date: "Yesterday",
    iconTone: "coral",
  },
  {
    game: "Grid Shift",
    result: "Victory",
    opponent: "StrategyKing",
    duration: "22:01",
    date: "Nov 22 2023",
    iconTone: "blue",
  },
  {
    game: "Neon Chess",
    result: "Victory",
    opponent: "Dark_Aether",
    duration: "12:50",
    date: "Nov 21 2023",
    iconTone: "blue",
  },
  {
    game: "Deck Masters",
    result: "Victory",
    opponent: "RogueOne",
    duration: "19:34",
    date: "Nov 20 2023",
    iconTone: "coral",
  },
];

export function ProfilePage() {
  return (
    <section className="profile-screen" aria-labelledby="profile-title">
      <div className="profile-dashboard-grid">
        <ProfileHero />
        <section className="profile-stat-grid" aria-label="Profile headline stats">
          {headlineStats.map((stat) => (
            <article className={`profile-stat-card is-${stat.tone}`} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.delta}</small>
            </article>
          ))}
          <article className="profile-win-rate-card">
            <div>
              <span>Win Rate</span>
              <strong>79.8%</strong>
            </div>
            <div className="profile-rate-ring" aria-hidden="true" />
          </article>
        </section>
        <SkillDistributionPanel />
        <RecentMatchHistory />
      </div>
    </section>
  );
}

function ProfileHero() {
  return (
    <section className="profile-hero-card" aria-labelledby="profile-title">
      <div className="profile-avatar-frame" aria-label="Player One avatar">
        <img
          src="/assets/images/avatar.png"
          alt="Player One avatar"
          className="profile-avatar-img"
        />
        <span className="profile-level-pill">LV. 94</span>
      </div>

      <div className="profile-hero-copy">
        <h1 id="profile-title">Player One</h1>
        <div className="profile-rank-row">
          <span>Grandmaster II</span>
          <span>EST. JUNE 2023</span>
        </div>
        <p>
          Dedicated board game strategist specialized in high-speed tactical RPGs and complex deck
          management games. Top 0.5% in global win streaks.
        </p>
      </div>

      <aside className="profile-global-rank" aria-label="Global rank">
        <span>Global Rank</span>
        <strong>#422</strong>
      </aside>
      <p className="profile-sidebar-rank">Rank: Grandmaster</p>
    </section>
  );
}

function SkillDistributionPanel() {
  return (
    <section className="profile-skill-card" aria-labelledby="skill-distribution-title">
      <div className="profile-card-title-row">
        <h2 id="skill-distribution-title">Skill Distribution</h2>
        <button type="button" aria-label="Inspect skill distribution" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5h14v14H5zM8 16l3-3 2 2 3-5" />
          </svg>
        </button>
      </div>

      <div className="profile-skill-list">
        {skillMetrics.map((skill) => (
          <div className="profile-skill-row" key={skill.label}>
            <div>
              <span>{skill.label}</span>
              <strong>{skill.value}%</strong>
            </div>
            <div className="profile-skill-track" aria-hidden="true">
              <span className={`is-${skill.tone}`} style={{ width: `${skill.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <section className="profile-weekly-activity" aria-label="Weekly activity chart">
        <h3>Weekly Activity</h3>
        <div className="profile-activity-bars">
          {weeklyActivity.map((value, index) => (
            <span key={`${value}-${index}`} style={{ height: `${value}%` }} />
          ))}
        </div>
      </section>
    </section>
  );
}

function RecentMatchHistory() {
  return (
    <section className="profile-history-card" aria-labelledby="recent-match-history-title">
      <div className="profile-card-title-row">
        <h2 id="recent-match-history-title">Recent Match History</h2>
        <div className="profile-history-tabs" aria-label="History filters">
          <button type="button" disabled>
            All
          </button>
          <button type="button" disabled>
            Ranked
          </button>
        </div>
      </div>

      <div className="profile-history-table" role="table" aria-label="Recent match history">
        <div className="profile-history-row is-head" role="row">
          <span role="columnheader">Game Type</span>
          <span role="columnheader">Result</span>
          <span role="columnheader">Opponent</span>
          <span role="columnheader">Duration</span>
          <span role="columnheader">Date</span>
        </div>
        {matchHistoryRows.map((match) => (
          <div className="profile-history-row" role="row" key={`${match.game}-${match.opponent}`}>
            <span className="profile-game-cell" role="cell">
              <span className={`profile-game-icon is-${match.iconTone}`} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M7 7h10v10H7zM10 10h4v4h-4z" />
                </svg>
              </span>
              <strong>{match.game}</strong>
            </span>
            <span role="cell">
              <span className={`profile-result-badge is-${match.result.toLowerCase()}`}>
                {match.result}
              </span>
            </span>
            <span role="cell">{match.opponent}</span>
            <span role="cell" className="profile-duration-cell">
              {match.duration}
            </span>
            <span role="cell">{match.date}</span>
          </div>
        ))}
      </div>

      <button type="button" className="profile-full-history-btn" disabled>
        View full history
      </button>
    </section>
  );
}
