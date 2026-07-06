import { techStack } from "@/shared/constants/techStack";

export function HomePage() {
  return (
    <section className="app-hero" aria-labelledby="app-title">
      <p className="app-kicker">Realtime board game platform</p>
      <h1 id="app-title">VBoard Arena</h1>
      <p className="app-copy">
        Foundation is ready for a React app shell, PixiJS game rendering, Firebase backend, and pure
        TypeScript game rules.
      </p>
      <dl className="stack-list" aria-label="Selected technology stack">
        <div>
          <dt>Web</dt>
          <dd>{techStack.app}</dd>
        </div>
        <div>
          <dt>Game Renderer</dt>
          <dd>{techStack.renderer}</dd>
        </div>
        <div>
          <dt>Backend</dt>
          <dd>{techStack.backend}</dd>
        </div>
      </dl>
    </section>
  );
}
