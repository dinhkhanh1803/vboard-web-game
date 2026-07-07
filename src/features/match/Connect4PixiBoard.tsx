import { useEffect, useRef, useCallback } from "react";

import {
  connect4ColumnCount,
  connect4RowCount,
  type Connect4Cell,
  type Connect4State,
} from "@engine/index";

export type Connect4PixiBoardProps = {
  state: Connect4State;
  disabled: boolean;
  onColumnSelect(column: number): void;
};

const boardWidth = 700;
const boardHeight = 600;
const cellSize = 82;
const cellGap = 10;
const boardPadding = 34;

export function Connect4PixiBoard({ state, disabled, onColumnSelect }: Connect4PixiBoardProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<import("pixi.js").Application | null>(null);
  const cellGraphicsRef = useRef<import("pixi.js").Graphics[][]>([]);
  const overlayGraphicsRef = useRef<import("pixi.js").Graphics[]>([]);
  const pixiGraphicsClassRef = useRef<typeof import("pixi.js").Graphics | null>(null);

  // Keep callback/disabled refs fresh to avoid re-binding Pixi event handlers
  const onColumnSelectRef = useRef(onColumnSelect);
  const disabledRef = useRef(disabled);
  const drawBoardRef = useRef<(() => void) | null>(null);

  // Render/update the board cells based on latest state
  const drawBoard = useCallback(() => {
    const cellGraphics = cellGraphicsRef.current;
    if (cellGraphics.length === 0) return;

    for (let rowIndex = 0; rowIndex < connect4RowCount; rowIndex += 1) {
      const rowCells = cellGraphics[rowIndex];
      if (!rowCells) continue;
      for (let columnIndex = 0; columnIndex < connect4ColumnCount; columnIndex += 1) {
        const disc = rowCells[columnIndex];
        if (!disc) continue;
        const cell = state.board[rowIndex]?.[columnIndex] ?? null;

        const cx = boardPadding + columnIndex * (cellSize + cellGap) + cellSize / 2;
        const cy = boardPadding + rowIndex * (cellSize + cellGap) + cellSize / 2;
        const r = cellSize / 2;

        disc.clear();

        // Draw socket background (empty slot)
        disc.circle(cx, cy, r).fill(0x060913).stroke({ color: 0x1e293b, width: 3 });

        // Draw player token if present
        if (cell === 0) {
          // Player 1: Neon Crimson Rose with center glow
          disc.circle(cx, cy, r).fill(0xf43f5e).stroke({ color: 0xff8b7a, width: 3 });
          disc.circle(cx, cy, r / 2.2).fill(0xffaa9e);
        } else if (cell === 1) {
          // Player 2: Neon Amber with center glow
          disc.circle(cx, cy, r).fill(0xf59e0b).stroke({ color: 0xffe4a0, width: 3 });
          disc.circle(cx, cy, r / 2.2).fill(0xffecb8);
        }
      }
    }
  }, [state.board]);

  useEffect(() => {
    onColumnSelectRef.current = onColumnSelect;
    disabledRef.current = disabled;
    drawBoardRef.current = drawBoard;
  }, [onColumnSelect, disabled, drawBoard]);

  // Handle initialization once on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function mountPixiBoard() {
      const host = hostRef.current;
      if (host === null) return;

      host.replaceChildren();

      if (import.meta.env.MODE === "test") {
        host.dataset.pixiStatus = "test-skip";
        return;
      }

      try {
        const { Application, Graphics } = await import("pixi.js");
        const app = new Application();
        await app.init({
          antialias: true,
          backgroundAlpha: 0,
          height: boardHeight,
          width: boardWidth,
        });

        if (cancelled) {
          app.destroy(true);
          return;
        }

        pixiGraphicsClassRef.current = Graphics;
        appRef.current = app;
        app.canvas.className = "connect4-canvas";
        host.appendChild(app.canvas);

        // 1. Draw Futuristic Board Frame
        const boardFrame = new Graphics()
          .roundRect(0, 0, boardWidth, boardHeight, 26)
          .fill(0x0b0f19)
          .stroke({ color: 0x38bdf8, width: 4 });
        app.stage.addChild(boardFrame);

        // 2. Initialize graphics for each cell slot
        const cellGraphics: import("pixi.js").Graphics[][] = [];
        for (let rowIndex = 0; rowIndex < connect4RowCount; rowIndex += 1) {
          const row: import("pixi.js").Graphics[] = [];
          for (let columnIndex = 0; columnIndex < connect4ColumnCount; columnIndex += 1) {
            const disc = new Graphics();
            app.stage.addChild(disc);
            row.push(disc);
          }
          cellGraphics.push(row);
        }
        cellGraphicsRef.current = cellGraphics;

        // 3. Create Column Hover Overlays
        const overlays: import("pixi.js").Graphics[] = [];
        for (let columnIndex = 0; columnIndex < connect4ColumnCount; columnIndex += 1) {
          const colX = boardPadding + columnIndex * (cellSize + cellGap);
          const colWidth = cellSize;
          const colHeight = boardHeight - boardPadding * 2;

          const overlay = new Graphics();

          // Initial transparent fill for hit detection
          overlay
            .roundRect(colX, boardPadding, colWidth, colHeight, 8)
            .fill({ color: 0x38bdf8, alpha: 0.001 });

          overlay.eventMode = "static";

          // Hover interactions
          overlay.on("pointerover", () => {
            if (!disabledRef.current) {
              overlay
                .clear()
                .roundRect(colX, boardPadding, colWidth, colHeight, 8)
                .fill({ color: 0x38bdf8, alpha: 0.12 });
            }
          });

          overlay.on("pointerout", () => {
            overlay
              .clear()
              .roundRect(colX, boardPadding, colWidth, colHeight, 8)
              .fill({ color: 0x38bdf8, alpha: 0.001 });
          });

          overlay.on("pointertap", () => {
            if (!disabledRef.current) {
              onColumnSelectRef.current(columnIndex + 1);
            }
          });

          app.stage.addChild(overlay);
          overlays.push(overlay);
        }
        overlayGraphicsRef.current = overlays;

        // Draw initial board slots
        drawBoardRef.current?.();

        cleanup = () => {
          app.destroy(true);
        };
      } catch (err) {
        console.error("Connect4 Pixi init error:", err);
        host.dataset.pixiStatus = "fallback";
      }
    }

    void mountPixiBoard();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []); // Run once on mount!

  // Update board when state changes
  useEffect(() => {
    drawBoard();
  }, [state, drawBoard]);

  // Dynamic cursor updates when disabled state shifts
  useEffect(() => {
    const overlays = overlayGraphicsRef.current;
    overlays.forEach((overlay) => {
      overlay.cursor = disabled ? "default" : "pointer";
    });
  }, [disabled]);

  return (
    <div className="connect4-board" aria-label="Interactive Connect 4 PixiJS board">
      <div ref={hostRef} className="connect4-pixi-layer" aria-hidden="true" />
      <div className="connect4-board-fallback" aria-hidden="true">
        {state.board.flat().map((cell, index) => (
          <span key={index} className={`connect4-disc ${getDiscClassName(cell)}`} />
        ))}
      </div>
      <div className="connect4-column-controls" aria-label="Connect 4 columns">
        {Array.from({ length: connect4ColumnCount }, (_, columnIndex) => {
          const column = columnIndex + 1;
          const columnFull = state.board[0]?.[columnIndex] !== null;

          return (
            <button
              key={column}
              type="button"
              aria-label={`Drop disc in column ${column}`}
              disabled={disabled || columnFull}
              onClick={() => onColumnSelect(column)}
            >
              {column}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getDiscClassName(cell: Connect4Cell): string {
  if (cell === 0) {
    return "is-red";
  }

  if (cell === 1) {
    return "is-yellow";
  }

  return "is-empty";
}
