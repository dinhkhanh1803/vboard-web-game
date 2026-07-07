import { useEffect, useRef, useCallback } from "react";

import { caroBoardSize, type CaroCell, type CaroState } from "@engine/index";

export type CaroPixiBoardProps = {
  state: CaroState;
  disabled: boolean;
  onCellSelect(row: number, column: number): void;
};

const boardSize = 720;
const boardPadding = 40;
const gridSize = boardSize - boardPadding * 2;
const gridGap = gridSize / (caroBoardSize - 1);
const stoneRadius = 16;

export function CaroPixiBoard({ state, disabled, onCellSelect }: CaroPixiBoardProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<import("pixi.js").Application | null>(null);
  const stoneGraphicsRef = useRef<import("pixi.js").Graphics[][]>([]);
  const hitAreaGraphicsRef = useRef<import("pixi.js").Graphics[][]>([]);
  const pixiGraphicsClassRef = useRef<typeof import("pixi.js").Graphics | null>(null);

  // Keep callback/disabled/state refs fresh to avoid re-binding Pixi event handlers
  const onCellSelectRef = useRef(onCellSelect);
  const disabledRef = useRef(disabled);
  const stateRef = useRef(state);
  const drawBoardRef = useRef<(() => void) | null>(null);

  // Render/update the stones based on latest board state
  const drawBoard = useCallback(() => {
    const stoneGraphics = stoneGraphicsRef.current;
    const hitAreaGraphics = hitAreaGraphicsRef.current;
    if (stoneGraphics.length === 0) return;

    for (let rowIndex = 0; rowIndex < caroBoardSize; rowIndex += 1) {
      const rowStones = stoneGraphics[rowIndex];
      const rowHits = hitAreaGraphics[rowIndex];
      if (!rowStones || !rowHits) continue;
      for (let columnIndex = 0; columnIndex < caroBoardSize; columnIndex += 1) {
        const stone = rowStones[columnIndex];
        const hitArea = rowHits[columnIndex];
        if (!stone || !hitArea) continue;
        const cell = state.board[rowIndex]?.[columnIndex] ?? null;

        const x = boardPadding + columnIndex * gridGap;
        const y = boardPadding + rowIndex * gridGap;

        stone.clear();

        if (cell !== null) {
          // Draw stone if occupied
          if (cell === 0) {
            // Player 1 (Black/Host): Neon Crimson Rose
            stone.circle(x, y, stoneRadius).fill(0xf43f5e).stroke({ color: 0xff8b7a, width: 2 });
            stone.circle(x, y, stoneRadius / 2.5).fill(0xffaa9e);
          } else {
            // Player 2 (White/Guest): Neon Cyan
            stone.circle(x, y, stoneRadius).fill(0x38bdf8).stroke({ color: 0x91ddff, width: 2 });
            stone.circle(x, y, stoneRadius / 2.5).fill(0xffffff);
          }
          // Disable hitArea interaction when cell is occupied
          hitArea.eventMode = "none";
        } else {
          // Re-enable hitArea if empty
          hitArea.eventMode = disabled ? "none" : "static";
        }
      }
    }
  }, [state.board, disabled]);

  useEffect(() => {
    onCellSelectRef.current = onCellSelect;
    disabledRef.current = disabled;
    stateRef.current = state;
    drawBoardRef.current = drawBoard;
  }, [onCellSelect, disabled, state, drawBoard]);

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
          height: boardSize,
          width: boardSize,
        });

        if (cancelled) {
          app.destroy(true);
          return;
        }

        pixiGraphicsClassRef.current = Graphics;
        appRef.current = app;
        app.canvas.className = "caro-canvas";
        host.appendChild(app.canvas);

        // 1. Draw Futuristic Cyber Board Frame
        const boardFrame = new Graphics()
          .roundRect(0, 0, boardSize, boardSize, 18)
          .fill(0x0b0f19)
          .stroke({ color: 0x7c3aed, width: 4 }); // Neon purple border
        app.stage.addChild(boardFrame);

        // 2. Draw Grid Lines
        const grid = new Graphics();
        for (let index = 0; index < caroBoardSize; index += 1) {
          const position = boardPadding + index * gridGap;
          grid.moveTo(boardPadding, position).lineTo(boardSize - boardPadding, position);
          grid.moveTo(position, boardPadding).lineTo(position, boardSize - boardPadding);
        }
        grid.stroke({ color: 0x1e293b, width: 2 }); // Dark slate line separators
        app.stage.addChild(grid);

        // 3. Initialize graphics layers for stones and hitAreas
        const stoneGraphics: import("pixi.js").Graphics[][] = [];
        const hitAreaGraphics: import("pixi.js").Graphics[][] = [];

        for (let rowIndex = 0; rowIndex < caroBoardSize; rowIndex += 1) {
          const stoneRow: import("pixi.js").Graphics[] = [];
          const hitRow: import("pixi.js").Graphics[] = [];

          for (let columnIndex = 0; columnIndex < caroBoardSize; columnIndex += 1) {
            const x = boardPadding + columnIndex * gridGap;
            const y = boardPadding + rowIndex * gridGap;

            // Stone layer
            const stone = new Graphics();
            app.stage.addChild(stone);
            stoneRow.push(stone);

            // HitArea click capture layer
            const hitArea = new Graphics()
              .rect(x - gridGap / 2, y - gridGap / 2, gridGap, gridGap)
              .fill({ alpha: 0.001, color: 0xffffff });

            hitArea.eventMode = "static";

            // Hover highlight overlay on empty cells
            hitArea.on("pointerover", () => {
              const cell = stateRef.current.board[rowIndex]?.[columnIndex] ?? null;
              if (!disabledRef.current && cell === null) {
                hitArea
                  .clear()
                  .rect(x - gridGap / 2, y - gridGap / 2, gridGap, gridGap)
                  .fill({ color: 0x7c3aed, alpha: 0.12 });
              }
            });

            hitArea.on("pointerout", () => {
              hitArea
                .clear()
                .rect(x - gridGap / 2, y - gridGap / 2, gridGap, gridGap)
                .fill({ color: 0xffffff, alpha: 0.001 });
            });

            hitArea.on("pointertap", () => {
              const cell = stateRef.current.board[rowIndex]?.[columnIndex] ?? null;
              if (!disabledRef.current && cell === null) {
                onCellSelectRef.current(rowIndex + 1, columnIndex + 1);
              }
            });

            app.stage.addChild(hitArea);
            hitRow.push(hitArea);
          }
          stoneGraphics.push(stoneRow);
          hitAreaGraphics.push(hitRow);
        }
        stoneGraphicsRef.current = stoneGraphics;
        hitAreaGraphicsRef.current = hitAreaGraphics;

        // Draw initial board slots
        drawBoardRef.current?.();

        cleanup = () => {
          app.destroy(true);
        };
      } catch (err) {
        console.error("Caro Pixi init error:", err);
        host.dataset.pixiStatus = "fallback";
      }
    }

    void mountPixiBoard();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []); // Run once on mount!

  // Update board when state or disabled changes
  useEffect(() => {
    drawBoard();
  }, [state, disabled, drawBoard]);

  // Dynamic cursor updates for empty hit areas
  useEffect(() => {
    const hitAreaGraphics = hitAreaGraphicsRef.current;
    for (let rowIndex = 0; rowIndex < caroBoardSize; rowIndex += 1) {
      const rowHits = hitAreaGraphics[rowIndex];
      if (!rowHits) continue;
      for (let columnIndex = 0; columnIndex < caroBoardSize; columnIndex += 1) {
        const hitArea = rowHits[columnIndex];
        const cell = state.board[rowIndex]?.[columnIndex] ?? null;
        if (hitArea) {
          hitArea.cursor = disabled || cell !== null ? "default" : "pointer";
        }
      }
    }
  }, [disabled, state.board]);

  return (
    <div className="caro-board" aria-label="Interactive Caro PixiJS board">
      <div ref={hostRef} className="caro-pixi-layer" aria-hidden="true" />
      <div className="caro-grid-fallback" aria-hidden="true">
        {state.board.flat().map((cell, index) => (
          <span key={index} className={`caro-fallback-cell ${getStoneClassName(cell)}`} />
        ))}
      </div>
      <div className="caro-cell-controls" aria-label="Caro cells">
        {state.board.map((row, rowIndex) =>
          row.map((cell, columnIndex) => {
            const displayRow = rowIndex + 1;
            const displayColumn = columnIndex + 1;

            return (
              <button
                key={`${displayRow}-${displayColumn}`}
                type="button"
                aria-label={`Place stone at row ${displayRow} column ${displayColumn}`}
                disabled={disabled || cell !== null}
                onClick={() => onCellSelect(displayRow, displayColumn)}
              >
                <span className={`caro-stone ${getStoneClassName(cell)}`} aria-hidden="true" />
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

function getStoneClassName(cell: CaroCell): string {
  if (cell === 0) {
    return "is-black";
  }

  if (cell === 1) {
    return "is-white";
  }

  return "is-empty";
}
