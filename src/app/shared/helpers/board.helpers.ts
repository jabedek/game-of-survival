import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { BOARD_DIMENSIONS } from '@/src/app/shared/constants/board.constants';
import {
  BasicInitialBroodFields,
  BoardFields,
  Brood,
  NeighborField,
  NeighborsRaport,
  ParticleColor,
  ParticleUnit,
} from '../types/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/field.types';

export function getInitialFields(boardDimensions: number): BoardFields {
  let fields: BoardFields = [];

  for (let row = 0; row < boardDimensions; row++) {
    fields[row] = [];
    for (let column = 0; column < boardDimensions; column++) {
      // console.log(row, column);

      const field: Field = {
        pos: { row, column },
        blocked: false,
        mode: 'empty',
        occupyingUnit: null,
        highlightAccessibility: false,
        neighbors: null,
      };

      fields[row][column] = field;
    }
  }

  // console.log(fields);

  return fields;
}

export function getPreparedBroodBase(
  pos: FieldPos,
  id?: string,
  color?: ParticleColor
) {
  const dimensions = BOARD_DIMENSIONS;

  const broodId = id || `reds-${getRandom(1000)}`;
  const broodColor = color || 'red';

  const units = [
    new ParticleUnit(
      `${id}-0`,
      {
        row: pos.row,
        column: pos.column,
      },
      broodColor,
      broodId
    ),
    new ParticleUnit(
      `${id}-1`,
      {
        row: pos.row,
        column: pos.column + 1,
      },
      broodColor,
      broodId
    ),
    new ParticleUnit(
      `${id}-2`,
      {
        row: pos.row + 1,
        column: pos.column,
      },
      broodColor,
      broodId
    ),
    new ParticleUnit(
      `${id}-3`,
      {
        row: pos.row + 1,
        column: pos.column + 1,
      },
      broodColor,
      broodId
    ),
  ];

  const broodUnits = units.filter((u) =>
    isFieldInBoardBoundries(dimensions, u.pos)
  );

  return new Brood(broodId, broodUnits, broodColor);
}

export function isValidBroodRoot(
  fields: BoardFields,
  props: FieldPos
): null | BasicInitialBroodFields {
  const column: number = +props.column;
  const row: number = +props.row;

  let available0: null | Field = null;
  let available1: null | Field = null;
  let available2: null | Field = null;
  let available3: null | Field = null;

  let posA: number;
  let posB: number;

  // 0. root - north-west
  posB = column;
  posA = row;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available0 = null;
  } else {
    available0 = fields[posA][posB].blocked ? null : fields[posA][posB];
  }

  // 1. north-east
  posB = column + 1;
  posA = row;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available1 = null;
  } else {
    available1 = fields[posA][posB].blocked ? null : fields[posA][posB];
  }

  // 2. south-west
  posB = column;
  posA = row + 1;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available2 = null;
  } else {
    available2 = fields[posA][posB].blocked ? null : fields[posA][posB];
  }

  // 3. south-east
  posB = column + 1;
  posA = row + 1;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available3 = null;
  } else {
    available3 = fields[posA][posB].blocked ? null : fields[posA][posB];
  }

  let broodFields: BasicInitialBroodFields = [null, null, null, null];
  broodFields[0] = available0;
  broodFields[1] = available1;
  broodFields[2] = available2;
  broodFields[3] = available3;

  if (
    available0 !== null &&
    available1 !== null &&
    available2 !== null &&
    available3 !== null
  ) {
    return broodFields;
  } else return null;
}

export function isClickInRectBoundries(rect: DOMRect, x: number, y: number) {
  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
  }
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function isFieldInBoardBoundries(
  boardDimensions: number,
  pos: FieldPos
) {
  if (
    +pos.row >= 0 &&
    +pos.column >= 0 &&
    +pos.row < boardDimensions &&
    +pos.column < boardDimensions
  ) {
    return true;
  } else return false;
}

export function getFieldNeighbors(
  fields: BoardFields,
  props: FieldPos
): NeighborsRaport {
  const col: number = +props.column;
  const row: number = +props.row;

  let neighbouringFields: NeighborField[] = [];

  let newFields: Field[] = [];

  // DIR: ROW, COL

  // NW: -1, -1
  if (
    isFieldInBoardBoundries(fields.length, { row: row - 1, column: col - 1 })
  ) {
    neighbouringFields.push({
      field: fields[row - 1][col - 1],
      at: 'north-west',
    });
  } else {
    neighbouringFields.push({
      field: null,
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
      field: null,
      at: 'north',
    });
  }

  // NE: -1, +1
  if (
    isFieldInBoardBoundries(fields.length, { row: row - 1, column: col + 1 })
  ) {
    neighbouringFields.push({
      field: fields[row - 1][col + 1],
      at: 'north-east',
    });
  } else {
    neighbouringFields.push({
      field: null,
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
      field: null,
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
      field: null,
      at: 'east',
    });
  }

  // SW: +1, -1
  if (
    isFieldInBoardBoundries(fields.length, { row: row + 1, column: col - 1 })
  ) {
    neighbouringFields.push({
      field: fields[row + 1][col - 1],
      at: 'south-west',
    });
  } else {
    neighbouringFields.push({
      field: null,
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
      field: null,
      at: 'south',
    });
  }

  // SE: +1, +1
  if (
    isFieldInBoardBoundries(fields.length, { row: row + 1, column: col + 1 })
  ) {
    neighbouringFields.push({
      field: fields[row + 1][col + 1],
      at: 'south-east',
    });
  } else {
    neighbouringFields.push({
      field: null,
      at: 'south-east',
    });
  }

  let particles = neighbouringFields.filter(
    (neighbour) => !!neighbour?.field?.occupyingUnit
  );
  let obsticles = neighbouringFields.filter(
    (neighbour) =>
      !!neighbour?.field?.blocked && !neighbour?.field?.occupyingUnit
  );

  let accessible = neighbouringFields.filter(
    (n) => n.field !== null && n.field.blocked === false
  );

  let accessibleToMove = accessible.filter((n) => {
    if (
      n.at === 'north' ||
      n.at === 'south' ||
      n.at === 'west' ||
      n.at === 'east'
    ) {
      return n;
    }
  });

  return {
    all: neighbouringFields,
    particles,
    obsticles,
    accessibleToMove,
    centerField: fields[row][col],
    accessible,
  };
}
