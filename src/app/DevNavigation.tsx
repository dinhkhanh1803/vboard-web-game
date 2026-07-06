import { NavLink } from "react-router-dom";

import { getRouteHref, mainNavigationRoutes } from "@/routes/routeConfig";

export function DevNavigation() {
  return (
    <nav className="dev-nav" aria-label="Primary">
      <a className="brand-mark" href="/" aria-label="VBoard Arena home">
        VA
      </a>
      <div className="dev-nav-links">
        {mainNavigationRoutes.map((route) => (
          <NavLink
            key={route.id}
            to={getRouteHref(route)}
            className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}
          >
            {route.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
