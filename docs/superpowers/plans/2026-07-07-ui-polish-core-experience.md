# UI Polish Core Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make the first web experience feel like a usable game hub by polishing the app shell, Home, Games, Lobby, and Waiting Room screens without adding Firebase or backend wiring.

**Architecture:** Keep the current React + Vite SPA structure and improve screen-level components in place. Add small local UI state only where it improves reviewability, such as room-code validation, and keep shared visual language in `src/styles/global.css`.

**Tech Stack:** React, React Router, TypeScript, CSS, Vitest, React Testing Library.

---

### Task 1: Home Game Hub Polish

**Files:**

- Modify: `src/app/HomePage.tsx`
- Modify: `src/app/App.test.tsx`
- Modify: `src/styles/global.css`

- [x] **Step 1: Write the failing test**

```tsx
renderApp("/");
expect(screen.getByRole("heading", { name: "VBoard Arena" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Play Connect 4" })).toHaveAttribute(
  "href",
  "/matches/demo-match",
);
expect(screen.getByRole("link", { name: "Open Lobby" })).toHaveAttribute("href", "/lobby");
expect(screen.getByText("Playable now")).toBeInTheDocument();
```

- [x] **Step 2: Verify RED**

Run: `npm run test -- src/app/App.test.tsx`
Expected: FAIL because the current Home route still shows stack-first copy and no game CTA links.

- [x] **Step 3: Implement minimal UI**

Replace the stack-first hero with a game hub hero, primary/secondary links, and three compact status facts. Keep the selected stack visible as secondary system context.

- [x] **Step 4: Verify GREEN**

Run: `npm run test -- src/app/App.test.tsx`
Expected: PASS.

### Task 2: Games Catalog Card Polish

**Files:**

- Modify: `src/features/games/GameCatalogPage.tsx`
- Modify: `src/app/App.test.tsx`
- Modify: `src/styles/global.css`

- [x] **Step 1: Write the failing test**

```tsx
renderApp("/games");
expect(screen.getByRole("link", { name: "Play Connect 4 demo" })).toHaveAttribute(
  "href",
  "/matches/demo-match",
);
expect(screen.getByText("Playable now")).toBeInTheDocument();
expect(screen.getByText("Preview locked")).toBeInTheDocument();
```

- [x] **Step 2: Verify RED**

Run: `npm run test -- src/app/App.test.tsx`
Expected: FAIL because catalog actions are disabled buttons today.

- [x] **Step 3: Implement minimal UI**

Use link-style CTAs for available game demos and disabled preview buttons for locked games. Keep facts and status visible in a denser card.

- [x] **Step 4: Verify GREEN**

Run: `npm run test -- src/app/App.test.tsx`
Expected: PASS.

### Task 3: Lobby Form Validation Polish

**Files:**

- Modify: `src/features/lobby/LobbyPages.tsx`
- Modify: `src/app/App.test.tsx`
- Modify: `src/styles/global.css`

- [x] **Step 1: Write the failing test**

```tsx
renderApp("/lobby");
const input = screen.getByLabelText("Room code");
fireEvent.change(input, { target: { value: "abc" } });
expect(screen.getByText("Use a code like VB-1042."));
fireEvent.change(input, { target: { value: "VB-1042" } });
expect(screen.getByRole("button", { name: "Join room preview" })).toBeEnabled();
```

- [x] **Step 2: Verify RED**

Run: `npm run test -- src/app/App.test.tsx`
Expected: FAIL because the lobby has no local validation and join remains disabled.

- [x] **Step 3: Implement minimal UI**

Add local `useState` validation for `VB-0000` format. Enable the preview button only for valid codes and show a compact status message.

- [x] **Step 4: Verify GREEN**

Run: `npm run test -- src/app/App.test.tsx`
Expected: PASS.

### Task 4: Waiting Room Scan Polish

**Files:**

- Modify: `src/features/lobby/LobbyPages.tsx`
- Modify: `src/app/App.test.tsx`
- Modify: `src/styles/global.css`

- [x] **Step 1: Write the failing test**

```tsx
renderApp("/rooms/demo-room");
expect(screen.getByText("Host ready"));
expect(screen.getByText("Opponent slot open"));
expect(screen.getByText("Local room preview"));
```

- [x] **Step 2: Verify RED**

Run: `npm run test -- src/app/App.test.tsx`
Expected: FAIL because the waiting room currently uses simple list copy.

- [x] **Step 3: Implement minimal UI**

Replace the plain list with two player-slot rows and a short room status panel.

- [x] **Step 4: Verify GREEN**

Run: `npm run test -- src/app/App.test.tsx`
Expected: PASS.

### Task 5: Browser And Full Verification

**Files:**

- Modify: `docs/control/PROGRESS.md`
- Modify: `docs/control/NEXT_TASK.md`
- Modify: `docs/control/CHANGELOG.md`

- [x] **Step 1: Run full verification**

Run:

```bash
npm run format:check
npm run typecheck
npm run lint
npm run build
npm run test
```

Expected: all commands exit 0. If Vite reports Windows sandbox `spawn EPERM`, rerun the same command outside sandbox.

- [x] **Step 2: Browser check**

Run dev server on a temporary local port. Check `/`, `/games`, `/lobby`, and `/rooms/demo-room` at desktop and mobile widths. Expected: no horizontal overflow, CTAs visible, room-code validation visible, and no overlapping text.

- [x] **Step 3: Commit and push**

```bash
git add docs/superpowers/plans/2026-07-07-ui-polish-core-experience.md src/app/HomePage.tsx src/app/App.test.tsx src/features/games/GameCatalogPage.tsx src/features/lobby/LobbyPages.tsx src/styles/global.css docs/control/PROGRESS.md docs/control/NEXT_TASK.md docs/control/CHANGELOG.md
git commit -m "feat: polish core web experience"
git push -u origin phase/ui-polish-core-experience
```
