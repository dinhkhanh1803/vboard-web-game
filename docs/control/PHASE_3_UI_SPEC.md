# Phase 3 UI Screen Foundation Spec

Date: 2026-07-06
Branch: `phase/3-ui-static-screens`

## Decision

Phase 3 prioritizes frontend review screens before Firebase or backend work. The owner wants the user interface and product flow to be visible, easy to inspect in VS Code, and safe for AI-assisted iteration before any real backend configuration starts.

## Scope

Build static, non-connected UI screens for:

- Game catalog with Connect 4 and Caro cards.
- Lobby with quick match, join-by-code, and public room preview.
- Waiting room with room code, invite action, player slots, and ready check.
- Match screen with player panels, PixiJS board mount boundary, move log, and disabled match actions.
- Leaderboard, profile, admin, and public content shells.

All live actions must remain disabled or local-only. No Firebase app, project ID, provider, security rule change, or production secret is introduced in this phase.

## Architecture

- Keep route ownership in `src/app/App.tsx` and metadata in `src/routes/routeConfig.ts`.
- Put screen components inside `src/features/*` so the owner and AI can find feature code quickly.
- Put static demo data in `src/shared/constants/staticDemoData.ts` so mock content is not scattered across components.
- Keep the PixiJS integration as a labeled mount boundary only; actual Pixi rendering comes after UI review.

## Testing

Use React Testing Library route-level tests in `src/app/App.test.tsx`.

The tests assert that each key route renders the expected screen contract and that disabled controls stay disabled until backend work begins.
