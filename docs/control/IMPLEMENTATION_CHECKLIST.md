# Implementation Checklist

This is the working checklist for the next development phases. Keep each task small enough for one AI session or one owner review pass.

## How To Use This Checklist

- Work from top to bottom unless the owner explicitly changes priority.
- Pick one unchecked item, update `NEXT_TASK.md`, then code only that item.
- After finishing an item, run its verification, update `PROGRESS.md`, update `NEXT_TASK.md`, then commit.
- If an item becomes too large, split it before coding.

## Phase 1: Toolchain And Project Runtime

Goal: make the scaffold a real React + Vite + TypeScript project with PixiJS installed, without product features.

- [x] Install Vite React TypeScript and PixiJS at the repo root.
  - Files: `package.json`, `index.html`, `src/`, `public/`.
  - Done when: `npm run dev` can start a blank app locally and `pixi.js` is available for later canvas work.
- [x] Add root TypeScript configs for web, functions, and game engine.
  - Files: `tsconfig.json`, `tsconfig.app.json`, `functions/tsconfig.json`, `game-engine/tsconfig.json`.
  - Done when: `npm run typecheck` checks all active TS projects.
- [x] Add ESLint and Prettier.
  - Files: `eslint.config.*`, `.prettierrc`, `package.json`.
  - Done when: `npm run lint` reports real lint status.
- [x] Add Vitest test runner.
  - Files: `vitest.config.*`, `src/test/`, `game-engine/test/`, `package.json`.
  - Done when: `npm run test` runs at least one smoke test.
- [x] Add Firebase CLI scripts without connecting production secrets.
  - Files: `package.json`, `firebase.json`, `firebase/README.md`.
  - Done when: emulator and deploy commands are documented but production remains unconfigured.

Owner review: confirm React + Vite + PixiJS, scripts, and folder layout still feel easy to control in VS Code.

## Phase 2: Web App Shell

Goal: create a navigable app shell with no Firebase dependency yet.

- [x] Add route map and app provider shell.
  - Files: `src/app/`, `src/routes/`.
  - Done when: routes render stub screens.
- [x] Add global styles and design tokens.
  - Files: `src/styles/`, `src/shared/constants/`.
  - Done when: all stub screens share the same layout and theme basics.
- [x] Add feature READMEs for `auth`, `games`, `lobby`, `match`, `leaderboard`, `admin`, and `content`.
  - Files: `src/features/*/README.md`.
  - Done when: each feature states responsibility, boundaries, and next task.
- [x] Add a development-only navigation layout.
  - Files: `src/app/`, `src/routes/`, `src/shared/components/`.
  - Done when: the owner can click through all MVP stub routes.

Owner review: approve navigation shape before any real UI polishing.

## Phase 3: Firebase Local Foundation

Goal: connect Firebase safely through local/emulator-first boundaries.

- [ ] Create Firebase client initialization boundary.
  - Files: `src/firebase/`.
  - Done when: config is read from `.env.example` keys and emulator toggles are isolated.
- [ ] Create Firebase Admin boundary for functions.
  - Files: `functions/src/integrations/`.
  - Done when: backend code has a single place to initialize Admin SDK later.
- [ ] Add emulator test structure.
  - Files: `tests/`, `functions/test/`, `firebase/`.
  - Done when: security/function tests have a documented run command.
- [ ] Keep Firestore, Storage, and Realtime Database rules closed.
  - Files: `firebase/*.rules*`.
  - Done when: tests prove closed-by-default access remains closed.

Owner review: confirm no production Firebase project IDs or secrets were committed.

## Phase 4: Shared Product Contracts

Goal: define the data language before writing workflows.

- [ ] Define user/profile contracts.
  - Files: `src/features/auth/`, `functions/src/core/` or feature-local shared types.
  - Done when: fields for `users` and `profilesPublic` match `docs/firebase-model.md`.
- [ ] Define game catalog contracts.
  - Files: `src/features/games/`, `game-engine/src/core/`.
  - Done when: Connect 4 and Caro metadata can be represented without gameplay code.
- [ ] Define room and match contracts.
  - Files: `src/features/lobby/`, `src/features/match/`, `functions/src/core/`.
  - Done when: `room`, `match`, `move`, and `stateVersion` fields are explicit.
- [ ] Define analytics event names.
  - Files: `src/shared/constants/`, `docs/firebase-model.md`.
  - Done when: event names match the product blueprint list.

Owner review: approve field names before Firebase writes exist.

## Phase 5: Auth And Profile Shell

Goal: identify users before room/match features.

- [ ] Add Auth UI shell with email, Google, and guest-mode stubs.
  - Files: `src/features/auth/`, `src/routes/`.
  - Done when: UI flow exists but disabled provider config is obvious.
- [ ] Add profile view shell.
  - Files: `src/features/auth/`, `src/routes/`.
  - Done when: display name, avatar, level, XP, stats, and match history sections are represented.
- [ ] Add protected-route behavior.
  - Files: `src/app/`, `src/features/auth/`.
  - Done when: private routes clearly redirect or show sign-in state.

Owner review: confirm auth UX before wiring live Firebase providers.

## Phase 6: Games, Lobby, And Rooms

Goal: let a user understand the product flow before full multiplayer logic.

- [ ] Add game list screen with Connect 4 and Caro metadata.
  - Files: `src/features/games/`, `src/routes/`.
  - Done when: both games have cards, status, player count, and entry actions.
- [ ] Add lobby shell.
  - Files: `src/features/lobby/`, `src/routes/`.
  - Done when: public rooms, room code input, and quick match sections exist.
- [ ] Add waiting room shell.
  - Files: `src/features/lobby/`, `src/routes/`.
  - Done when: room code, invite link, player slots, ready/start area, and quick chat area exist.
- [ ] Add room lifecycle tests before backend implementation.
  - Files: `functions/test/`, `functions/src/callable/`.
  - Done when: tests describe create, join, leave, and start behavior.

Owner review: confirm room flow before implementing writes.

## Phase 7: Game Engine Core And Connect 4

Goal: prove the pure game-rule path before UI and backend rely on it.

- [ ] Define `GameModule` contract.
  - Files: `game-engine/src/core/`.
  - Done when: state, move, validation, public state, private state, and result shapes are typed.
- [ ] Add Connect 4 initial state tests.
  - Files: `game-engine/test/`, `game-engine/src/games/connect4/`.
  - Done when: board size, players, first turn, and empty result are tested.
- [ ] Add Connect 4 move validation tests.
  - Files: `game-engine/test/`, `game-engine/src/games/connect4/`.
  - Done when: invalid column, full column, wrong turn, and valid move are covered.
- [ ] Add Connect 4 result tests.
  - Files: `game-engine/test/`, `game-engine/src/games/connect4/`.
  - Done when: horizontal, vertical, diagonal, and draw are covered.

Owner review: inspect tests first; rule implementation should be boring after tests pass.

## Phase 8: Server-Authoritative Room And Move Path

Goal: make Cloud Functions the only official writer for match state.

- [ ] Implement `createRoom` through tests.
  - Files: `functions/src/callable/`, `functions/test/`, `firebase/firestore.rules`.
  - Done when: authenticated user creates a waiting room through a function only.
- [ ] Implement `joinRoom` through tests.
  - Files: `functions/src/callable/`, `functions/test/`.
  - Done when: second player can join by code and invalid joins fail.
- [ ] Implement `startMatch` through tests.
  - Files: `functions/src/callable/`, `functions/test/`.
  - Done when: room transitions to match only when rules allow it.
- [ ] Implement `submitMove` for Connect 4 through tests.
  - Files: `functions/src/callable/`, `functions/test/`, `game-engine/src/games/connect4/`.
  - Done when: function validates turn, state version, legal move, result, and move log.
- [ ] Add timeout contract before timeout implementation.
  - Files: `functions/src/core/`, `src/features/match/`, `docs/firebase-model.md`.
  - Done when: `turnStartedAt`, `turnDurationSec`, and `turnDeadlineAt` are agreed.

Owner review: verify no client writes official match fields directly.

## Phase 9: Connect 4 Web Gameplay

Goal: connect the first playable game to official realtime state with PixiJS rendering the board.

- [ ] Add match route shell.
  - Files: `src/features/match/`, `src/routes/`.
  - Done when: player panels, timer, board area, move log, and actions exist.
- [ ] Add Connect 4 PixiJS board UI.
  - Files: `src/features/match/`, `src/features/games/`.
  - Done when: PixiJS renders official public state and sends move intent only.
- [ ] Add realtime match subscription boundary.
  - Files: `src/features/match/`, `src/firebase/`.
  - Done when: listener targets one match document, not a broad collection.
- [ ] Add result screen path.
  - Files: `src/features/match/`, `src/routes/`.
  - Done when: winner, draw, Elo preview, rematch, and find-new-match actions exist.

Owner review: play flow should feel clear on mobile before adding Caro.

## Phase 10: Caro MVP

Goal: add the second game after the platform path works.

- [ ] Add Caro state and board-size tests.
  - Files: `game-engine/test/`, `game-engine/src/games/caro/`.
  - Done when: board size and empty state are deterministic.
- [ ] Add five-in-row result tests.
  - Files: `game-engine/test/`, `game-engine/src/games/caro/`.
  - Done when: horizontal, vertical, and diagonal wins are covered.
- [ ] Add Caro move validation tests.
  - Files: `game-engine/test/`, `game-engine/src/games/caro/`.
  - Done when: occupied cell, out-of-board, wrong turn, and valid move are covered.
- [ ] Add Caro match UI using the same match shell.
  - Files: `src/features/match/`, `src/features/games/`.
  - Done when: Caro uses the shared match route without duplicating room logic.

Owner review: confirm Connect 4 patterns are reused rather than copied blindly.

## Phase 11: Ranking, History, And Progression

Goal: add retention systems after core gameplay is real.

- [ ] Add Elo helper tests.
  - Files: `game-engine/src/core/` or `functions/src/core/`, tests in matching area.
  - Done when: win, loss, draw, and expected score cases are covered.
- [ ] Add match history writes through functions.
  - Files: `functions/src/callable/`, `functions/test/`.
  - Done when: finished matches create history entries without client writes.
- [ ] Add leaderboard read UI.
  - Files: `src/features/leaderboard/`, `firebase/firestore.rules`.
  - Done when: leaderboard is public-read and write-protected by tests.
- [ ] Add profile stats UI.
  - Files: `src/features/auth/`.
  - Done when: profile shows win, loss, draw, Elo, XP, and recent matches.

Owner review: approve progression numbers before any reward economy grows.

## Phase 12: Admin, Moderation, And Safety

Goal: create operational controls without overbuilding.

- [ ] Add admin route shell.
  - Files: `src/features/admin/`, `src/routes/`.
  - Done when: users, reports, game config, and feature flags sections exist.
- [ ] Add report user contract and UI.
  - Files: `src/features/admin/`, `src/features/match/`, `functions/src/callable/`.
  - Done when: reports are created through safe paths and visible to admin role later.
- [ ] Add feature flag contract for games.
  - Files: `functions/src/core/`, `src/features/games/`, `firebase/firestore.rules`.
  - Done when: games can be enabled/disabled by config, not hardcoded everywhere.

Owner review: keep admin MVP minimal; do not build a full back office too early.

## Phase 13: Content, Policy Pages, And Ads Preparation

Goal: prepare for public deploy and monetization without harming gameplay.

- [ ] Add privacy policy, terms, and contact pages.
  - Files: `src/features/content/`, `src/routes/`.
  - Done when: pages exist and are linked from app footer/navigation.
- [ ] Add game rules guide pages for Connect 4 and Caro.
  - Files: `src/features/content/`, `src/features/games/`.
  - Done when: `/games/connect-4/how-to-play` and `/games/caro/rules` exist.
- [ ] Add ad placement config contract only.
  - Files: `src/features/content/`, `docs/security.md`, `docs/firebase-model.md`.
  - Done when: ad placements are documented as lobby/result/content only, not near game controls.

Owner review: approve content and ad placement before applying for ads.

## Phase 14: Deploy And Operations

Goal: make staging and production safe.

- [ ] Create Firebase dev and staging project mapping.
  - Files: `.firebaserc`, `.firebaserc.example`, `ops/README.md`.
  - Done when: production IDs are not guessed or committed accidentally.
- [ ] Add deploy checklist.
  - Files: `ops/`.
  - Done when: rules tests, build, App Check plan, budget alerts, and policy pages are listed.
- [ ] Add CI checklist or workflow after local scripts are real.
  - Files: `.github/workflows/`.
  - Done when: PR or push can run lint, typecheck, tests, and build.
- [ ] Add production readiness review.
  - Files: `ops/`, `docs/control/PROGRESS.md`.
  - Done when: launch blockers are explicit and owner-approved.

Owner review: no production deploy until staging smoke test passes.
