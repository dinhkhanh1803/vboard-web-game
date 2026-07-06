import { getRouteById } from "@/routes/routeConfig";

export function ContentPage({ routeId }: { routeId: "privacy" | "terms" | "contact" }) {
  const route = getRouteById(routeId);
  const title = route?.stubTitle ?? route?.label ?? "Content";

  return (
    <section className="screen" aria-labelledby={`${routeId}-title`}>
      <header className="screen-header">
        <p className="screen-eyebrow">{route?.stubEyebrow ?? "Content"}</p>
        <h1 id={`${routeId}-title`}>{title}</h1>
        <p>{route?.summary ?? "Public content shell before production deployment."}</p>
      </header>
      <section className="panel">
        <h2>Draft Status</h2>
        <p>
          Content is intentionally placeholder-only until product policy and deployment details are
          approved.
        </p>
      </section>
    </section>
  );
}
