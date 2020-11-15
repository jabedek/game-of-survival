import { AnonymousSubject } from 'rxjs/internal/Subject';
import { NEIGHBORS_BEST_CHANCES_NOT_DIE } from '../board/board.constants';

export interface ParticleUnit {
  unit: Unit;
  state: ParticleState;
  makeTurn(): boolean;
  setLongTermGoal(): boolean;
  getState(): any;
}

export interface ParticleState {
  chancesToDieBase: number;
  chancesToDieThisTurn: number;
  chancesToReproduceThisTurn: number;
  neighborsThisTurn: number;
  neighborsBestChancesRepro: number;
  neighborsBestChancesNotDie: NEIGHBORS_BEST_CHANCES_NOT_DIE;
  availableSpotsThisTurn: number;
  gainedAbilities: any[];
  gainedProperties: any[];
  CSSstylesThisTurn: any[];
  penaltyTurnsToWait: number;
  entangledChildrenIds: string[];
}

export interface Unit {
  id: string;
  pos: FieldPos;
  name: string;
  broodId: string;
}

export interface Brood {
  id: string;
  units: Unit[];
  name: string;
  color: string;
}

export interface Field {
  pos: FieldPos;
  blocked: boolean;
  occupyingUnit?: null | Unit;
}

export class Field implements Field {
  constructor(pos: FieldPos, blocked: boolean, occupyingUnit?: Unit) {
    this.pos = pos;
    this.blocked = blocked;
    this.occupyingUnit = occupyingUnit || null;
  }
}

export type Fields = Field[][];

export interface PatchProperty {
  [key: string]: any;
}
export type BroodSpace = [Field, Field, Field, Field];

export interface FieldPos {
  column: number | string;
  row: number | string;
}

export interface FieldPropertyUpdateDetails {
  pos: FieldPos;
  property: { [key: string]: any };
}
export interface AppState {
  board: BoardState;
  particleUnits: ParticleUnit[];
}

export interface BoardState {
  fields: [] | Fields;
}

/**
 * 0 - available to move
 * 1 - blocked by some kind of permanent obsticle
 * 2 - occupied by creature
 */
export type FieldMode = 0 | 1 | 2;
