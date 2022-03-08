import { FieldPos } from './field.types';
import { UnitBase, UnitColor, UnitType } from './unit-base.types';

export interface Unit extends UnitBase {
  state: UnitState;
  color: UnitColor;
  makeTurn?(): boolean;
  setLongTermGoal?(): boolean;
  getState?(): any;
}

export class Unit implements Unit {
  constructor(id: string, pos: FieldPos, color: UnitColor, broodId?: string, state?: UnitState, type?: UnitType) {
    this.id = id;
    this.broodId = broodId || undefined;
    this.pos = pos;
    this.color = color;
    this.state = state;
    this.type = type;
  }
}

// export interface Particle {
//   name: string;
//   broodName: string;
//   CSSrgba: string;
//   CSSsize: { height: string; width: string };
// }

export interface UnitState {
  // chancesToDieBase: number;
  // chancesToDieThisTurn: number;
  // chancesToReproduceThisTurn: number;
  // neighborsThisTurn: number;
  // neighborsBestChancesRepro: number;
  // neighborsBestChancesNotDie: NEIGHBORS_BEST_CHANCES_NOT_DIE;
  // availableSpotsThisTurn: number;
  // gainedAbilities: any[];
  // gainedProperties: any[];
  // CSSstylesThisTurn: any[];
  // penaltyTurnsToWait: number;
  // entangledChildrenIds: string[];
}
