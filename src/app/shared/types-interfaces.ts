import { NEIGHBORS_BEST_CHANCES_NOT_DIE } from '../board/board.constants';

export interface ParticleUnit {
  unit: Unit;
  state: ParticleState;
  makeTurn(): boolean;
  setLongTermGoal(): boolean;
  getState(): any;
}

export interface ParticleUnitSimplified extends Unit {
  getNeighbors(): any;
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
  id: string; // name-like identifier, like 'proton-0'
  groupId: string; // name-like group identifier like 'protons'
  pos: FieldPos;
}

export class Unit implements Unit {
  constructor(id: string, groupId: string, pos: FieldPos) {
    this.id = id;
    this.groupId = groupId || null;
    this.pos = pos;
  }
}

export interface Brood {
  id: string;
  units: Unit[];
  color: string;
}
export interface NeighborField {
  field: Field;
  at: string;
}

export interface NeighborsRaport {
  all: NeighborField[];
  particles: NeighborField[];
  obsticles: NeighborField[];
}

export class Brood implements Brood {
  constructor(id: string, units: Unit[], color?: string) {
    this.id = id;
    this.units = units || null;
    this.color = color;
  }
}

export interface Field {
  pos: FieldPos;
  blocked: boolean;
  occupyingUnit?: null | Unit;
}

export class Field implements Field {
  constructor(pos: FieldPos, blocked: boolean, occupyingUnit?: Unit) {
    this.pos = pos;
    this.blocked = !!occupyingUnit || blocked;
    this.occupyingUnit = occupyingUnit || null;
  }
}

export type Fields = Field[][];

export interface PatchProperty {
  [key: string]: any;
}
export type BroodSpace = [Field, Field, Field, Field];

export interface BroodSpaceRaport {
  startingPos: FieldPos;
  space: BroodSpace;
}

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
  broods: BroodsState;
}

export interface BoardState {
  fields: [] | Fields;
}

export interface BroodsState {
  broodsOnBoard: Brood[];
  raport: BroodSpaceRaport;
}

/**
 * 0 - available to move
 * 1 - blocked by some kind of permanent obsticle
 * 2 - occupied by creature
 */
export type FieldMode = 0 | 1 | 2;

// export enum FieldMode {
//   EMPTY = 0,
//   OBSTICLE = 1,
//   PARTICLE = 2,
// }

export type FieldReference = string;
export interface BoardDynamicCSS {
  sizings: BoardDynamicCSS_sizings;
  structurings: BoardDynamicCSS_structurings;
}

export interface BoardDynamicCSS_sizings {
  boardSize_px: string;
  fieldSize_px: string;
}

export interface BoardDynamicCSS_structurings {
  display: string;
  'grid-template-columns': string;
  'grid-template-rows': string;
  width: string;
  height: string;
}
