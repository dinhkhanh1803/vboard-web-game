import { useEffect, useRef } from "react";

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
          height: boardSize,
          width: boardSize,
        });

        if (cancelled) {
          app.destroy();
          return;
        }

        app.canvas.className = "caro-canvas";
        host.appendChild(app.canvas);

        const board = new Graphics()
          .roundRect(0, 0, boardSize, boardSize, 18)
          .fill(0xece2c6)
          .stroke({ color: 0x776c50, width: 4 });
        app.stage.addChild(board);

        const grid = new Graphics();
        for (let index = 0; index < caroBoardSize; index += 1) {
          const position = boardPadding + index * gridGap;
          grid.moveTo(boardPadding, position).lineTo(boardSize - boardPadding, position);
          grid.moveTo(position, boardPadding).lineTo(position, boardSize - boardPadding);
        }
        grid.stroke({ color: 0x5f553f, width: 2 });
        app.stage.addChild(grid);

        for (let rowIndex = 0; rowIndex < caroBoardSize; rowIndex += 1) {
          for (let columnIndex = 0; columnIndex < caroBoardSize; columnIndex += 1) {
            const cell = state.board[rowIndex]?.[columnIndex] ?? null;
            const x = boardPadding + columnIndex * gridGap;
            const y = boardPadding + rowIndex * gridGap;

            if (cell !== null) {
              const stone = new Graphics()
                .circle(x, y, stoneRadius)
                .fill(getStoneColor(cell))
                .stroke({ color: cell === 0 ? 0x0b1020 : 0xaeb7c8, width: 3 });
              app.stage.addChild(stone);
            }

            const hitArea = new Graphics()
              .rect(x - gridGap / 2, y - gridGap / 2, gridGap, gridGap)
              .fill({ alpha: 0.001, color: 0xffffff });
            hitArea.eventMode = disabled || cell !== null ? "none" : "static";
            hitArea.cursor = disabled || cell !== null ? "default" : "pointer";
            hitArea.on("pointertap", () => onCellSelect(rowIndex + 1, columnIndex + 1));
            app.stage.addChild(hitArea);
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
  }, [disabled, onCellSelect, state]);

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

function getStoneColor(cell: CaroCell): number {
  return cell === 0 ? 0x111827 : 0xf8fafc;
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
