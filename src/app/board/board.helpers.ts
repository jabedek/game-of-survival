import {
  BoardDynamicCSS_structurings,
  BasicInitialBroodFields,
  Field,
  FieldPos,
  FieldReference,
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

export function getInitialBoard(boardDimensions: number): FieldReference[][] {
  let board: FieldReference[][] = [];
  for (let x = 0; x < boardDimensions; x++) {
    board[x] = [];
    for (let y = 0; y < boardDimensions; y++) {
      board[x][y] = `${x}:${y}`;
    }
  }

  return board;
}

export function getInitialFields(boardDimensions: number): Fields {
  let fields: Fields = [];

  for (let row = 0; row < boardDimensions; row++) {
    fields[row] = [];
    for (let column = 0; column < boardDimensions; column++) {
      fields[row][column] = new Field({ row, column }, false);
    }
  }

  return fields;
}

export function isValidBroodRoot(
  fields: Fields,
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
  // console.log(available0);

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

  // = [available0, available1, available2, available3];
  // console.log('##', bs);

  if (
    available0 !== null &&
    available1 !== null &&
    available2 !== null &&
    available3 !== null
  ) {
    return broodFields;
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

// export function

// export function getParticleFieldI

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
  let accessible = neighbouringFields.filter(
    (n) => n.field !== null && n.field.blocked === false
  );

  return {
    all: neighbouringFields,
    particles,
    obsticles,
    centerField: fields[row][col],
    accessible,
  };
}
