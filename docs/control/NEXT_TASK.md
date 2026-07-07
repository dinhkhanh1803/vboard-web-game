# Next Task

## Current Recommended Next Step

Move from UI polish to backend integration. The immediate backend focus is server-authoritative room and match callable Functions around the existing pure domain commands.

## Exact First Task

Implement BE-1: callable Cloud Functions boundaries for `createRoom`, `joinRoom`, `startMatch`, and `submitMove` using `functions/src/domain/roomMatchCommands.ts` as the only source of room/match state transitions.

## Scope

- Backend-first only.
- Do not create or configure a real Firebase project until the owner explicitly approves it.
- Use local tests, emulator-ready boundaries, or test doubles before live Firebase wiring.
- Keep clients as intent senders; client code must not write official room, match, result, turn, timer, ranking, or private opponent state.
- Do not change high-fidelity UI except for minimal wiring after callable contracts exist.

## Expected Files

- `functions/src/callable/`
- `functions/src/domain/`
- `functions/src/integrations/`
- `functions/test/`
- `firebase/`
- `docs/control/PROGRESS.md`

## Verification

Make these commands pass:

```bash
npm run typecheck
npm run lint
npm run build
npm run test
```
