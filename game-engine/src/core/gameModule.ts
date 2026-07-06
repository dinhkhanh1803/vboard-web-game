import type { GameId } from "@contracts/gameCatalog";
import type { MatchResultReason } from "@contracts/roomMatch";

export type GameModuleMetadata = {
  gameId: GameId;
  rulesEngineKey: string;
  displayName: string;
  minPlayers: number;
  maxPlayers: number;
};

export type CreateInitialStateInput = {
  seed: string;
};

export type ValidateMoveInput<TState, TMove> = {
  state: TState;
  move: TMove;
  actorSeatIndex: number;
};

export type ApplyMoveInput<TState, TMove> = ValidateMoveInput<TState, TMove>;

export type EvaluateResultInput<TState> = {
  state: TState;
};

export type ValidMoveResult = {
  ok: true;
};

export type InvalidMoveResult = {
  ok: false;
  reason: string;
};

export type MoveValidationResult = ValidMoveResult | InvalidMoveResult;

export type GameResultStatus = "in-progress" | "win" | "draw" | "abandoned";

export type GameResultEvaluation = {
  status: GameResultStatus;
  winnerSeatIndex: number | null;
  reason: MatchResultReason | null;
};

export type PublicGameState = Record<string, unknown>;

export type GameModule<TState, TMove, TPublicState extends PublicGameState = PublicGameState> = {
  metadata: GameModuleMetadata;
  createInitialState(input: CreateInitialStateInput): TState;
  validateMove(input: ValidateMoveInput<TState, TMove>): MoveValidationResult;
  applyMove(input: ApplyMoveInput<TState, TMove>): TState;
  evaluateResult(input: EvaluateResultInput<TState>): GameResultEvaluation;
  serializePublicState(state: TState): TPublicState;
};

export function createGameModuleContractFixture<
  TState,
  TMove,
  TPublicState extends PublicGameState = PublicGameState,
>(module: GameModule<TState, TMove, TPublicState>): GameModule<TState, TMove, TPublicState> {
  return module;
}
