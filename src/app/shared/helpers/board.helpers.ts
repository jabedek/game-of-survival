import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { BasicInitialBroodFields, BoardFields, NeighborField, NeighborsRaport } from '@/src/app/shared/types/board/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from '../types/board/unit.types';
import { UnitColor } from '../types/board/unit-base.types';
import { Brood } from '../types/board/brood.types';

export function getInitialFields(boardDimensions: number): BoardFields {
  let fields: BoardFields = [];

  for (let row = 0; row < boardDimensions; row++) {
    fields[row] = [];
    for (let column = 0; column < boardDimensions; column++) {
      const field: Field = {
        pos: { row, column },
        blocked: false,
        mode: 'empty',
        occupyingUnit: undefined,
        highlightAccessibility: false,
        neighbors: undefined,
      };

      fields[row][column] = field;
    }
  }

  return fields;
}

export function getPreparedBroodBase(dimensions: number, pos: FieldPos, id?: string, color?: UnitColor) {
  const broodId = id || `reds-${getRandom(1000)}`;
  const broodColor = color || 'red';

  const units = [
    new Unit(
      `${id}-0`,
      {
        row: pos.row,
        column: pos.column,
      },
      broodColor,
      broodId
    ),
    new Unit(
      `${id}-1`,
      {
        row: pos.row,
        column: pos.column + 1,
      },
      broodColor,
      broodId
    ),
    new Unit(
      `${id}-2`,
      {
        row: pos.row + 1,
        column: pos.column,
      },
      broodColor,
      broodId
    ),
    new Unit(
      `${id}-3`,
      {
        row: pos.row + 1,
        column: pos.column + 1,
      },
      broodColor,
      broodId
    ),
  ];

  const broodUnits = units.filter((u) => isFieldInBoardBoundries(dimensions, u.pos));

  return new Brood(broodId, broodUnits, broodColor);
}

export function isValidBroodRoot(fields: BoardFields, props: FieldPos): undefined | BasicInitialBroodFields {
  const column: number = +props.column;
  const row: number = +props.row;

  let available0: undefined | Field = undefined;
  let available1: undefined | Field = undefined;
  let available2: undefined | Field = undefined;
  let available3: undefined | Field = undefined;

  let posA: number;
  let posB: number;

  // 0. root - north-west
  posB = column;
  posA = row;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available0 = undefined;
  } else {
    available0 = fields[posA][posB].blocked ? undefined : fields[posA][posB];
  }

  // 1. north-east
  posB = column + 1;
  posA = row;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available1 = undefined;
  } else {
    available1 = fields[posA][posB].blocked ? undefined : fields[posA][posB];
  }

  // 2. south-west
  posB = column;
  posA = row + 1;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available2 = undefined;
  } else {
    available2 = fields[posA][posB].blocked ? undefined : fields[posA][posB];
  }

  // 3. south-east
  posB = column + 1;
  posA = row + 1;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available3 = undefined;
  } else {
    available3 = fields[posA][posB].blocked ? undefined : fields[posA][posB];
  }

  let broodFields: BasicInitialBroodFields = [undefined, undefined, undefined, undefined];
  broodFields[0] = available0;
  broodFields[1] = available1;
  broodFields[2] = available2;
  broodFields[3] = available3;

  if (available0 !== undefined && available1 !== undefined && available2 !== undefined && available3 !== undefined) {
    return broodFields;
  } else return undefined;
}

export function isClickInRectBoundries(rect: DOMRect, x: number, y: number) {
  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
  }
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function isFieldInBoardBoundries(boardDimensions: number, pos: FieldPos) {
  if (+pos.row >= 0 && +pos.column >= 0 && +pos.row < boardDimensions && +pos.column < boardDimensions) {
    return true;
  } else return false;
}

export function getFieldNeighbors(fields: BoardFields, props: FieldPos): NeighborsRaport {
  const col: number = +props.column;
  const row: number = +props.row;

  let neighbouringFields: NeighborField[] = [];

  let newFields: Field[] = [];

  // DIR: ROW, COL

  // NW: -1, -1
  if (isFieldInBoardBoundries(fields.length, { row: row - 1, column: col - 1 })) {
    neighbouringFields.push({
      field: fields[row - 1][col - 1],
      at: 'north-west',
    });
  } else {
    neighbouringFields.push({
      field: undefined,
      at: 'north-west',
    });
  }

  // N: -1, 0
  if (isFieldInBoardBoundries(fields.length, { row: row - 1, column: col })) {
    neighbouringFields.push({
      field: fields[row - 1][col],
      at: 'north',
    });
  } else {
    neighbouringFields.push({
      field: undefined,
      at: 'north',
    });
  }

  // NE: -1, +1
  if (isFieldInBoardBoundries(fields.length, { row: row - 1, column: col + 1 })) {
    neighbouringFields.push({
      field: fields[row - 1][col + 1],
      at: 'north-east',
    });
  } else {
    neighbouringFields.push({
      field: undefined,
      at: 'north-east',
    });
  }

  // W: 0, +1
  if (isFieldInBoardBoundries(fields.length, { row: row, column: col - 1 })) {
    neighbouringFields.push({
      field: fields[row][col - 1],
      at: 'west',
    });
  } else {
    neighbouringFields.push({
      field: undefined,
      at: 'west',
    });
  }

  // E: 0, +1
  if (isFieldInBoardBoundries(fields.length, { row: row, column: col + 1 })) {
    neighbouringFields.push({
      field: fields[row][col + 1],
      at: 'east',
    });
  } else {
    neighbouringFields.push({
      field: undefined,
      at: 'east',
    });
  }

  // SW: +1, -1
  if (isFieldInBoardBoundries(fields.length, { row: row + 1, column: col - 1 })) {
    neighbouringFields.push({
      field: fields[row + 1][col - 1],
      at: 'south-west',
    });
  } else {
    neighbouringFields.push({
      field: undefined,
      at: 'south-west',
    });
  }

  // S: +1, 0
  if (isFieldInBoardBoundries(fields.length, { row: row + 1, column: col })) {
    neighbouringFields.push({
      field: fields[row + 1][col],
      at: 'south',
    });
  } else {
    neighbouringFields.push({
      field: undefined,
      at: 'south',
    });
  }

  // SE: +1, +1
  if (isFieldInBoardBoundries(fields.length, { row: row + 1, column: col + 1 })) {
    neighbouringFields.push({
      field: fields[row + 1][col + 1],
      at: 'south-east',
    });
  } else {
    neighbouringFields.push({
      field: undefined,
      at: 'south-east',
    });
  }

  let units = neighbouringFields.filter((neighbour) => !!neighbour?.field?.occupyingUnit);
  let obsticles = neighbouringFields.filter((neighbour) => !!neighbour?.field?.blocked && !neighbour?.field?.occupyingUnit);

  let accessible = neighbouringFields.filter((n) => n.field !== undefined && n.field.blocked === false);

  let accessibleToMove = accessible.filter((n) => {
    if (n.at === 'north' || n.at === 'south' || n.at === 'west' || n.at === 'east') {
      return n;
    }
  });

  return {
    all: neighbouringFields,
    units,
    obsticles,
    accessibleToMove,
    centerField: fields[row][col],
    accessible,
  };
}
