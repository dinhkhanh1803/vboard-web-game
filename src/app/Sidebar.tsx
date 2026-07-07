import { NavLink } from "react-router-dom";

export function Sidebar() {
  return (
    <aside role="navigation" className="app-sidebar" aria-label="Sidebar navigation">
      {/* User profile widget */}
      <NavLink
        to="/profile/me"
        className={({ isActive }) => `user-profile-widget ${isActive ? "is-active" : ""}`}
      >
        <div className="user-avatar-glow">
          <svg
            className="user-avatar-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="user-info">
          <div className="user-name">Player One</div>
          <div className="user-rank">Rank: Grandmaster</div>
        </div>
      </NavLink>

      {/* Main navigation menu */}
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}>
          <svg
            className="link-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Home
        </NavLink>

        <NavLink
          to="/games"
          className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
        >
          <svg
            className="link-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="6" y1="12" x2="18" y2="12" />
            <line x1="12" y1="6" x2="12" y2="18" />
            <rect x="2" y="2" width="20" height="20" rx="5" />
          </svg>
          Games
        </NavLink>

        <NavLink
          to="/lobby"
          className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
        >
          <svg
            className="link-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Lobby
        </NavLink>

        <NavLink
          to="/leaderboard"
          className={({ isActive }) => `sidebar-link ${isActive ? "is-active" : ""}`}
        >
          <svg
            className="link-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Leaderboard
        </NavLink>
      </nav>

      {/* CREATE ROOM CTA button */}
      <div className="sidebar-action-container">
        <NavLink to="/lobby" className="sidebar-create-room-btn">
          CREATE ROOM
        </NavLink>
      </div>

      {/* Sidebar footer links */}
      <div className="sidebar-footer-links">
        <NavLink
          to="/contact"
          className={({ isActive }) => `sidebar-link footer-link ${isActive ? "is-active" : ""}`}
        >
          <svg
            className="link-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Support
        </NavLink>

        <NavLink
          to="/profile/me"
          className={({ isActive }) => `sidebar-link footer-link ${isActive ? "is-active" : ""}`}
        >
          <svg
            className="link-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Profile
        </NavLink>
      </div>
    </aside>
  );
}
