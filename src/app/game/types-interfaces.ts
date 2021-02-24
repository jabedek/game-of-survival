import { FieldPos, ParticleUnit } from '../board/types-interfaces';

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
