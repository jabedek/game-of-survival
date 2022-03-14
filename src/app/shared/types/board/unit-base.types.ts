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
export interface UnitBase {
  id: UnitID;
  pos: FieldPos;
  type: UnitType;
  broodId: BroodID | undefined;
}
