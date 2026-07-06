# AI Workflow

Use this loop for every AI-assisted coding session.

## 1. Load Context

Read these files before editing:

1. `AGENTS.md`
2. `docs/control/PROJECT_BRIEF.md`
3. `docs/control/FOLDER_MAP.md`
4. `docs/control/PROGRESS.md`
5. `docs/control/NEXT_TASK.md`
6. The README inside the folder you plan to edit

## 2. Select One Task

Pick exactly one checklist item. If the task touches multiple areas, split it before coding.

## 3. State The Boundary

Before editing, identify:

- Feature or area.
- Files expected to change.
- Verification command.
- What is intentionally out of scope.

## 4. Edit Small

Keep each change reviewable in one VS Code diff. Prefer local helpers and local types. Promote shared code only after two real consumers need it.

## 5. Verify

Run the smallest useful verification command. For foundation changes, run all root scripts. For game rules, run only the related tests first, then the broader test command.

## 6. Update Control Files

Before ending:

- Mark progress in `docs/control/PROGRESS.md`.
- Write the next exact step in `docs/control/NEXT_TASK.md`.
- Add a short entry to `docs/control/CHANGELOG.md` when architecture or scope changes.
