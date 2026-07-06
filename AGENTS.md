# AI Working Rules for VBoard Arena

This repository is meant for a solo owner working with AI assistance. Keep the project easy to inspect, easy to roll back, and easy for the next AI session to understand.

## Read Order Before Coding

1. `docs/control/PROJECT_BRIEF.md`
2. `docs/control/FOLDER_MAP.md`
3. `docs/control/PROGRESS.md`
4. `docs/control/NEXT_TASK.md`
5. The README inside the folder you will edit

## Operating Rules

- Work on one checklist item at a time.
- Keep changes small enough for the owner to review in one VS Code diff.
- Do not add dependencies unless the task explicitly needs them.
- Do not create new top-level folders without updating `docs/control/FOLDER_MAP.md`.
- Do not move code across boundaries without updating the relevant README.
- Do not let client code write official match state, ranking, winner, timer, or private opponent state.
- Add or update tests before implementing game rules, Cloud Functions, or Firebase rules.
- Update `docs/control/PROGRESS.md` when a task changes status.
- Update `docs/control/NEXT_TASK.md` before ending a session.

## Preferred File Size

- Aim for focused files under 250 lines.
- Split by responsibility when a file grows hard to scan.
- Prefer feature-local helpers before global abstractions.

## Architecture Guardrails

- `src/` is the React client.
- `functions/` is the server-authoritative Firebase backend.
- `game-engine/` is pure TypeScript rules with no React or Firebase imports.
- `firebase/` is rules and indexes.
- `docs/control/` is the project control panel.

## Verification

Before claiming work is complete, run the smallest command that proves it. For scaffold-only changes, run:

```bash
npm run foundation:check
npm run build
npm run lint
npm run test
npm run typecheck
```
