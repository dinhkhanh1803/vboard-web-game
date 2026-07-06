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

## Phase 3: Server-Authoritative Path

- [ ] Add emulator test setup.
- [ ] Add `createRoom` test and callable.
- [ ] Add `joinRoom` test and callable.
- [ ] Add `startMatch` test and callable.
- [ ] Add `submitMove` test path before game-specific implementation.

## Phase 4: Connect 4

- [ ] Define `GameModule` contract.
- [ ] Add Connect 4 state tests.
- [ ] Add Connect 4 validation tests.
- [ ] Add Connect 4 result tests.
- [ ] Add Connect 4 match UI.

## Phase 5: Caro

- [ ] Add Caro state tests.
- [ ] Add Caro five-in-row tests.
- [ ] Add Caro timer and rematch flow.
- [ ] Add Caro match UI.
