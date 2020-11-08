export const BOARD_DIMENSIONS = 5;
export const BOARD_DIMENSIONS_X = 60;
export const BOARD_DIMENSIONS_Y = 60;

/**
 * BOARD_DIMENSIONS's value rouned up to the next even number.
 * If value already is even it will not be affected at all.
 */
export const BOARD_DIMENSIONS_ALWAYS_EVEN = Math.ceil(BOARD_DIMENSIONS / 2) * 2;

/**
 * BOARD_FIELD_SIZE's value is passed down to Field component
 * as a number of pixels for each Field's height and width.
 */
export const BOARD_FIELD_SIZE = 6 * 10; // 6 * x
