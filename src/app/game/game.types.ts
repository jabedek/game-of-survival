import { ParticleUnit } from '../board/board/board.types';
import { FieldPos } from '../board/board/field.types';

export interface GameState {
  turn: TurnState;
}

export interface TurnState {
  index: number;
  phase: 'pending' | 'all done';
  update: TurnUpdate;
}

export interface BroodTurn {
  phase: 'pending' | 'done';
}

export interface TurnUpdate {
  unitsToAdd: ParticleUnit[];
  unitsToDel: FieldPos[];
}
