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
    // const fieldDetails = state.fields[props.x][props.y];
    // console.log(props);
    // return fieldDetails;

    const field: Field = { ...fields[props.x][props.x] };
    console.log(field.blocked);

    return field.blocked;
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

    // console.log(fields);

    // const myFields: Fields = [...fields];
    // console.log(myFields);

    // return myFields.map((fieldCol: Field[]) => {
    //   return fieldCol.forEach((field: Field) => {
    //     if (field.blocked === true) {
    //       console.log(field.blocked);
    //       return field;
    //     } else return null;
    //   });
    // });

    // console.log(myFields);
    // return availableFields;
  }
);
