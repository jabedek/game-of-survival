import { FieldPos } from './field.types';

/**
 * Like 'protons444'
 */
export type GroupId = string;

/**
 * Like 'protons444-0'
 */
export type UnitId = string;

export type UnitType = 'void' | 'regular';

export type UnitColor = 'red' | 'blue' | 'green' | 'black' | 'mixed';
export interface UnitBase {
  id: UnitId;
  pos: FieldPos;
  type: UnitType;
  groupId: GroupId | undefined;
}
