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
  occupyingUnit?: undefined | Unit;
  highlightAccessibility?: boolean | undefined;
  neighbors?: NeighborsRaport | undefined;

  constructor(
    pos: FieldPos,
    blocked: boolean,
    mode: FieldMode,
    occupyingUnit?: undefined | Unit,
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
