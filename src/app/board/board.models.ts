import { FieldPos } from './field/field.component';

export interface Field {
  pos: FieldPos;
  blocked: boolean;
  blockedBy?: string;
}

export class Field implements Field {
  constructor(pos: FieldPos, blocked: boolean, blockedBy?: string) {
    this.pos = pos;

    this.blocked = blocked;
    this.blockedBy = blockedBy;
  }
}

export type Fields = Field[][];
