import { BOARD_DIMENSIONS } from '../../shared/constants/board.constants';
import { Brood } from '../../shared/types/board/brood.types';
import { Unit } from '../../shared/types/board/unit.types';

export function scenarioData_A() {
  const boardOffset = 2;

  const redBrood: Brood = new Brood(
    'reds',
    [
      new Unit('reds-0', { row: 0 + boardOffset, column: 0 + boardOffset }, 'red', 'reds'),
      new Unit('reds-0', { row: 0 + boardOffset, column: 1 + boardOffset }, 'red', 'reds'),
    ],
    'red'
  );

  const blueBrood: Brood = new Brood(
    'blues',
    [
      new Unit(
        'blues-0',
        {
          row: BOARD_DIMENSIONS - 1 - boardOffset,
          column: BOARD_DIMENSIONS - 2 - boardOffset,
        },
        'blue',
        'blues'
      ),
      new Unit(
        'blues-0',
        {
          row: BOARD_DIMENSIONS - 1 - boardOffset,
          column: BOARD_DIMENSIONS - 1 - boardOffset,
        },
        'blue',
        'blues'
      ),
    ],
    'blue'
  );

  const greenBrood: Brood = new Brood(
    'greens',
    [
      new Unit(
        'greens-0',
        {
          row: Math.round(BOARD_DIMENSIONS / 2) - 1,
          column: Math.round(BOARD_DIMENSIONS / 2) - 1,
        },
        'green',
        'greens'
      ),
      new Unit(
        'greens-0',
        {
          row: Math.round(BOARD_DIMENSIONS / 2) - 1,
          column: Math.round(BOARD_DIMENSIONS / 2),
        },
        'green',
        'greens'
      ),
    ],
    'green'
  );

  return [redBrood, blueBrood, greenBrood];
}
