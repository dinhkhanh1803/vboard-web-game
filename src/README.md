# Web Client Source

This folder will contain the React web app.

## Responsibilities

- Render product UI.
- Subscribe to narrow Firebase client reads.
- Send user intent to Cloud Functions.
- Keep match UI responsive while official state comes from Firestore.

## Boundaries

- Do not write official match state from the client.
- Do not update ranking, winner, timer, or private opponent state from the client.
- Keep feature code in `src/features/<feature>`.
- Promote shared code only after two real features need it.

## Planned Layout

```text
app/          App shell, providers, and route registration
routes/       Route-level screens
features/     Product features
shared/       Reusable UI, constants, types, and utilities
firebase/     Firebase client initialization and emulator wiring
styles/       Global styles and design tokens
test/         Web test utilities
```
