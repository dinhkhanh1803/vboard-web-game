import type { ReactNode } from "react";

import { canAccessAdminPreview } from "@contracts/moderationSafety";
import type { UserRole } from "@contracts/userProfile";

export type RequireAdminPreviewProps = {
  children: ReactNode;
  routeName?: string;
  signedIn?: boolean;
  viewerRole?: UserRole;
};

export function RequireAdminPreview({
  children,
  routeName = "Admin Console",
  signedIn = false,
  viewerRole = "player",
}: RequireAdminPreviewProps) {
  if (!signedIn) {
    return (
      <section className="screen" aria-labelledby="auth-required-title">
        <header className="screen-header compact-screen-header">
          <p className="screen-eyebrow">Protected route</p>
          <h1 id="auth-required-title">Sign in required</h1>
          <p>
            {routeName} is protected in the local preview so future Firebase Auth wiring has a clear
            route boundary.
          </p>
        </header>

        <section className="panel auth-required-panel" aria-label="Auth required actions">
          <dl className="compact-facts">
            <div>
              <dt>Route</dt>
              <dd>{routeName}</dd>
            </div>
            <div>
              <dt>Auth status</dt>
              <dd>Preview signed out</dd>
            </div>
          </dl>
          <a className="button-link" href="/profile/me">
            Go to auth shell
          </a>
        </section>
      </section>
    );
  }

  if (!canAccessAdminPreview(viewerRole)) {
    return (
      <section className="screen" aria-labelledby="admin-required-title">
        <header className="screen-header compact-screen-header">
          <p className="screen-eyebrow">Role gate</p>
          <h1 id="admin-required-title">Admin access required</h1>
          <p>Admin controls stay hidden unless the local preview role is admin.</p>
        </header>

        <section className="panel auth-required-panel" aria-label="Admin role required">
          <dl className="compact-facts">
            <div>
              <dt>Route</dt>
              <dd>{routeName}</dd>
            </div>
            <div>
              <dt>Current role</dt>
              <dd>{viewerRole}</dd>
            </div>
          </dl>
          <a className="button-link" href="/profile/me">
            Review profile shell
          </a>
        </section>
      </section>
    );
  }

  return <>{children}</>;
}
