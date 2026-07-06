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
