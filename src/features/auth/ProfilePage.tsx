import { useState } from "react";

import { moderationReportReasons } from "@contracts/moderationSafety";
import { gameIds, supportedAuthProviders, type GameId } from "@contracts/userProfile";

import { demoProfilePrimaryGameId, demoPublicProfile } from "@/shared/constants/profileFixtures";
import {
  demoMatchHistoryEntries,
  formatEloDelta,
  formatRecord,
  getDisplayNameForGame,
} from "@/shared/constants/progressionFixtures";
import { getReportCollectionLabel } from "@/shared/constants/moderationFixtures";

type AuthPreviewMode = "Email password" | "Google provider" | "Guest player";

const authModes = [
  {
    label: "Email password",
    provider: supportedAuthProviders[0],
    detail: "Future email/password sign-in and account creation flow.",
  },
  {
    label: "Google provider",
    provider: supportedAuthProviders[1],
    detail: "Future Google OAuth sign-in flow.",
  },
  {
    label: "Guest player",
    provider: supportedAuthProviders[2],
    detail: "Future temporary player profile for quick lobby entry.",
  },
] as const;

const primaryStats = demoPublicProfile.statsByGame[demoProfilePrimaryGameId];
const primaryRecord = `${primaryStats.wins}W ${primaryStats.losses}L`;

export function ProfilePage() {
  const [selectedMode, setSelectedMode] = useState<AuthPreviewMode>("Email password");
  const selectedModeConfig = authModes.find((mode) => mode.label === selectedMode) ?? authModes[0];

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

      <section className="panel auth-entry-panel" aria-labelledby="auth-entry-title">
        <div>
          <p className="meta-label">Phase 7 shell</p>
          <h2 id="auth-entry-title">Auth Entry</h2>
          <p>Firebase Auth is not connected yet.</p>
        </div>

        <form className="auth-form" aria-label="Email auth preview">
          <label>
            <span className="field-label">Email</span>
            <input type="email" name="email" autoComplete="email" placeholder="player@vboard.dev" />
          </label>
          <label>
            <span className="field-label">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Not connected yet"
            />
          </label>
          <button type="button" disabled>
            Continue with email
          </button>
        </form>

        <div className="auth-provider-grid" aria-label="Provider preview">
          <button type="button" disabled>
            Continue with Google
          </button>
          <button type="button" disabled>
            Continue as guest
          </button>
          <button type="button" onClick={() => setSelectedMode("Google provider")}>
            Preview Google
          </button>
          <button type="button" onClick={() => setSelectedMode("Guest player")}>
            Preview guest
          </button>
        </div>

        <section className="auth-mode-preview" aria-labelledby="selected-auth-mode-title">
          <p className="meta-label" id="selected-auth-mode-title">
            Selected mode
          </p>
          <h2>{selectedModeConfig.label}</h2>
          <p>{selectedModeConfig.detail}</p>
          <dl className="compact-facts">
            <div>
              <dt>Provider</dt>
              <dd>{selectedModeConfig.provider}</dd>
            </div>
          </dl>
        </section>
      </section>

      <div className="two-column-layout">
        <section className="panel profile-summary" aria-label="Profile summary">
          <div className="avatar-placeholder" aria-hidden="true">
            VA
          </div>
          <div>
            <h2>{demoPublicProfile.displayName}</h2>
            <p>
              Level {demoPublicProfile.level} - {demoPublicProfile.xp} XP
            </p>
          </div>
        </section>

        <section className="panel" aria-labelledby="profile-stats-title">
          <h2 id="profile-stats-title">Stats</h2>
          <dl className="compact-facts">
            <div>
              <dt>Elo</dt>
              <dd>{primaryStats.elo}</dd>
            </div>
            <div>
              <dt>Record</dt>
              <dd>{primaryRecord}</dd>
            </div>
            <div>
              <dt>Games</dt>
              <dd>{primaryStats.gamesPlayed} games</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="panel" aria-labelledby="game-stats-title">
        <h2 id="game-stats-title">Game Stats</h2>
        <div className="profile-game-stats-grid">
          {gameIds.map((gameId) => (
            <GameStatsCard key={gameId} gameId={gameId} />
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="recent-matches-title">
        <h2 id="recent-matches-title">Recent Matches</h2>
        <ul className="profile-history-list">
          {demoMatchHistoryEntries.map((entry) => (
            <li key={entry.id}>
              <div>
                <strong>
                  {entry.result} - {getDisplayNameForGame(entry.gameId)}
                </strong>
                <span>vs {entry.opponentDisplayName}</span>
              </div>
              <span>{formatEloDelta(entry.eloDelta)}</span>
            </li>
          ))}
        </ul>
      </section>

      <ReportPlayerPreview />
    </section>
  );
}

function GameStatsCard({ gameId }: { gameId: GameId }) {
  const stats = demoPublicProfile.statsByGame[gameId];
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  return (
    <article className="profile-game-stat-card">
      <div>
        <p className="meta-label">{getDisplayNameForGame(gameId)}</p>
        <h2>{stats.elo}</h2>
      </div>
      <dl className="compact-facts">
        <div>
          <dt>Record</dt>
          <dd>{formatRecord({ draws: stats.draws, losses: stats.losses, wins: stats.wins })}</dd>
        </div>
        <div>
          <dt>Win Rate</dt>
          <dd>{winRate}% win rate</dd>
        </div>
        <div>
          <dt>Streak</dt>
          <dd>{stats.currentStreak} current</dd>
        </div>
      </dl>
    </article>
  );
}

function ReportPlayerPreview() {
  return (
    <section className="panel report-player-panel" aria-labelledby="report-player-title">
      <div>
        <p className="meta-label">Safety preview</p>
        <h2 id="report-player-title">Report Player</h2>
        <p>
          Reports will use <code>{getReportCollectionLabel()}</code> after Firebase writes are
          approved.
        </p>
      </div>

      <form className="report-preview-form" aria-label="Report player preview">
        <label>
          <span className="field-label">Report reason</span>
          <select name="reason" defaultValue={moderationReportReasons[1]}>
            {moderationReportReasons.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="field-label">Report details</span>
          <textarea name="details" rows={3} placeholder="Local preview only" />
        </label>
        <button type="button" disabled>
          Submit report preview
        </button>
      </form>
    </section>
  );
}
