# Implementation Checklist

This is the working checklist for the next development phases. Keep each task small enough for one AI session or one owner review pass.

## How To Use This Checklist

- Work from top to bottom unless the owner explicitly changes priority.
- Pick one unchecked item, update `NEXT_TASK.md`, then code only that item.
- After finishing an item, run its verification, update `PROGRESS.md`, update `NEXT_TASK.md`, then commit.
- If an item becomes too large, split it before coding.
- Do not create or configure a real Firebase project until the owner explicitly approves that step.

## Phase 1: Toolchain And Project Runtime

Goal: make the scaffold a real React + Vite + TypeScript project with PixiJS installed, without product features.

- [x] Install Vite React TypeScript and PixiJS at the repo root.
- [x] Add root TypeScript configs for web, functions, and game engine.
- [x] Add ESLint and Prettier.
- [x] Add Vitest test runner.
- [x] Add Firebase CLI scripts without connecting production secrets.

Owner review: confirmed React + Vite + PixiJS, scripts, and folder layout are easy to control in VS Code.

## Phase 2: Web App Shell

Goal: create a navigable app shell with no Firebase dependency yet.

- [x] Add route map and app provider shell.
- [x] Add global styles and design tokens.
- [x] Add feature READMEs for `auth`, `games`, `lobby`, `match`, `leaderboard`, `admin`, and `content`.
- [x] Add a development-only navigation layout.

Owner review: navigation shape is ready for static UI screens.

## Phase 3: UI Screen Foundation

Goal: make the main frontend flow visible before backend or Firebase work.

- [x] Add static game catalog screen.
  - Files: `src/features/games/`, `src/shared/constants/`.
  - Done when: Connect 4 and Caro have visible cards, metadata, and disabled entry actions.
- [x] Add static lobby screen.
  - Files: `src/features/lobby/`.
  - Done when: quick match, join-by-code, and public room preview sections exist.
- [x] Add static waiting room screen.
  - Files: `src/features/lobby/`.
  - Done when: room code, invite action, player slots, and ready check are represented.
- [x] Add static match screen with PixiJS mount boundary.
  - Files: `src/features/match/`.
  - Done when: player panels, board mount, move log, and disabled actions exist.
- [x] Add static leaderboard, profile, admin, and content shells.
  - Files: `src/features/leaderboard/`, `src/features/auth/`, `src/features/admin/`, `src/features/content/`.
  - Done when: each route has a reviewable UI contract and tests.

Owner review: approve static UI flow before adding real gameplay rendering or backend writes.

## Phase 4: UI Review And Interaction Polish

Goal: finish the frontend feel before backend work begins.

- [x] Review desktop and mobile route layout in browser.
  - Files: `src/styles/`, `src/features/*`.
  - Done when: no overlapping text, awkward overflow, or broken mobile layouts remain.
- [ ] Add empty/loading/error states for frontend-only screens.
  - Files: `src/features/*`.
  - Done when: future Firebase states have clear UI slots without connecting Firebase.
- [ ] Add form validation behavior for lobby inputs locally.
  - Files: `src/features/lobby/`.
  - Done when: room code validation works without network calls.
- [x] Add first PixiJS renderer prototype behind the match board boundary.
  - Files: `src/features/match/`, `src/features/games/`.
  - Done when: PixiJS renders a non-interactive Connect 4 board placeholder.

Owner review: confirm UI is ready before Firebase project/config steps.

## Phase 5: Firebase Local Foundation

Goal: connect Firebase safely through local/emulator-first boundaries only after owner approval.

- [x] Confirm no real Firebase project is created or configured in this phase.
- [x] Create Firebase client initialization boundary.
  - Files: `src/firebase/`.
  - Done when: config is read from `.env.example` keys and emulator toggles are isolated.
- [x] Create Firebase Admin boundary for functions.
  - Files: `functions/src/integrations/`.
  - Done when: backend code has a single place to initialize Admin SDK later.
- [x] Add emulator test structure.
  - Files: `tests/`, `functions/test/`, `firebase/`.
  - Done when: security/function tests have a documented run command.
- [x] Keep Firestore, Storage, and Realtime Database rules closed.
  - Files: `firebase/*.rules*`.
  - Done when: tests prove closed-by-default access remains closed.

Owner review: confirm no production Firebase project IDs or secrets were committed.

## Phase 6: Shared Product Contracts

Goal: define the data language before writing workflows.

- [x] Define user/profile contracts.
- [x] Define game catalog contracts.
- [x] Define room and match contracts.
- [x] Define analytics event names.

Owner review: approve field names before Firebase writes exist.

## Phase 7: Auth And Profile Flow

Goal: identify users before room/match features.

- [x] Add Auth UI shell with email, Google, and guest-mode states.
- [x] Add profile view connected to the shared profile contract.
- [x] Add protected-route behavior.

Owner review: confirm auth UX before wiring live Firebase providers.

## Phase 8: Game Engine Core And Connect 4

Goal: prove the pure game-rule path before UI and backend rely on it.

- [x] Define `GameModule` contract.
- [x] Add Connect 4 initial state tests.
- [x] Add Connect 4 move validation tests.
- [x] Add Connect 4 result tests.

Owner review: inspect tests first; rule implementation should be boring after tests pass.

## Phase 9: Server-Authoritative Room And Move Path

Goal: make Cloud Functions the only official writer for match state.

- [x] Implement `createRoom` through tests.
- [x] Implement `joinRoom` through tests.
- [x] Implement `startMatch` through tests.
- [x] Implement `submitMove` for Connect 4 through tests.
- [x] Add timeout contract before timeout implementation.

Owner review: verify no client writes official match fields directly.

## Phase 10: Connect 4 Web Gameplay

Goal: connect the first playable game to official realtime state with PixiJS rendering the board.

- [x] Connect match UI to official public state.
- [x] Add interactive Connect 4 PixiJS board UI.
- [x] Add realtime match subscription boundary.
- [x] Add result screen path.

Owner review: play flow should feel clear on mobile before adding Caro.

## Phase 11: Caro MVP

Goal: add the second game after the platform path works.

- [x] Add Caro state and board-size tests.
- [x] Add five-in-row result tests.
- [x] Add Caro move validation tests.
- [x] Add Caro match UI using the same match shell.

Owner review: confirm Connect 4 patterns are reused through the shared game module and local match source shape.

## Phase 12: Ranking, History, And Progression

Goal: add retention systems after core gameplay is real.

- [x] Add Elo helper tests.
- [x] Add match history writes through functions.
- [x] Add leaderboard read UI.
- [x] Add profile stats UI.

Owner review: progression numbers are contract-backed and reward economy remains out of scope.

## Phase 13: Admin, Moderation, And Safety

Goal: create operational controls without overbuilding.

- [ ] Add admin route behavior.
- [ ] Add report user contract and UI.
- [ ] Add feature flag contract for games.

Owner review: keep admin MVP minimal; do not build a full back office too early.

## Phase 14: Content, Policy Pages, Ads, Deploy And Operations

Goal: prepare for public deploy and monetization without harming gameplay.

- [ ] Add final privacy policy, terms, and contact content.
- [ ] Add game rules guide pages for Connect 4 and Caro.
- [ ] Add ad placement config contract only.
- [ ] Create Firebase dev and staging project mapping after owner approval.
- [ ] Add deploy checklist and CI checklist.

Owner review: no production deploy until staging smoke test passes.
