import { FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from './board/unit.types';

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
  unitsToAdd: Unit[];
  unitsToDel: FieldPos[];
}
