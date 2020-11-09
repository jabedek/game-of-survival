export interface Unit {
  pos: FieldPos;
  unitName: string;
  broodName: string;
}

export interface Brood {
  broodUnits: Unit[];
  broodName: string;
  broodColor: string;
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
  x: number | string;
  y: number | string;
}

export interface FieldPropertyUpdateDetails {
  pos: FieldPos;
  property: { [key: string]: any };
}
export interface AppState {
  board: BoardState;
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
