# Progress Checklist

Use this file as the owner's control board. AI assistants should update it when work changes status.

## Phase 0: Foundation

- [x] Read product blueprint.
- [x] Create initial Firebase/platform scaffold.
- [x] Adapt architecture for solo owner plus AI-assisted workflow.
- [x] Add AI control files and VS Code helper files.
- [x] Commit foundation scaffold.

## Phase 1: Toolchain

- [ ] Install and configure Vite React TypeScript.
- [ ] Install and configure linting and formatting.
- [ ] Install and configure Vitest.
- [ ] Configure TypeScript project references or scoped configs.
- [ ] Make root `build`, `lint`, `test`, and `typecheck` scripts meaningful.

## Phase 2: Core Platform Shell

- [ ] Add Firebase client config for development.
- [ ] Add Authentication shell.
- [ ] Add profile shell.
- [ ] Add game catalog contract.
- [ ] Add lobby and room contract drafts.

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