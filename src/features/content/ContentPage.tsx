import { NavLink } from "react-router-dom";

import { getRouteById } from "@/routes/routeConfig";

type ContentRouteId = "privacy" | "terms" | "contact";

type PolicyPoint = {
  icon: "data" | "shield";
  title: string;
  body: string;
};

type TermsPoint = {
  number: string;
  title: string;
  body: string;
};

const documentationLinks = [
  { href: "/privacy-policy", label: "Privacy Policy", routeId: "privacy" },
  { href: "/terms", label: "Terms of Service", routeId: "terms" },
  { href: "/contact", label: "Contact Support", routeId: "contact" },
] as const;

const privacyPoints: PolicyPoint[] = [
  {
    icon: "data",
    title: "Data Collection",
    body: "We collect essential metadata including Elo ratings, turn-time performance, and device orientation to ensure fair play and prevent botting.",
  },
  {
    icon: "shield",
    title: "Encryption",
    body: "All real-time socket communications are encrypted via TLS 1.3, ensuring your game strategies and private room codes remain confidential.",
  },
];

const transparencySections = [
  {
    title: "Profile Transparency",
    body: "Your public rank, win-loss ratio, and Preferred Games are visible to the community to foster a competitive spirit. Private messages and match replays are restricted based on your settings.",
  },
  {
    title: "Third-Party Analytics",
    body: "We utilize PixiJS and custom WebGL shaders that may collect hardware performance data to optimize visual fidelity on lower-end devices.",
  },
];

const termsPoints: TermsPoint[] = [
  {
    number: "01",
    title: "Fair Play & Anti-Cheat",
    body: "The use of external probability engines, board state analyzers, or script-assisted move generation is strictly prohibited. Violators will face immediate permanent ban from the Arena.",
  },
  {
    number: "02",
    title: "Account Responsibility",
    body: "Players are responsible for actions taken through their account, including room invitations, public profile content, and tournament participation.",
  },
  {
    number: "03",
    title: "Competitive Integrity",
    body: "Matchmaking, ranking, and match history are reviewed for suspicious patterns before rewards, public ranks, or tournament eligibility are finalized.",
  },
];

export function ContentPage({ routeId }: { routeId: ContentRouteId }) {
  if (routeId === "privacy" || routeId === "terms") {
    return <PrivacyTermsPage activeRouteId={routeId} />;
  }

  return <ContactSupportPage />;
}

function PrivacyTermsPage({
  activeRouteId,
}: {
  activeRouteId: Extract<ContentRouteId, "privacy" | "terms">;
}) {
  return (
    <section className="content-docs-screen" aria-label="Privacy and Terms documentation">
      <DocumentationSidebar activeRouteId={activeRouteId} />

      <main className="content-docs-main">
        <section className="content-policy-section is-privacy" aria-labelledby="privacy-title">
          <header className="content-section-heading">
            <span aria-hidden="true" />
            <h1 id="privacy-title">Privacy Policy</h1>
          </header>

          <article className="content-doc-card is-privacy-card">
            <p className="content-lede">
              At VBoard Arena, we take your competitive integrity and data security seriously. This
              policy outlines how we handle your player profile, match history, and payment
              information within our high-stakes ecosystem.
            </p>

            <div className="content-policy-points">
              {privacyPoints.map((point) => (
                <article className="content-policy-point" key={point.title}>
                  <PolicyIcon icon={point.icon} />
                  <h2>{point.title}</h2>
                  <p>{point.body}</p>
                </article>
              ))}
            </div>

            <ol className="content-transparency-list">
              {transparencySections.map((section, index) => (
                <li key={section.title}>
                  <h2>
                    {index + 1}. {section.title}
                  </h2>
                  <p>{section.body}</p>
                </li>
              ))}
            </ol>
          </article>
        </section>

        <section className="content-policy-section is-terms" aria-labelledby="terms-title">
          <header className="content-section-heading">
            <span aria-hidden="true" />
            <h1 id="terms-title">Terms of Service</h1>
          </header>

          <article className="content-doc-card is-terms-card">
            {termsPoints.map((point) => (
              <section className="content-terms-row" key={point.number}>
                <span>{point.number}</span>
                <div>
                  <h2>{point.title}</h2>
                  <p>{point.body}</p>
                </div>
              </section>
            ))}
          </article>
        </section>
      </main>
    </section>
  );
}

function DocumentationSidebar({ activeRouteId }: { activeRouteId: ContentRouteId }) {
  return (
    <aside className="content-docs-sidebar" aria-label="Documentation navigation">
      <p>Documentation</p>
      <nav aria-label="Documentation">
        {documentationLinks.map((link) => (
          <NavLink
            className={link.routeId === activeRouteId ? "is-active" : ""}
            key={link.href}
            to={link.href}
          >
            <DocNavIcon routeId={link.routeId} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <section className="content-support-card" aria-labelledby="support-card-title">
        <h2 id="support-card-title">Need Live Help?</h2>
        <p>Our Grandmaster support team is active 24/7 for tournament disputes.</p>
        <button type="button" disabled>
          Open ticket
        </button>
      </section>
    </aside>
  );
}

function ContactSupportPage() {
  const route = getRouteById("contact");

  return (
    <section className="screen" aria-labelledby="contact-title">
      <header className="screen-header">
        <p className="screen-eyebrow">{route?.stubEyebrow ?? "Support"}</p>
        <h1 id="contact-title">{route?.stubTitle ?? "Contact Support"}</h1>
        <p>{route?.summary ?? "Contact support content shell before production deployment."}</p>
      </header>
      <section className="panel">
        <h2>Support Intake</h2>
        <p>
          Live ticket creation is disabled until auth, moderation, and support routing are approved.
        </p>
      </section>
    </section>
  );
}

function PolicyIcon({ icon }: { icon: PolicyPoint["icon"] }) {
  return (
    <span className="content-policy-icon" aria-hidden="true">
      {icon === "data" ? (
        <svg viewBox="0 0 24 24">
          <path d="M4 12a8 8 0 1 1 8 8" />
          <path d="M4 12h4m4-8v4" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-5" />
        </svg>
      )}
    </span>
  );
}

function DocNavIcon({ routeId }: { routeId: ContentRouteId }) {
  if (routeId === "privacy") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 6 5.5v5.2c0 3.8 2.2 6.9 6 8.3 3.8-1.4 6-4.5 6-8.3V5.5L12 3Z" />
        <path d="M10 12h4" />
      </svg>
    );
  }

  if (routeId === "terms") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4h12v16H6z" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.6 2.6 0 0 1 5 1c0 2-2.5 2.2-2.5 4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
