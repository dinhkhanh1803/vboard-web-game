# Next Task

## Current Recommended Next Step

Start Phase 2 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: create the web app shell with route stubs and feature READMEs.

## Exact First Task

Add route map and app provider shell without Firebase or gameplay logic.

## Scope

- Keep React + Vite + PixiJS toolchain as-is.
- Add route definitions under `src/routes/`.
- Add app shell/provider boundaries under `src/app/`.
- Keep game rendering out of scope except for preserving the PixiJS dependency boundary.
- Do not implement auth, Firebase reads/writes, game rules, or Cloud Functions in this task.

## Expected Files

- `src/app/`
- `src/routes/`
- `src/shared/components/`
- `src/features/*/README.md`

## Verification

Make these commands pass:

```bash
npm run build
npm run lint
npm run test
npm run typecheck
```
