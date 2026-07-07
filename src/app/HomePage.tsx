import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();
  const [roomDigits, setRoomDigits] = useState<string[]>(["", "", "", ""]);

  // Handle typing inside the room code digits
  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!cleanValue) {
      const newDigits = [...roomDigits];
      newDigits[index] = "";
      setRoomDigits(newDigits);
      return;
    }

    const firstChar = cleanValue.charAt(0);
    const newDigits = [...roomDigits];
    newDigits[index] = firstChar;
    setRoomDigits(newDigits);

    // Auto-focus next input
    if (index < 3) {
      const nextInput = document.getElementById(`digit-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !roomDigits[index] && index > 0) {
      const prevInput = document.getElementById(`digit-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newDigits = [...roomDigits];
        newDigits[index - 1] = "";
        setRoomDigits(newDigits);
      }
    }
  };

  const isCodeComplete = roomDigits.every((d) => d !== "");

  const handleJoinRoom = () => {
    if (isCodeComplete) {
      // Navigate to wait room for demo-room
      navigate(`/rooms/demo-room`);
    }
  };

  return (
    <div className="homepage-container">
      {/* Hero row (2 Columns) */}
      <div className="home-hero-section">
        {/* Connect 4 Live Arena Hero Card */}
        <div className="connect4-hero-card">
          <div className="hero-card-overlay" />
          <div className="hero-card-content">
            <div className="live-arena-badge">
              <span className="live-badge-dot" />
              LIVE ARENA
            </div>
            <h1 className="hero-game-title">Connect 4</h1>
            <p className="hero-game-desc">
              Challenge a random player or friend in our flagship strategic arena. Low latency, high
              stakes.
            </p>
            <Link to="/matches/demo-match" className="play-now-btn">
              PLAY NOW
              <svg
                className="btn-arrow-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Custom Lobby Card */}
        <div className="custom-lobby-card">
          <div className="lobby-card-header">
            <div className="lobby-icon-container">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lobby-node-icon"
              >
                <circle cx="12" cy="5" r="3" />
                <circle cx="5" cy="19" r="3" />
                <circle cx="19" cy="19" r="3" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="12" x2="5" y2="16" />
                <line x1="12" y1="12" x2="19" y2="16" />
              </svg>
            </div>
            <h2 className="lobby-title">Custom Lobby</h2>
          </div>
          <p className="lobby-desc">
            Host private matches, join community tournaments, or browse custom game rules.
          </p>
          <Link to="/lobby" className="go-to-lobby-btn">
            GO TO LOBBY
            <svg
              className="btn-arrow-right"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Active Arenas Grid Header */}
      <div className="active-arenas-header">
        <h2 className="arenas-title-row">
          <svg
            className="arenas-bolt-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Active Arenas
        </h2>
        <div className="online-players-counter">
          <span className="online-count">342</span> PLAYERS ONLINE
        </div>
      </div>

      {/* Active Arenas Cards Grid */}
      <div className="active-arenas-grid">
        {/* Grandmaster Chess Card */}
        <Link to="/lobby" className="arena-game-card chess-card">
          <div className="arena-card-overlay" />
          <div className="arena-badge playable">PLAYABLE</div>
          <div className="arena-card-info">
            <h3 className="arena-game-name">Grandmaster Chess</h3>
            <p className="arena-game-tables">12 Active Tables</p>
          </div>
          <div className="arena-card-action">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>

        {/* Pro Checkers Card */}
        <Link to="/lobby" className="arena-game-card checkers-card">
          <div className="arena-card-overlay" />
          <div className="arena-badge playable">PLAYABLE</div>
          <div className="arena-card-info">
            <h3 className="arena-game-name">Pro Checkers</h3>
            <p className="arena-game-tables">8 Active Tables</p>
          </div>
          <div className="arena-card-action">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>

        {/* Battle Poker Card (Locked) */}
        <div className="arena-game-card poker-card locked">
          <div className="arena-card-overlay" />
          <div className="lock-icon-overlay">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="arena-lock-svg"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div className="lock-text">Battle Poker</div>
            <div className="lock-subtext">Coming in 4 Days</div>
          </div>
          <div className="arena-card-info">
            <h3 className="arena-game-name">Battle Poker</h3>
            <p className="arena-game-tables">0 Tables</p>
          </div>
          <div className="arena-card-action locked-action">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Join via Room Code Card */}
      <div className="join-room-code-card">
        <div className="join-info">
          <h3 className="join-title">Join via Room Code</h3>
          <p className="join-desc">Direct entry to your friend's private session.</p>
        </div>

        <div className="code-input-container">
          <div className="code-digit-box pre-filled">V</div>
          <div className="code-digit-box pre-filled">B</div>
          <div className="code-separator">-</div>

          {roomDigits.map((digit, index) => (
            <input
              key={index}
              id={`digit-input-${index}`}
              className={`code-digit-input ${digit ? "has-value" : ""}`}
              type="text"
              maxLength={1}
              value={digit}
              placeholder="X"
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoComplete="off"
            />
          ))}

          <button
            onClick={handleJoinRoom}
            className={`code-join-btn ${isCodeComplete ? "active" : ""}`}
            disabled={!isCodeComplete}
          >
            JOIN
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-brand">VBoard Arena</div>
        <div className="footer-copyright">© 2024 VBoard Arena. Built with React + PixiJS.</div>
      </footer>
    </div>
  );
}
