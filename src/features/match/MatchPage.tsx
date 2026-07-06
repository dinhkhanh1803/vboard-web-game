import { useCallback, useMemo, useSyncExternalStore } from "react";

import { Connect4PixiBoard } from "@/features/match/Connect4PixiBoard";
import {
  createLocalConnect4MatchSource,
  getActivePlayer,
  getConnect4PublicState,
} from "@/features/match/connect4LocalMatch";

const playerDiscLabels = ["Red", "Yellow"] as const;

export function MatchPage() {
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
                <p className="meta-label">{playerDiscLabels[player.seatIndex] ?? "Player"}</p>
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
                  {getMoveLabel(move.actorSeatIndex)} C{Number(move.payload.column) + 1}
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

function getMoveLabel(seatIndex: number): string {
  return seatIndex === 0 ? "Red" : "Yellow";
}
