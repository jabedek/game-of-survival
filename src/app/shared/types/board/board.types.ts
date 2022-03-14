import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { Brood } from './brood.types';

// *** Feature state parts
export type BoardFields = Field[][];

// *** BoardFields/Particles' Neigbhors, Broods' Root Spaces
export interface NeighborField {
  field: Field | undefined;
  at: string;
}

export interface NeighborsRaport {
  all: NeighborField[];
  centerField: Field;
  units: NeighborField[];
  obsticles: NeighborField[];
  accessible: NeighborField[]; //
  accessibleToMove: NeighborField[]; // nie ma ruchow na skos wiec tylko na krzyz
}

export type BasicInitialBroodFields = [Field, Field, Field, Field];

export interface ValidPotentialBroodSpace {
  startingPos: FieldPos;
  space: BasicInitialBroodFields;
}

export type NeighborsAndBroods = {
  fieldsNeighbors: NeighborsRaport[];
  broodsList: Brood[];
};
