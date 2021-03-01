import { NeighborsRaport, Unit } from '../board.types';

// *** Fields
export type FieldReference = string;

/**
 * 0 - available to move
 * 1 - blocked by some kind of permanent obsticle
 * 2 - occupied by creature
 */
export type FieldMode = 0 | 1 | 2;

export interface FieldPos {
  column: number;
  row: number;
}

export interface Field {
  pos: FieldPos;
  blocked: boolean;
  occupyingUnit?: null | Unit;
  highlightAccess?: boolean;
}

export class Field implements Field {
  constructor(
    pos: FieldPos,
    blocked: boolean,
    occupyingUnit?: Unit,
    highlightAccess?: boolean
  ) {
    this.pos = pos;
    this.blocked = !!occupyingUnit || blocked;
    this.occupyingUnit = occupyingUnit || null;
    this.highlightAccess = highlightAccess;
  }
}

export type FieldInfo = {
  fieldDetails: Field;
  // highlightAccesibility?: boolean;
  neighbors: NeighborsRaport;
};
