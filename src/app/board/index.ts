import { createSelector, props } from '@ngrx/store';
import { AppState, BoardState } from '../shared/AppState';
import { BOARD_DIMENSIONS } from './board.constants';
import { Field, Fields } from './board.models';
import { FieldPos } from './field/field.component';

export const selectBoard = (state: AppState) => state.board;

export const selectBoardFields = createSelector(
  selectBoard,
  (state: BoardState) => state.fields
);

export const selectBoardField = createSelector(
  selectBoard,
  (state: BoardState, props) => {
    const fieldDetails = state.fields[props.x][props.y];
    // console.log(props);
    return fieldDetails;
  }
);

export const selectFieldBlocked = createSelector(
  selectBoardFields,
  (fields: Fields, props: FieldPos) => {
    const field: Field = { ...fields[props.y][props.y] };

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

export const NOselectAvailableFields = createSelector(
  selectBoardFields,
  (fields: Fields) => {
    let newFields: Fields = [];

    for (let x = 0; x < BOARD_DIMENSIONS; x++) {
      newFields[x] = [];

      for (let y = 0; y < BOARD_DIMENSIONS; y++) {
        if (fields[x][y].blocked === false) {
          newFields[x][y] = fields[x][y];
        } else {
          newFields[x][y] = null;
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
function getNeighbors(fields: Fields, props: FieldPos) {
  let neighborFields: Field[] = [];
  let posA: number;
  let posB: number;
  let field: Field;
  let at = '';

  let neighbors: NeighborField[] = [];

  const x: number = +props.x;
  const y: number = +props.y;

  // 0. north west
  posA = x - 1;
  posB = y - 1;

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
  posA = x;
  posB = y - 1;
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
  posA = x + 1;
  posB = y - 1;
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
  posA = x - 1;
  posB = y;
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
  posA = x + 1;
  posB = y;
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
  posA = x - 1;
  posB = y + 1;
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
  posA = x;
  posB = y + 1;
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
  posA = x + 1;
  posB = y + 1;
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
