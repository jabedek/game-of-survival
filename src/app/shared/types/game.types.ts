import { ParticleUnit } from '@/src/app/shared/types/board.types';
import { FieldPos } from '@/src/app/shared/types/field.types';

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
