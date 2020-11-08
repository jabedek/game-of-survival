import { Unit } from './board.constants';
import { FieldPos } from './field/field.component';

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
