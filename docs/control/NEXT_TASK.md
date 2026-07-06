# Next Task

## Current Recommended Next Step

Start Phase 9 from `docs/control/IMPLEMENTATION_CHECKLIST.md`: implement `createRoom` through tests.

## Exact First Task

Add Cloud Functions/domain tests for the server-authoritative `createRoom` path, using the shared room and game catalog contracts before adding any Firebase writes.

## Scope

- Keep the first pass local and test-driven.
- Reuse contracts from `contracts/roomMatch.ts` and `contracts/gameCatalog.ts`.
- Keep official room/match writes behind server-side boundaries only.
- Do not connect the web client to live room creation yet.
- Do not create, select, or configure any real Firebase project until the owner explicitly approves that step.

## Expected Files

- `functions/src/`
- `functions/test/`
- `contracts/`
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
