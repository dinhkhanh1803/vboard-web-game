# VBoard Arena Copilot Instructions

This project is optimized for solo development with AI support.

Before suggesting code, read `AGENTS.md` and the files in `docs/control/`.

Keep suggestions scoped to one feature or checklist item. Prefer feature-local code under `src/features/<feature>` for web work, `functions/src` for backend workflows, and `game-engine/src` for pure game rules. Do not add abstractions until two real call sites need them.

The backend is server-authoritative. Client code must submit intent only; Cloud Functions validate and write official state.
