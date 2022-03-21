import { GameTurnPhase, TurnUpdate } from '@/src/app/shared/types/game.types';

export interface GameState {
  turn: TurnState;
  error: boolean;
}

export interface TurnState {
  index: number;
  phase: GameTurnPhase;
  update: TurnUpdate;
}
