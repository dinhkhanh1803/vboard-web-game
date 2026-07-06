# Next Task

## Current Recommended Next Step

Add the real TypeScript toolchain without building product features yet.

## Scope

- Configure Vite React in the root web app.
- Configure TypeScript projects for `src/`, `functions/`, and `game-engine/`.
- Add ESLint, Prettier, and Vitest only if the owner approves dependency installation.
- Keep Firebase rules closed.
- Do not implement UI, game rules, or Cloud Functions in this step.

## Verification

After the toolchain is installed, the next AI session should make these commands pass:

```bash
npm run build
npm run lint
npm run test
npm run typecheck
```