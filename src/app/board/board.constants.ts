// ### REPRO
export const CHANCES_TO_DIE_BASE = 95; // = 95 MEANS 95% ADDED TO PROBABILITY
export const BASE_CHANCES_TO_PARTICLE_MULTIPLY_WITH_NEIGHBORS = 5;
export const RANDOM_ADDITIONAL_LIMIT = 5;

// ### BOARD ###
export const BOARD_DIMENSIONS = 20; // do 15 działa bez straty płynności, głównie przy togglowaniu borderów

// ### FIELD ###
export const FIELD_DISPLAY_INFO = false;

export const PX_MULTIPLIER = 6;
/**
 * Value passed down to Board component as a number of pixels for each Field's height and width.
 */
export const FIELD_SIZE = PX_MULTIPLIER * 5;
