import type { ReactNode } from "react";

export type RequireAuthPreviewProps = {
  children: ReactNode;
  routeName: string;
  signedIn?: boolean;
};

export function RequireAuthPreview({
  children,
  routeName,
  signedIn = false,
}: RequireAuthPreviewProps) {
  if (signedIn) {
    return <>{children}</>;
  }

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
