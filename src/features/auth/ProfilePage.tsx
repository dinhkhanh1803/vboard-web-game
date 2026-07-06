export function ProfilePage() {
  return (
    <section className="screen" aria-labelledby="profile-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Identity</p>
        <h1 id="profile-title">Player Profile</h1>
        <p>
          Profile stats are mocked so the screen can be reviewed before auth providers are
          configured.
        </p>
      </header>

      <div className="two-column-layout">
        <section className="panel profile-summary" aria-label="Profile summary">
          <div className="avatar-placeholder" aria-hidden="true">
            VA
          </div>
          <div>
            <h2>Khanh</h2>
            <p>Level 1 - 320 XP</p>
          </div>
        </section>

        <section className="panel" aria-labelledby="profile-stats-title">
          <h2 id="profile-stats-title">Stats</h2>
          <dl className="compact-facts">
            <div>
              <dt>Elo</dt>
              <dd>1240</dd>
            </div>
            <div>
              <dt>Record</dt>
              <dd>12W 3L</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="panel" aria-labelledby="recent-matches-title">
        <h2 id="recent-matches-title">Recent Matches</h2>
        <ul className="status-list">
          <li>Connect 4 - win - +18 Elo</li>
          <li>Caro - preview match - no rating</li>
        </ul>
      </section>
    </section>
  );
}
