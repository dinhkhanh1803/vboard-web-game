import { Route, Routes } from "react-router-dom";

import { DevNavigation } from "@/app/DevNavigation";
import { HomePage } from "@/app/HomePage";
import { appRoutes } from "@/routes/routeConfig";
import { RouteStub } from "@/routes/RouteStub";

export function App() {
  return (
    <div className="app-frame">
      <DevNavigation />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {appRoutes
            .filter((route) => route.id !== "home")
            .map((route) => (
              <Route key={route.id} path={route.path} element={<RouteStub route={route} />} />
            ))}
        </Routes>
      </main>
    </div>
  );
}
