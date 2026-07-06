export function AdminPage() {
  return (
    <section className="screen" aria-labelledby="admin-title">
      <header className="screen-header">
        <p className="screen-eyebrow">Operations</p>
        <h1 id="admin-title">Admin Console</h1>
        <p>
          Operational areas are visible as shells only. Roles, reports, and flags are backend work
          later.
        </p>
      </header>

      <div className="game-grid">
        {["User Reports", "Game Config", "Feature Flags", "Moderation Queue"].map((item) => (
          <section
            className="panel"
            key={item}
            aria-labelledby={`${item.toLowerCase().replaceAll(" ", "-")}-title`}
          >
            <p className="meta-label">Planned</p>
            <h2 id={`${item.toLowerCase().replaceAll(" ", "-")}-title`}>{item}</h2>
            <p>Placeholder for owner-only controls after auth and rules are in place.</p>
          </section>
        ))}
      </div>
    </section>
  );
}
