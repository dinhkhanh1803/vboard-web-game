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
- [x] Add non-interactive PixiJS board renderer prototype.

## Phase 5: Firebase Local Foundation

- [x] Confirm no real Firebase project was created or configured.
- [x] Add Firebase client initialization boundary.
- [x] Add Firebase Admin boundary for functions.
- [x] Add emulator/rules test structure.
- [x] Keep rules closed by default.

## Phase 6: Shared Product Contracts

- [x] Define user/profile contracts for users and profilesPublic.
- [x] Define game catalog contracts.
- [x] Define room and match contracts.
- [x] Define analytics event names.

## Phase 7: Auth And Profile Flow

- [x] Add Auth UI shell with email, Google, and guest-mode states.
- [x] Add profile view connected to the shared profile contract.
- [x] Add protected-route behavior.

## Phase 8: Game Engine Core And Connect 4

- [x] Define GameModule contract.
- [x] Add Connect 4 initial state tests.
- [x] Add Connect 4 move validation tests.
- [x] Add Connect 4 result tests.

## Phase 9: Server-Authoritative Room And Move Path

- [x] Implement createRoom through tests.
- [x] Implement joinRoom through tests.
- [x] Implement startMatch through tests.
- [x] Implement submitMove for Connect 4 through tests.
- [x] Add timeout contract before timeout implementation.

## Phase 10: Connect 4 Web Gameplay

- [x] Connect match UI to official public state.
- [x] Add interactive Connect 4 PixiJS board UI.
- [x] Add realtime match subscription boundary.
- [x] Add result screen path.

## Phase 11: Caro MVP

- [x] Add pure Caro game-engine module with 15x15 board state.
- [x] Add Caro move validation and five-in-row result tests.
- [x] Add local Caro match source using the shared MatchDocument public state shape.
- [x] Add playable Caro PixiJS board UI and demo route.
