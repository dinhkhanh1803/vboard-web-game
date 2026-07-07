# Next Task

## Current Recommended Next Step

Continue the UI Polish Track before Phase 14: polish the active match screens for Connect 4 and Caro on desktop and mobile.

## Exact First Task

Review `/matches/demo-match` and `/matches/demo-caro` in browser, then tighten match layout hierarchy so the board remains the primary focus and player/move panels stay readable on mobile.

## Scope

- Keep the work UI-only and local-state only.
- Do not change pure game-engine rules unless a UI bug exposes a rules issue.
- Do not connect Firebase listeners, writes, auth, ads, or deploy config.
- Preserve PixiJS board interactivity and current tests.

## Expected Files

- `src/features/match/`
- `src/styles/global.css`
- `src/app/App.test.tsx`
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run build
npm run test
```

Also browser-check `/matches/demo-match` and `/matches/demo-caro` at desktop and mobile widths.
