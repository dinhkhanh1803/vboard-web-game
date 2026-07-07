# Kinetic Grid UI Theme Design

## Goal

Apply the approved Kinetic Grid visual direction across the VBoard Arena web app before deeper backend work resumes.

## Visual Direction

- Dark navy app background with a subtle grid/dotted texture.
- Layered panel surfaces in deep blue/navy.
- Small-radius cards and controls, capped at 8px.
- Purple focus/border energy, red-orange primary actions, cyan secondary accents.
- Game-first layout: match boards and play actions stay visually dominant.

## Scope

- Apply the theme to the app shell, navigation, panels, buttons, inputs, status pills, tables, Home, Games, Lobby, Waiting Room, and Match screens.
- Keep the existing React + Vite + TypeScript structure.
- Keep PixiJS board components and local match sources intact.
- Do not add Firebase configuration, listeners, writes, auth changes, ads, or backend code.
- Do not add dependencies.

## Implementation Boundaries

- Add a stable `data-theme="kinetic-grid"` marker on the app frame.
- Centralize palette and surface values as CSS custom properties in `src/styles/global.css`.
- Prefer changing shared classes over adding screen-specific one-off styles.
- Keep all UI text and controls readable at desktop and mobile widths.

## Acceptance Criteria

- The app uses the dark Kinetic Grid theme globally.
- Core routes keep their existing behavior and accessible names.
- `/matches/demo-match` and `/matches/demo-caro` keep playable PixiJS boards.
- Mobile width around 390px has no horizontal overflow.
- Verification commands pass: format, typecheck, lint, build, and tests.
