import type { AppRoute } from "@/routes/routeConfig";

export function RouteStub({ route }: { route: AppRoute }) {
  return (
    <section className="route-panel" aria-labelledby={`${route.id}-title`}>
      <p className="route-eyebrow">{route.stubEyebrow ?? "Route"}</p>
      <h1 id={`${route.id}-title`}>{route.stubTitle ?? route.label}</h1>
      <p className="route-summary">{route.stubBody ?? route.summary}</p>
    </section>
  );
}
