import { FieldPos } from './field.types';

/**
 * Like 'protons444'
 */
export type BroodID = string;

/**
 * Like 'protons444-0'
 */
export type UnitID = string;

export type UnitType = 'void' | 'regular';

export type UnitColor = 'red' | 'blue' | 'green' | 'black' | 'mixed';

export class UnitBase {
  id: UnitID;
  broodId: BroodID;
  pos: FieldPos;
  type: UnitType;
  constructor(id: string, broodId: string, pos: FieldPos, type?: UnitType) {
    this.id = id;
    this.broodId = broodId || undefined;
    this.pos = pos;
    this.type = type;
  }
}