# Control Changelog

## 2026-07-06

- Created solo-friendly AI-first project control structure.
- Chose top-level `src/`, `functions/`, and `game-engine/` folders instead of deep `apps/` and `packages/` nesting.
- Added AI guidance for Codex, Cursor, and GitHub Copilot style workflows.
- Added `IMPLEMENTATION_CHECKLIST.md` as the phase-by-phase work queue for AI-assisted development.
- Updated `NEXT_TASK.md` to point the next session at Phase 1 toolchain setup.
- Accepted React + Vite + TypeScript for the web app, PixiJS for game rendering, and deferred Next.js until SEO needs justify it.
- Added `TECH_STACK.md` as the source of truth for technology decisions.
- Started Phase 1 toolchain setup with React, Vite, TypeScript, PixiJS, ESLint, Prettier, and Vitest.
- Updated `NEXT_TASK.md` to move the next session toward Phase 2 web app shell work.
- Completed Phase 2 web app shell with route map, route stubs, development navigation, global styles, and feature READMEs.
- Reordered the roadmap so UI screens come before Firebase/backend setup.
- Completed Phase 3 UI screen foundation with static game catalog, lobby, waiting room, match shell, leaderboard, profile, admin, and content pages.
- Added `PHASE_3_UI_SPEC.md` and updated `NEXT_TASK.md` to point Phase 4 at UI review and polish.
- Started Phase 4 UI polish on phase/4-ui-polish, audited desktop/mobile routes in browser, fixed mobile horizontal overflow, hid mobile nav scrollbar, and added clearer UI-only labels for disabled frontend actions.
- Stabilized Vitest full-suite runs on Windows/Codex by using the thread pool instead of the default fork worker pool.
- Completed Phase 5 Firebase local foundation with web config parsing, client SDK boundary, Functions Admin boundary, rules baseline tests, and no real Firebase project configuration.
- Started Phase 6 shared product contracts with root contracts/ boundary and user/profile shapes for users and profilesPublic.
- Continued Phase 6 shared contracts with games/{gameId} catalog metadata, Connect 4/Caro availability, routes, player counts, and PixiJS renderer key.
- Continued Phase 6 shared contracts with rooms/{roomId}, matches/{matchId}, move logs, turn metadata, stateVersion, and result shapes.
- Completed Phase 6 shared contracts with stable analytics event names, categories, typed payloads, and contract-only event envelopes.
- Started Phase 7 auth/profile flow with a local-state Auth UI shell for email, Google, and guest modes without Firebase Auth wiring.
- Completed Phase 7 auth/profile flow with typed PublicProfile fixtures and local protected-route preview behavior without Firebase Auth wiring.
- Started Phase 8 game-engine core with a pure GameModule contract for metadata, state creation, move validation/application, result evaluation, and public state serialization.
- Completed Phase 8 game-engine core with Connect 4 initial state, move validation, immutable move application, win/draw evaluation, and focused rule tests.
- Completed Phase 9 server-authoritative room and move path with pure createRoom, joinRoom, startMatch, Connect 4 submitMove, move logs, and timeout contract tests without real Firebase project configuration.
- Completed Phase 10 Connect 4 web gameplay with local official public state, a realtime-like subscription source, interactive PixiJS board controls, move log updates, and result/reset UI without live Firebase listeners.
- Completed Phase 11 Caro MVP with pure 15x15 game-engine rules, five-in-row tests, local MatchDocument source, playable PixiJS board UI, and a `/matches/demo-caro` route without live Firebase listeners.
- Completed Phase 12 ranking, history, and progression with Elo helper tests, contract-backed leaderboard/history entries, pure Functions-domain progression write sets, and profile/leaderboard UI previews without live Firebase writes.

## 2026-07-07

- Completed Phase 13 admin, moderation, and safety with a local admin role gate, moderation report contracts, report-player preview UI, game feature flag contracts, and admin preview panels without live Firebase writes.
- Started the UI Polish Track and polished the core web experience with a game-hub Home route, clearer Games catalog states, local Lobby room-code validation, and scan-friendly Waiting Room slots without Firebase wiring.
- Configured the approved Kinetic Grid dark game UI theme across the app shell, shared surfaces, controls, and game board containers without backend or Firebase changes.
- Refactored the Lobby route into the Battle Lobby layout with quick match, join-by-code, room tools, and available rooms table while keeping actions local-only.
- Refactored the Profile route into the approved high-fidelity player dashboard with hero stats, skill distribution, weekly activity, and recent match history while keeping data local-only.
- Refactored the Privacy and Terms content route into the approved documentation layout with sidebar navigation, support card, policy cards, and local-only legal copy.
- Started backend integration with callable `createRoom`, `joinRoom`, `startMatch`, and `submitMove` handlers backed by Firestore transaction adapters and local tests, without configuring a real Firebase project.
