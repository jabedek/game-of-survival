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

export const selectBoard = (state: AppState) => state.board;

export const selectBoardFields = createSelector(
  selectBoard,
  (state: BoardState) => state.fields
);

export const selectAvailableFieldsTotal = createSelector(
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
    const fieldDetails = state.fields[props.column][props.row];
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
export const selectUnitNeighborFieldsData = createSelector(
  selectBoardFields,
  (fields: Fields, props: FieldPos) => {
    // console.log(fields);

    // [...fields].forEach((fieldsCol) => {
    //   [...fieldsCol].forEach((field) => {
    //     if (field.blocked) console.log('blocked field:', field.pos);
    //   });
    // });

    const neighbors: NeighborField[] = getNeighbors([...fields], props);
    // console.log('selectorneighbors', neighbors);

    return neighbors;
  }
);

export const selectBroodSpaces = createSelector(
  selectBoardFields,
  (fields: Fields) => {
    // console.log(fields);

    console.log('selectBroodSpaces');

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

function getNeighbors(fields: Fields, props: FieldPos) {
  let neighborFields: Field[] = [];
  let posA: number;
  let posB: number;
  let field: Field;
  let at = '';

  let neighbors: NeighborField[] = [];

  const column: number = +props.column;
  const row: number = +props.row;

  // 0. north west
  posB = column - 1;
  posA = row - 1;

  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    field = null;
  } else {
    field = fields[posB][posA];
  }

  neighborFields[0] = field;
  let neighbor0: NeighborField = { at: 'north west', field };
  neighbors[0] = neighbor0;

  // console.log(posA, posB, field);

  // 1. north
  posB = column;
  posA = row - 1;
  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    field = null;
  } else {
    field = fields[posB][posA];
  }
  // console.log(field.pos);

  neighborFields[1] = field;
  let neighbor1: NeighborField = { at: 'north', field };
  neighbors[1] = neighbor1;
  // console.log(posA, posB, field);

  // 2. north east
  posB = column + 1;
  posA = row - 1;
  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    field = null;
  } else {
    field = fields[posB][posA];
  }
  neighborFields[2] = field;
  let neighbor2: NeighborField = { at: 'north east', field };
  neighbors[2] = neighbor2;
  // console.log(posA, posB, field);

  // 3. west
  posB = column - 1;
  posA = row;
  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    field = null;
  } else {
    field = fields[posB][posA];
  }
  neighborFields[3] = field;
  let neighbor3: NeighborField = { at: 'west', field };
  neighbors[3] = neighbor3;

  // console.log(posA, posB, field);

  // 4. east
  posB = column + 1;
  posA = row;
  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    field = null;
  } else {
    field = fields[posB][posA];
  }
  neighborFields[4] = field;
  let neighbor4: NeighborField = { at: 'east', field };
  neighbors[4] = neighbor4;
  // console.log(posA, posB, field);

  // 5. south west
  posB = column - 1;
  posA = row + 1;
  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    field = null;
  } else {
    field = fields[posB][posA];
  }
  neighborFields[5] = field;
  let neighbor5: NeighborField = { at: 'south west', field };
  neighbors[5] = neighbor5;
  // console.log(posA, posB, field);

  // 6. south
  posB = column;
  posA = row + 1;
  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    field = null;
  } else {
    field = fields[posB][posA];
  }
  neighborFields[6] = field;
  let neighbor6: NeighborField = { at: 'south', field };
  neighbors[6] = neighbor6;
  // console.log(posA, posB, field);

  // 7. south east
  posB = column + 1;
  posA = row + 1;
  if (posA < 0 || posB < 0 || posA == fields.length || posB == fields.length) {
    field = null;
  } else {
    field = fields[posB][posA];
  }
  neighborFields[7] = field;
  let neighbor7: NeighborField = { at: 'south east', field };
  neighbors[7] = neighbor7;
  // console.log(posA, posB, field);
  // console.log(neighbors);

  // console.log(neighborFields);
  // console.log('getNeighbors', neighborFields);

  // return neighborFields;
  return neighbors;
}
