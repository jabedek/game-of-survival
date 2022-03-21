import { NeighborsRaport } from '@/src/app/shared/types/board/board.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';

export type FieldReference = string;

export type FieldMode = 'obsticle' | 'unit' | 'other' | 'empty';

export interface FieldPos {
  column: number;
  row: number;
}

export class Field {
  pos: FieldPos;
  blocked: boolean;
  mode: FieldMode;
  occupyingUnit: Unit | undefined;
  highlightAccessibility: boolean;
  // neighbors: NeighborsRaport | undefined;

  constructor(pos: FieldPos, blocked: boolean, mode: FieldMode, occupyingUnit: Unit, highlightAccessibility: boolean) {
    this.pos = pos;
    this.blocked = blocked;
    this.mode = mode;
    this.occupyingUnit = occupyingUnit;
    this.highlightAccessibility = highlightAccessibility;
    // this.neighbors = neighbors;
  }
}
