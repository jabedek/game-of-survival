import { FieldPos } from './field.types';
import { BroodID, UnitBase, UnitColor, UnitID, UnitType } from './unit-base.types';

export interface IUnit extends UnitBase {
  state?: UnitState;
  color?: UnitColor;
  makeTurn?(): boolean;
  setLongTermGoal?(): boolean;
  getState?(): any;
}

export class Unit implements UnitBase {
  id: UnitID;
  pos: FieldPos;
  type: UnitType;
  color: UnitColor;
  broodId: BroodID | undefined;

  state: UnitState | undefined;
  makeTurn?(): boolean;
  setLongTermGoal?(): boolean;
  getState?(): any;

  constructor(id: UnitID, pos: FieldPos, color: UnitColor, broodId: BroodID | undefined, type: UnitType = 'regular', state?: UnitState | undefined) {
    this.id = id;
    this.broodId = broodId;
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
