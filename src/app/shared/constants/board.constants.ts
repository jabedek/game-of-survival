import { NeighborDirections } from '../types/board/board.types';

// ### REPRO
export const CHANCES_TO_DIE_BASE = 95; // = 95 MEANS 95% ADDED TO PROBABILITY
export const BASE_CHANCES_TO_PARTICLE_MULTIPLY_WITH_NEIGHBORS = 5;
export const RANDOM_ADDITIONAL_LIMIT = 5;

// ### BOARD ###
export const BOARD_DIMENSIONS = 20; // do 15 działa bez straty płynności, głównie przy togglowaniu borderów

// ### FIELD ###
export const FIELD_DISPLAY_INFO = false;

export const FIELD_CONTENT_REDUCING_FACTOR = 0.8;
const MULTIPLIER = 6;

export type FieldSize = 4 | 5 | 6 | 7;

export const FIELD_SIZES: FieldSize[] = [4, 5, 6, 7];

/**
 * Value passed down to Board component as a number of pixels for each Field's height and width.
 */

export const DEFAULT_FIELD_SIZE_COMPUTED = MULTIPLIER * FIELD_SIZES[1];

export const getFieldSizeComputed = (size: number): number => MULTIPLIER * size;

export const RELATIVE_POSITIONS: any[] = [
  { at: NeighborDirections.NW, relRow: -1, relCol: -1 },
  { at: NeighborDirections.N, relRow: -1, relCol: 0 },
  { at: NeighborDirections.NE, relRow: -1, relCol: +1 },

  { at: NeighborDirections.W, relRow: 0, relCol: -1 },
  { at: NeighborDirections.E, relRow: 0, relCol: +1 },

  { at: NeighborDirections.SW, relRow: +1, relCol: -1 },
  { at: NeighborDirections.S, relRow: +1, relCol: 0 },
  { at: NeighborDirections.SE, relRow: +1, relCol: +1 },
];

export const DIMENSIONS_RANGE = { min: 5, max: 25, default: 20 };
