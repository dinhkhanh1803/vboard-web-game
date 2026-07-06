# VBoard Arena

VBoard Arena is a solo-friendly, AI-assisted realtime board game web project built with React, TypeScript, and Firebase. The first path is Connect 4 and Caro, but the foundation is designed so new games plug into one shared room, match, ranking, and analytics platform.

## Read This First

This repository is optimized for a workflow where AI writes most of the code and the owner reviews the important decisions. Before coding, every AI assistant should read:

1. `AGENTS.md`
2. `docs/control/PROJECT_BRIEF.md`
3. `docs/control/FOLDER_MAP.md`
4. `docs/control/PROGRESS.md`
5. `docs/control/NEXT_TASK.md`

## Foundation Status

This repository is scaffold-only. It defines ownership boundaries, Firebase placeholders, control docs, and VS Code helper files. It intentionally does not include app code, UI components, game rules, Cloud Functions, installed dependencies, or a lockfile yet.

## Core Principles

- Keep the project easy for one person to inspect.
- Keep AI edits small, named, and tied to one checklist item.
- Keep web code in `src/`, backend code in `functions/`, and pure rules in `game-engine/`.
- Keep clients as UI and intent senders; Cloud Functions write official match state.
- Keep Firebase rules closed until each opened path has emulator tests.

## Workspace Map

```text
src/                  React web app source, organized by feature
functions/            Firebase Cloud Functions source
game-engine/          Pure game rules, independent from UI and Firebase
firebase/             Firebase rules, indexes, and emulator config
docs/control/         Owner and AI control panel
docs/                 Architecture, Firebase, security, roadmap, and test strategy
ops/                  Deployment and operations notes
scripts/              Future local automation scripts
tests/                Future cross-area integration tests
```

## Next Milestone

Sprint 1 should add the real toolchain and first vertical slice: Vite React setup, Firebase SDK setup, Authentication shell, profile shell, game catalog, and room create/join contracts. Game logic should begin only after the shared engine contract and Firebase emulator tests are planned.
