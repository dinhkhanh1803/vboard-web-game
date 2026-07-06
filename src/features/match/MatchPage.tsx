import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { GameId } from "@contracts/gameCatalog";
import { CaroPixiBoard } from "@/features/match/CaroPixiBoard";
import { Connect4PixiBoard } from "@/features/match/Connect4PixiBoard";
import {
  createLocalCaroMatchSource,
  getActiveCaroPlayer,
  getCaroPublicState,
} from "@/features/match/caroLocalMatch";
import {
  createLocalConnect4MatchSource,
  getActivePlayer,
  getConnect4PublicState,
} from "@/features/match/connect4LocalMatch";

export type MatchPageProps = {
  initialGameId?: GameId;
};

const connect4PlayerLabels = ["Red", "Yellow"] as const;
const caroPlayerLabels = ["Black", "White"] as const;

export function MatchPage({ initialGameId = "connect-4" }: MatchPageProps) {
  if (initialGameId === "caro") {
    return <CaroMatchPage />;
  }

  return <Connect4MatchPage />;
}

function Connect4MatchPage() {
  const matchSource = useMemo(
    () => createLocalConnect4MatchSource({ matchId: "demo-match", nowMs: 1_000 }),
    [],
  );
  const snapshot = useSyncExternalStore(
    matchSource.subscribe,
    matchSource.getSnapshot,
    matchSource.getSnapshot,
  );
  const publicState = getConnect4PublicState(snapshot.match);
  const activePlayer = getActivePlayer(snapshot.match);
  const winner = snapshot.match.players.find(
    (player) => player.seatIndex === snapshot.match.result.winnerSeatIndex,
  );
  const matchCompleted = snapshot.match.status === "completed";
  const handleColumnSelect = useCallback(
    (column: number) => {
      matchSource.submitMove(column);
    },
    [matchSource],
  );

  return (
    <section className="screen match-screen" aria-labelledby="match-title">
      <header className="screen-header compact-screen-header">
        <p className="screen-eyebrow">Local gameplay preview</p>
        <h1 id="match-title">Connect 4 Match</h1>
        <p>
          First playable path uses the same public state shape that the server-authoritative layer
          writes later.
        </p>
      </header>

      <div className="match-layout playable-match-layout">
        <aside className="panel player-panel" aria-label="Player status">
          {snapshot.match.players.map((player) => {
            const isActive = player.seatIndex === snapshot.match.turn.activeSeatIndex;

            return (
              <div key={player.uid} className={isActive ? "player-slot is-active" : "player-slot"}>
                <p className="meta-label">{connect4PlayerLabels[player.seatIndex] ?? "Player"}</p>
                <h2>{player.displayName}</h2>
                <p>{isActive ? `Turn: ${player.displayName}` : "Waiting"}</p>
              </div>
            );
          })}

          <dl className="compact-facts match-facts">
            <div>
              <dt>Version</dt>
              <dd>{snapshot.match.stateVersion}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{matchCompleted ? "Completed" : "Active"}</dd>
            </div>
          </dl>
        </aside>

        <div className="board-stage playable-board-stage">
          <div className="board-stage-label">PixiJS board</div>
          <Connect4PixiBoard
            disabled={matchCompleted}
            onColumnSelect={handleColumnSelect}
            state={publicState}
          />
          {!matchCompleted && activePlayer ? (
            <p className="turn-banner">Turn: {activePlayer.displayName}</p>
          ) : null}
        </div>

        <aside className="panel move-panel" aria-labelledby="move-log-title">
          <h2 id="move-log-title">Move Log</h2>
          {snapshot.moveLogEntries.length === 0 ? (
            <p>No moves yet</p>
          ) : (
            <ol>
              {snapshot.moveLogEntries.map((move) => (
                <li key={move.id}>
                  {getConnect4MoveLabel(move.actorSeatIndex)} C{Number(move.payload.column) + 1}
                </li>
              ))}
            </ol>
          )}

          {matchCompleted ? (
            <div className="result-panel" role="status">
              <h2>{winner ? `${winner.displayName} wins` : "Draw match"}</h2>
              <p>Result: {snapshot.match.result.reason ?? "completed"}</p>
              <button type="button" onClick={() => matchSource.reset()}>
                Reset local match
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => matchSource.reset()}>
              Reset local match
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}

function CaroMatchPage() {
  const matchSource = useMemo(
    () => createLocalCaroMatchSource({ matchId: "demo-caro", nowMs: 1_000 }),
    [],
  );
  const snapshot = useSyncExternalStore(
    matchSource.subscribe,
    matchSource.getSnapshot,
    matchSource.getSnapshot,
  );
  const publicState = getCaroPublicState(snapshot.match);
  const activePlayer = getActiveCaroPlayer(snapshot.match);
  const winner = snapshot.match.players.find(
    (player) => player.seatIndex === snapshot.match.result.winnerSeatIndex,
  );
  const matchCompleted = snapshot.match.status === "completed";
  const handleCellSelect = useCallback(
    (row: number, column: number) => {
      matchSource.submitMove(row, column);
    },
    [matchSource],
  );

  return (
    <section className="screen match-screen" aria-labelledby="match-title">
      <header className="screen-header compact-screen-header">
        <p className="screen-eyebrow">Local gameplay preview</p>
        <h1 id="match-title">Caro Match</h1>
        <p>
          Caro now uses the shared match state contract locally, ready for server-authoritative move
          validation after the interface is stable.
        </p>
      </header>

      <div className="match-layout playable-match-layout caro-match-layout">
        <aside className="panel player-panel" aria-label="Player status">
          {snapshot.match.players.map((player) => {
            const isActive = player.seatIndex === snapshot.match.turn.activeSeatIndex;

            return (
              <div key={player.uid} className={isActive ? "player-slot is-active" : "player-slot"}>
                <p className="meta-label">{caroPlayerLabels[player.seatIndex] ?? "Player"}</p>
                <h2>{player.displayName}</h2>
                <p>{isActive ? `Turn: ${player.displayName}` : "Waiting"}</p>
              </div>
            );
          })}

          <dl className="compact-facts match-facts">
            <div>
              <dt>Version</dt>
              <dd>{snapshot.match.stateVersion}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{matchCompleted ? "Completed" : "Active"}</dd>
            </div>
          </dl>
        </aside>

        <div className="board-stage playable-board-stage caro-board-stage">
          <div className="board-stage-label">PixiJS board</div>
          <CaroPixiBoard
            disabled={matchCompleted}
            onCellSelect={handleCellSelect}
            state={publicState}
          />
          {!matchCompleted && activePlayer ? (
            <p className="turn-banner">Turn: {activePlayer.displayName}</p>
          ) : null}
        </div>

        <aside className="panel move-panel" aria-labelledby="move-log-title">
          <h2 id="move-log-title">Move Log</h2>
          {snapshot.moveLogEntries.length === 0 ? (
            <p>No moves yet</p>
          ) : (
            <ol>
              {snapshot.moveLogEntries.map((move) => (
                <li key={move.id}>
                  {getCaroMoveLabel(
                    move.actorSeatIndex,
                    Number(move.payload.row),
                    Number(move.payload.column),
                  )}
                </li>
              ))}
            </ol>
          )}

          {matchCompleted ? (
            <div className="result-panel" role="status">
              <h2>{winner ? `${winner.displayName} wins` : "Draw match"}</h2>
              <p>Result: {snapshot.match.result.reason ?? "completed"}</p>
              <button type="button" onClick={() => matchSource.reset()}>
                Reset local match
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => matchSource.reset()}>
              Reset local match
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}

function getConnect4MoveLabel(seatIndex: number): string {
  return seatIndex === 0 ? "Red" : "Yellow";
}

function getCaroMoveLabel(seatIndex: number, row: number, column: number): string {
  const playerLabel = seatIndex === 0 ? "Black" : "White";

  return `${playerLabel} R${row + 1} C${column + 1}`;
}
