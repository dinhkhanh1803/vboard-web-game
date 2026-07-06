# Tech Stack Decision

## Final MVP Stack

- Runtime: Node.js 22 LTS target, npm workspaces.
- Web app: React + Vite + TypeScript.
- Game rendering: PixiJS for canvas/WebGL game boards.
- Web UI outside canvas: React components and CSS, Tailwind later if the owner approves during UI work.
- Backend: Firebase Authentication, Firestore, Realtime Database presence, Cloud Functions, Hosting, App Check, Analytics.
- Server logic: Cloud Functions TypeScript, server-authoritative for room and match writes.
- Game rules: pure TypeScript in `game-engine/`, independent from React, PixiJS, and Firebase.
- Tests: Vitest for pure logic and smoke tests, Firebase Emulator Suite later for rules/functions, Playwright later for browser flows.

## React + Vite Over Next.js

Use React + Vite for MVP. The product is a realtime browser game app and does not need SSR for its core loop. PixiJS is client-side rendering, so Vite avoids Next.js SSR/hydration boundaries and keeps the project easier for a solo owner and AI coding sessions to control.

Next.js can be reconsidered later only if SEO-heavy guide/blog pages become a primary product area. Until then, content pages can be static React routes hosted on Firebase Hosting.

## PixiJS Boundary

PixiJS owns only the game canvas rendering layer:

```text
React route -> match screen -> Pixi canvas component -> user click intent
```

PixiJS must not decide official game results, write Firebase match state, or own game rules. It renders `publicState`, handles pointer input, and reports intent back to React. The pure `game-engine/` validates rules, and Cloud Functions write official state.

## Do Not Add Yet

- Redux: use React state first; consider Zustand only when state becomes hard to follow.
- Next.js: defer until SEO needs outweigh client-only simplicity.
- Phaser: defer unless the project adds arcade-style games with scenes, physics, cameras, and asset-heavy loops.
- 3D libraries: out of scope for board-game MVP.
