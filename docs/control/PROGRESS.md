# Progress Checklist

Use this file as the owner's control board. AI assistants should update it when work changes status. Detailed tasks live in `docs/control/IMPLEMENTATION_CHECKLIST.md`.

## Phase 0: Foundation

- [x] Read product blueprint.
- [x] Create initial Firebase/platform scaffold.
- [x] Adapt architecture for solo owner plus AI-assisted workflow.
- [x] Add AI control files and VS Code helper files.
- [x] Commit foundation scaffold.

## Phase 1: Toolchain

- [x] Install and configure Vite React TypeScript with PixiJS dependency.
- [x] Install and configure linting and formatting.
- [x] Install and configure Vitest.
- [x] Configure TypeScript scoped configs for web, functions, and game engine.
- [x] Make root `build`, `lint`, `test`, and `typecheck` scripts meaningful.

## Phase 2: Web App Shell

- [x] Add route map and app provider shell.
- [x] Add global styles and design tokens.
- [x] Add feature READMEs for MVP feature folders.
- [x] Add a development-only navigation layout.

## Phase 3: UI Screen Foundation

- [x] Reorder the roadmap so UI work comes before Firebase/backend work.
- [x] Add static game catalog for Connect 4 and Caro.
- [x] Add static lobby and waiting room screens.
- [x] Add static match shell with a PixiJS board mount boundary.
- [x] Add leaderboard, profile, admin, and content shells.
- [x] Cover the new route contracts with React Testing Library tests.

## Phase 4: UI Review And Interaction Polish

- [x] Review desktop/mobile layout in browser.
- [x] Fix mobile horizontal overflow on lobby and leaderboard tables.
- [x] Add UI-only labels for disabled lobby actions and match canvas placeholder.
- [ ] Add empty/loading/error states for frontend-only screens.
- [ ] Add local lobby form validation.
- [ ] Add non-interactive PixiJS board renderer prototype.

## Phase 5: Firebase Local Foundation

- [ ] Ask owner before creating or configuring any real Firebase project.
- [ ] Add Firebase client initialization boundary.
- [ ] Add Firebase Admin boundary for functions.
- [ ] Add emulator test structure.
- [ ] Keep rules closed by default.
