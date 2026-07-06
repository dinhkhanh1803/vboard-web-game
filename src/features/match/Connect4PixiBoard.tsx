import { useEffect, useRef } from "react";

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

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function mountPixiBoard() {
      const host = hostRef.current;

      if (host === null) {
        return;
      }

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
          app.destroy();
          return;
        }

        app.canvas.className = "connect4-canvas";
        host.appendChild(app.canvas);

        const board = new Graphics()
          .roundRect(0, 0, boardWidth, boardHeight, 26)
          .fill(0x2453a6)
          .stroke({ color: 0x163b7c, width: 6 });
        app.stage.addChild(board);

        for (let rowIndex = 0; rowIndex < connect4RowCount; rowIndex += 1) {
          for (let columnIndex = 0; columnIndex < connect4ColumnCount; columnIndex += 1) {
            const cell = state.board[rowIndex]?.[columnIndex] ?? null;
            const disc = new Graphics()
              .circle(
                boardPadding + columnIndex * (cellSize + cellGap) + cellSize / 2,
                boardPadding + rowIndex * (cellSize + cellGap) + cellSize / 2,
                cellSize / 2,
              )
              .fill(getDiscColor(cell))
              .stroke({ color: 0x0f2f64, width: 4 });

            disc.eventMode = disabled ? "none" : "static";
            disc.cursor = disabled ? "default" : "pointer";
            disc.on("pointertap", () => onColumnSelect(columnIndex + 1));
            app.stage.addChild(disc);
          }
        }

        cleanup = () => {
          app.destroy(true);
        };
      } catch {
        host.dataset.pixiStatus = "fallback";
      }
    }

    void mountPixiBoard();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [disabled, onColumnSelect, state]);

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

function getDiscColor(cell: Connect4Cell): number {
  if (cell === 0) {
    return 0xe14f55;
  }

  if (cell === 1) {
    return 0xf2c14e;
  }

  return 0xe8eef8;
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
