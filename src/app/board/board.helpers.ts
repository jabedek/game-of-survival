import {
  BoardDynamicCSS_structurings,
  BroodSpace,
  Field,
  FieldPos,
  Fields,
  NeighborField,
  NeighborsRaport,
} from '../shared/types-interfaces';

export function getBoardSize_CSSpx(
  boardDimensions: number,
  fieldSize: number
): string {
  return `${boardDimensions * fieldSize}px`;
}

export function getFieldSize_CSSpx(fieldSize: number): string {
  return `${fieldSize}px`;
}

export function getPxSizings(boardDimensions: number, fieldSize: number) {
  return {
    boardSize_px: getBoardSize_CSSpx(boardDimensions, fieldSize),
    fieldSize_px: getFieldSize_CSSpx(fieldSize),
  };
}

export function getBoardLayoutStructurings(
  boardDimensions: number,
  fieldSize: number
): BoardDynamicCSS_structurings {
  return {
    display: 'grid',
    'grid-template-columns': `repeat(${boardDimensions}, ${getFieldSize_CSSpx(
      fieldSize
    )})`,
    'grid-template-rows': `repeat(${boardDimensions}, ${getFieldSize_CSSpx(
      fieldSize
    )})`,
    width: ` ${getBoardSize_CSSpx(boardDimensions, fieldSize)}`,
    height: ` ${getBoardSize_CSSpx(boardDimensions, fieldSize)}`,
  };
}

export function checkIfBroodSpaceRoot(
  fields: Fields,
  props: FieldPos
): null | BroodSpace {
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

  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    available0 = null;
  } else {
    available0 = fields[posB][posA].blocked ? null : fields[posB][posA];
  }
  // console.log(available0);

  // 1. north-east
  posB = column + 1;
  posA = row;

  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    available1 = null;
  } else {
    available1 = fields[posB][posA].blocked ? null : fields[posB][posA];
  }

  // 2. south-west
  posB = column;
  posA = row + 1;

  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    available2 = null;
  } else {
    available2 = fields[posB][posA].blocked ? null : fields[posB][posA];
  }

  // 3. south-east
  posB = column + 1;
  posA = row + 1;

  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    available3 = null;
  } else {
    available3 = fields[posB][posA].blocked ? null : fields[posB][posA];
  }

  let bs: BroodSpace = [null, null, null, null];
  bs[0] = available0;
  bs[1] = available1;
  bs[2] = available2;
  bs[3] = available3;

  // = [available0, available1, available2, available3];
  // console.log(bs);

  if (
    available0 !== null &&
    available1 !== null &&
    available2 !== null &&
    available3 !== null
  ) {
    return bs;
  } else return null;
}

export function isInBoundries(boardDimensions: number, pos: FieldPos) {
  if (
    +pos.row >= 0 &&
    +pos.column >= 0 &&
    +pos.row < boardDimensions &&
    +pos.column < boardDimensions
  ) {
    return true;
  } else return false;
}

export function getNeighbors(fields: Fields, props: FieldPos): NeighborsRaport {
  const col: number = +props.column;
  const row: number = +props.row;

  let neighbouringFields: NeighborField[] = [];

  let newFields: Field[] = [];

  // DIR: ROW, COL

  // NW: -1, -1
  if (isInBoundries(fields.length, { row: row - 1, column: col - 1 })) {
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
  if (isInBoundries(fields.length, { row: row - 1, column: col })) {
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
  if (isInBoundries(fields.length, { row: row - 1, column: col + 1 })) {
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
  if (isInBoundries(fields.length, { row: row, column: col - 1 })) {
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
  if (isInBoundries(fields.length, { row: row, column: col + 1 })) {
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
  if (isInBoundries(fields.length, { row: row + 1, column: col - 1 })) {
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
  if (isInBoundries(fields.length, { row: row + 1, column: col })) {
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
  if (isInBoundries(fields.length, { row: row + 1, column: col + 1 })) {
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

  return { all: neighbouringFields, particles, obsticles };
}
