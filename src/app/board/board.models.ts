import { Unit } from './board.constants';
import { FieldPos } from './field/field.component';

export interface Field {
  pos: FieldPos;
  blocked: boolean;
  occupyingUnit?: Unit;
}

export class Field implements Field {
  constructor(pos: FieldPos, blocked: boolean, occupyingUnit?: Unit) {
    this.pos = pos;

    this.blocked = blocked;
    this.occupyingUnit = occupyingUnit;
  }
}

export type Fields = Field[][];
