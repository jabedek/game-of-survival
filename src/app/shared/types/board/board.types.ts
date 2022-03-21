import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { Group } from './group.types';

// *** Feature state parts
export type BoardFields = Field[][];

// *** BoardFields/Particles' Neigbhors, Groups' Root Spaces
export interface NeighborField {
  field: Field | undefined;
  at: NeighborDirections;
}

export enum NeighborDirections {
  NW = 'north-west',
  N = 'north',
  NE = 'north-east',

  W = 'west',
  E = 'east',

  SW = 'south-west',
  S = 'south',
  SE = 'south-east',
}

export interface NeighborsRaport {
  all: NeighborField[];
  centerField: Field | undefined;
  units: NeighborField[];
  obsticles: NeighborField[];
  accessible: NeighborField[]; //
  accessibleToMove: NeighborField[]; // nie ma ruchow na skos wiec tylko na krzyz
}

export type BasicInitialGroupFields = [Field, Field, Field, Field];

export interface ValidPotentialGroupSpace {
  startingPos: FieldPos;
  space: BasicInitialGroupFields;
}

export type NeighborsAndGroups = {
  fieldsNeighbors: NeighborsRaport[];
  groupsList: Group[];
};
