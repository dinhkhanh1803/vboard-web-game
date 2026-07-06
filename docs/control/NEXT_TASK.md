# Next Task

## Current Recommended Next Step

Start Phase 1 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: install and configure the real TypeScript toolchain without building product features yet.

## Exact First Task

Install Vite React TypeScript plus PixiJS at the repo root and make the blank app runnable.

## Scope

- Configure Vite React in the root web app.
- Add PixiJS as the selected game rendering dependency.
- Add `index.html` and minimal app entry files under `src/`.
- Keep existing folder boundaries from `docs/control/FOLDER_MAP.md`.
- Do not implement auth, Firebase reads/writes, game rules, or Cloud Functions in this task.
- Do not connect production Firebase secrets.

## Expected Files

- `package.json`
- `index.html`
- `src/app/`
- `src/routes/`
- `src/styles/`
- `tsconfig*.json`

## Verification

After the toolchain is installed, make these commands pass:

```bash
npm run build
npm run lint
npm run test
npm run typecheck
```

## Owner Decision Needed

Dependency installation approved by owner on 2026-07-06 for React + Vite + TypeScript + PixiJS toolchain setup.