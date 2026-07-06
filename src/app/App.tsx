import { Route, Routes } from "react-router-dom";

import { DevNavigation } from "@/app/DevNavigation";
import { HomePage } from "@/app/HomePage";
import { AdminPage } from "@/features/admin/AdminPage";
import { ProfilePage } from "@/features/auth/ProfilePage";
import { ContentPage } from "@/features/content/ContentPage";
import { GameCatalogPage } from "@/features/games/GameCatalogPage";
import { LeaderboardPage } from "@/features/leaderboard/LeaderboardPage";
import { LobbyPage, WaitingRoomPage } from "@/features/lobby/LobbyPages";
import { MatchPage } from "@/features/match/MatchPage";

export function App() {
  return (
    <div className="app-frame">
      <DevNavigation />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GameCatalogPage />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/rooms/:roomId" element={<WaitingRoomPage />} />
          <Route path="/matches/:matchId" element={<MatchPage />} />
          <Route path="/profile/:userId?" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy-policy" element={<ContentPage routeId="privacy" />} />
          <Route path="/terms" element={<ContentPage routeId="terms" />} />
          <Route path="/contact" element={<ContentPage routeId="contact" />} />
        </Routes>
      </main>
    </div>
  );
}
