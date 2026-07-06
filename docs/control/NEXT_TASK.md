# Next Task

## Current Recommended Next Step

Start Phase 4 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: review and polish the UI before backend/Firebase work begins.

## Exact First Task

Run the app locally and review the Phase 3 screens on desktop and mobile widths.

## Scope

- Check `/games`, `/lobby`, `/rooms/demo-room`, `/matches/demo-match`, `/leaderboard`, `/profile/me`, `/admin`, `/privacy-policy`, `/terms`, and `/contact`.
- Fix layout, overflow, spacing, and text hierarchy issues only.
- Keep all backend actions disabled.
- Do not create or configure any real Firebase project yet.

## Expected Files

- `src/styles/global.css`
- `src/features/*`
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
