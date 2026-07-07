import {
  demoGameFeatureFlags,
  demoModerationReports,
  formatFeatureFlagMatchmaking,
  formatFeatureFlagVisibility,
  getReportCollectionLabel,
} from "@/shared/constants/moderationFixtures";

export function AdminPage() {
  return (
    <section className="screen" aria-labelledby="admin-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Operations</p>
        <h1 id="admin-title">Admin Console</h1>
        <p>
          Contract-backed controls for moderation and game safety. Firebase Auth claims, rules, and
          live writes are intentionally not connected yet.
        </p>
      </header>

      <div className="admin-dashboard-grid">
        <section className="panel admin-panel" aria-labelledby="moderation-queue-title">
          <div className="panel-title-row">
            <div>
              <p className="meta-label">{getReportCollectionLabel()}</p>
              <h2 id="moderation-queue-title">Moderation Queue</h2>
            </div>
            <span className="status-pill">Preview</span>
          </div>

          <ul className="admin-list" aria-label="Moderation report preview list">
            {demoModerationReports.map((report) => (
              <li key={report.id}>
                <div>
                  <strong>{report.reportedDisplayName}</strong>
                  <span>{report.details}</span>
                </div>
                <dl className="compact-facts admin-inline-facts">
                  <div>
                    <dt>Reason</dt>
                    <dd>{report.reason}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{report.status}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel admin-panel" aria-labelledby="feature-flags-title">
          <div className="panel-title-row">
            <div>
              <p className="meta-label">appConfig/gameFlags</p>
              <h2 id="feature-flags-title">Feature Flags</h2>
            </div>
            <span className="status-pill">Local</span>
          </div>

          <ul className="admin-list" aria-label="Game feature flag preview list">
            {demoGameFeatureFlags.map((flag) => (
              <li key={flag.id}>
                <div>
                  <strong>{flag.displayName}</strong>
                  <span>{flag.status}</span>
                </div>
                <dl className="compact-facts admin-inline-facts">
                  <div>
                    <dt>Matchmaking</dt>
                    <dd>{formatFeatureFlagMatchmaking(flag)}</dd>
                  </div>
                  <div>
                    <dt>Catalog</dt>
                    <dd>{formatFeatureFlagVisibility(flag)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
