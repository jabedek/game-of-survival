import { FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from './board/unit.types';

export enum GameTurnPhase {
  PENDING = 'PENDING',
  ALL_DONE = 'ALL_DONE',
}

export enum GroupTurnPhase {
  TO_DO = 'TO_DO',
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export interface TurnUpdate {
  unitsToAdd: Unit[];
  unitsToDel: FieldPos[];
}
