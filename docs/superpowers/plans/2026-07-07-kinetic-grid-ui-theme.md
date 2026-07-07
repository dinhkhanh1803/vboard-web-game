# Kinetic Grid UI Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Apply the approved Kinetic Grid dark game UI theme across the current React web app without changing gameplay or Firebase boundaries.

**Architecture:** Add a small theme contract to the app shell and centralize visual tokens in `src/styles/global.css`. Keep changes focused on shared classes and existing feature components so the solo owner can inspect the diff easily.

**Tech Stack:** React, React Router, TypeScript, CSS custom properties, PixiJS, Vitest, React Testing Library.

---

### Task 1: Theme Contract

**Files:**

- Modify: `src/app/App.test.tsx`
- Modify: `src/app/App.tsx`

- [x] **Step 1: Write the failing test**

Add an assertion that the app frame exposes `data-theme="kinetic-grid"`.

- [x] **Step 2: Verify RED**

Run: `npm run test -- src/app/App.test.tsx`
Expected: FAIL because the app frame does not expose the theme marker yet.

- [x] **Step 3: Implement minimal contract**

Add `data-theme="kinetic-grid"` to the `.app-frame` element.

- [x] **Step 4: Verify GREEN**

Run: `npm run test -- src/app/App.test.tsx`
Expected: PASS.

### Task 2: Global Theme Tokens

**Files:**

- Modify: `src/styles/global.css`

- [x] **Step 1: Replace root visual tokens**

Add CSS custom properties for Kinetic Grid background, surfaces, borders, text, primary red-orange, secondary cyan, and purple focus.

- [x] **Step 2: Apply tokens to shared classes**

Update body, nav, panels, headings, text, buttons, inputs, tables, facts, status pills, and form states to consume the new tokens.

- [x] **Step 3: Keep layout stable**

Keep existing grid breakpoints, max widths, and PixiJS board sizing unless a visual conflict appears in browser review.

### Task 3: Game Surface Polish

**Files:**

- Modify: `src/styles/global.css`

- [x] **Step 1: Polish match surfaces**

Update board-stage, player panels, move panels, result panels, Connect 4 fallback, and Caro fallback to fit the dark game theme.

- [x] **Step 2: Polish action states**

Ensure active player, turn banner, reset buttons, room validation, and disabled states remain readable.

### Task 4: Docs And Verification

**Files:**

- Modify: `docs/control/PROGRESS.md`
- Modify: `docs/control/NEXT_TASK.md`
- Modify: `docs/control/CHANGELOG.md`

- [x] **Step 1: Update control docs**

Record the theme setup and leave the next task focused on deeper match screen polish if needed.

- [x] **Step 2: Run verification**

Run:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run build
npm run test
```

- [x] **Step 3: Browser check**

Check `/`, `/games`, `/lobby`, `/rooms/demo-room`, `/matches/demo-match`, and `/matches/demo-caro` at desktop and mobile widths.
