import { NeighborsRaport, Unit } from '@/src/app/shared/types/board.types';

// *** Fields
export type FieldReference = string;
// export type FieldMode =  0 | 1 | 2 | 3; // 0 - empty, 1 - obsticle, 2 - particle, NEW: 3 - other like box
export type FieldMode = 'obsticle' | 'particle' | 'other' | 'empty';
export interface FieldPos {
  column: number;
  row: number;
}

export interface Field {
  pos: FieldPos;
  blocked: boolean;
  mode: FieldMode;
  occupyingUnit?: null | Unit;
  highlightAccessibility?: boolean;
  neighbors?: NeighborsRaport;
}

export class Field implements Field {
  constructor(
    pos: FieldPos,
    blocked: boolean,
    mode: FieldMode,
    occupyingUnit?: null | Unit,
    highlightAccessibility?: boolean,
    neighbors?: NeighborsRaport
  ) {
    pos = this.pos;
    blocked = this.blocked;
    mode = this.mode;
    occupyingUnit = this.occupyingUnit;
    highlightAccessibility = this.highlightAccessibility;
    neighbors = this.neighbors;
  }
}
