import { Brood } from '../../shared/types/board/brood.types';
import { Unit } from '../../shared/types/board/unit.types';

export function scenarioData_A(boardDimensions: number) {
  const boardOffset = boardDimensions > 10 ? 2 : 0;

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
      new Unit('blues-0', { row: boardDimensions - 1 - boardOffset, column: boardDimensions - 2 - boardOffset }, 'blue', 'blues'),
      new Unit('blues-0', { row: boardDimensions - 1 - boardOffset, column: boardDimensions - 1 - boardOffset }, 'blue', 'blues'),
    ],
    'blue'
  );

  const greenBrood: Brood = new Brood(
    'greens',
    [
      new Unit('greens-0', { row: Math.round(boardDimensions / 2) - 1, column: Math.round(boardDimensions / 2) - 1 }, 'green', 'greens'),
      new Unit('greens-0', { row: Math.round(boardDimensions / 2) - 1, column: Math.round(boardDimensions / 2) }, 'green', 'greens'),
    ],
    'green'
  );

  return [redBrood, blueBrood, greenBrood];
}
