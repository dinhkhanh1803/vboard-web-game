import { NavLink } from "react-router-dom";

export function Header() {
  return (
    <header className="app-header">
      <div className="header-left">
        <NavLink to="/" className="header-brand-mark">
          VBoard Arena
        </NavLink>
      </div>

      <nav className="header-nav" aria-label="Main Menu">
        <NavLink
          to="/"
          className={({ isActive }) => `header-nav-link ${isActive ? "is-active" : ""}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/games"
          className={({ isActive }) => `header-nav-link ${isActive ? "is-active" : ""}`}
        >
          Games
        </NavLink>
        <NavLink
          to="/lobby"
          className={({ isActive }) => `header-nav-link ${isActive ? "is-active" : ""}`}
        >
          Lobby
        </NavLink>
        <NavLink
          to="/leaderboard"
          className={({ isActive }) => `header-nav-link ${isActive ? "is-active" : ""}`}
        >
          Leaderboard
        </NavLink>
      </nav>

      <div className="header-right">
        {/* Notification Bell */}
        <button className="header-icon-btn" aria-label="Notifications">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="header-svg-icon"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* Settings Cog */}
        <button className="header-icon-btn" aria-label="Settings">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="header-svg-icon"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* User Profile Avatar */}
        <NavLink
          to="/profile/me"
          className={({ isActive }) => `header-avatar ${isActive ? "is-active" : ""}`}
          aria-label="Player profile"
        >
          <img src="/assets/images/avatar.png" alt="Player profile" className="header-avatar-img" />
        </NavLink>
      </div>
    </header>
  );
}
