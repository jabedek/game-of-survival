import { createSelector, props } from '@ngrx/store';
import {
  AppState,
  BoardState,
  BroodSpace,
  Field,
  FieldPos,
  Fields,
} from '../shared/types-interfaces';
import { BOARD_DIMENSIONS } from './board.constants';

export interface NeighborField {
  at: string;
  field: Field;
}

export interface NeighborsRaport {
  all: NeighborField[];
  particles: NeighborField[];
  obsticles: NeighborField[];
}

export const selectBoard = (state: AppState) => state.board;

export const selectBoardFields = createSelector(
  selectBoard,
  (state: BoardState) => state.fields
);

export const selectEmptyFields = createSelector(
  selectBoardFields,
  (fields: Fields) => {
    let counter0 = 0;
    let availableFields: Field[] = [];

    fields.forEach((fieldCol: Field[]) => {
      return fieldCol.forEach((field) => {
        if (!field.blocked && !field.occupyingUnit) {
          counter0++;

          availableFields.push(field);
        }
      });
    });

    return availableFields;
  }
);

export const selectBoardField = createSelector(
  selectBoard,
  (state: BoardState, props) => {
    const fieldDetails = state.fields[props.row][props.column];
    // console.log(props);
    return fieldDetails;
  }
);

export const selectFieldBlocked = createSelector(
  selectBoardFields,
  (fields: Fields, props: FieldPos) => {
    const field: Field = { ...fields[props.column][props.row] };

    return field.blocked;
  }
);
export const selectFieldNeighbors = createSelector(
  selectBoardFields,
  (fields: Fields, props: FieldPos) => {
    const neighbors: NeighborsRaport = getNeighbors([...fields], props);

    return neighbors;
  }
);

export const selectBroodSpaces = createSelector(
  selectBoardFields,
  (fields: Fields) => {
    // console.log(fields);

    // console.log('selectBroodSpaces');

    let bss: BroodSpace[] = [];

    [...fields].forEach((fieldsCol) => {
      [...fieldsCol].forEach((field) => {
        // if (field.blocked) console.log('blocked field:', field.pos);

        let result = checkIfBroodSpaceRoot([...fields], field.pos);
        if (result !== null) {
          bss.push(result);
        }
      });
    });

    // checkIfBroodSpaceRoot([...fields], props);
    // console.log('selectorneighbors', neighbors);

    // return null;
    return bss;
  }
);

export const NOselectAvailableFields = createSelector(
  selectBoardFields,
  (fields: Fields) => {
    let newFields: Fields = [];

    for (let column = 0; column < BOARD_DIMENSIONS; column++) {
      newFields[column] = [];

      for (let row = 0; row < BOARD_DIMENSIONS; row++) {
        if (fields[column][row].blocked === false) {
          newFields[column][row] = fields[column][row];
        } else {
          newFields[column][row] = null;
        }
      }
    }

    console.log(newFields);
  }
);
export interface NeighborField {
  field: Field;
  at: string;
}

function checkIfBroodSpaceRoot(
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
  let field: Field;
  let at = '';

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

function isInBoundries(boardDimensions: number, pos: FieldPos) {
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
