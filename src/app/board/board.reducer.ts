import { Action, createReducer, on } from '@ngrx/store';
import { BoardState, Field, Fields } from '../shared/types-interfaces';

import * as appActions from './board.actions';
import { BOARD_DIMENSIONS } from './board.constants';

export const featureKey = 'board';

export const initialBoardState: BoardState = {
  fields: [],
};

const authReducer = createReducer(
  initialBoardState,
  on(appActions.initFields, (state, { fields }) => {
    return {
      ...state,
      fields,
    };
  }),

  on(appActions.setFieldsUnblocked, (state) => {
    const newFields: Fields = [...state.fields].map((fieldsCol) => {
      return fieldsCol.map((field) => ({
        ...field,
        blocked: false,
        occupyingUnit: null,
      }));
    });

    return {
      ...state,
      fields: [...newFields],
    };
  }),
  on(appActions.setOccupyingUnit, (state, { unit }) => {
    // console.log(unit);

    // console.log(appActions.setOccupyingUnit.type);
    const { pos } = unit;

    const currentField = { ...state.fields[pos.column][pos.row] };
    const newField: Field = {
      ...currentField,
      blocked: true,
      occupyingUnit: unit,
    };

    // composeFields(newField, [...state.fields]);

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = { ...newField };
        }
        return field;
      })
    );

    return {
      ...state,
      fields,
    };
  }),
  on(appActions.setFieldOccupyingUnitNull, (state, { pos }) => {
    // console.log(appActions.setFieldOccupyingUnitNull.type);

    const currentField = { ...state.fields[pos.column][pos.row] };
    const newField: Field = {
      ...currentField,
      occupyingUnit: null,
    };

    // composeFields(newField, [...state.fields]);

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = { ...newField };
        }
        return field;
      })
    );

    return {
      ...state,
      fields,
    };
  }),
  on(appActions.toggleFieldBlockade, (state, { pos }) => {
    console.log(appActions.toggleFieldBlockade.type);
    const previousField: Field = { ...state.fields[pos.column][pos.row] };
    let blocked: boolean;
    if (!!previousField?.occupyingUnit?.pos) {
      blocked = previousField.blocked;
    } else {
      blocked = !previousField.blocked;
    }

    const newField: Field = {
      ...previousField,
      blocked,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = { ...newField };
        }
        return field;
      })
    );
    console.log('blocked');

    return {
      ...state,
      fields,
    };
  }),
  on(appActions.setFieldUnblocked, (state, { pos }) => {
    console.log(appActions.setFieldUnblocked.type);
    const previousField: Field = { ...state.fields[pos.column][pos.row] };
    let blocked: boolean;
    if (!!previousField?.occupyingUnit?.pos) {
      blocked = previousField.blocked;
    } else {
      blocked = !previousField.blocked;
    }

    const newField: Field = {
      ...previousField,
      blocked: false,
      occupyingUnit: null,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = { ...newField };
        }
        return field;
      })
    );

    return {
      ...state,
      fields,
    };
  }),
  on(appActions.setFieldBlockedTrue, (state, { pos }) => {
    // console.log(appActions.setFieldBlockedTrue.type);

    const currentField = { ...state.fields[pos.column][pos.row] };
    const newField: Field = {
      ...currentField,
      blocked: true,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = { ...newField };
        }
        return field;
      })
    );
    return {
      ...state,
      fields,
    };
  }),
  on(appActions.setFieldBlockedFalse, (state, { pos }) => {
    console.log(appActions.setFieldBlockedFalse.type);

    const currentField = { ...state.fields[pos.column][pos.row] };
    const newField: Field = {
      ...currentField,
      blocked: false,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = { ...newField };
        }
        return field;
      })
    );
    return {
      ...state,
      fields,
    };
  })
  // on(appActions.getUnitNeighborFieldsData, (state, { pos }) => {
  //   console.log(pos);

  //   const { fields } = state;

  //   const posNum = {
  //     x: +pos.column,
  //     y: +pos.row,
  //   };

  //   let neighborFields: Field[] = [];
  //   console.log(+posNum.x);

  //   if (fields[+posNum.x - 1][+posNum.y - 1]) {
  //     console.log(fields[+posNum.x - 1][+posNum.y - 1]);
  //   }
  //   if (fields) {
  //     neighborFields.push(fields[+posNum.x - 1][+posNum.y - 1] || null);
  //     neighborFields.push(fields[+posNum.x - 1][+posNum.y] || null);
  //     neighborFields.push(fields[+posNum.x - 1][+posNum.y + 1] || null);
  //     neighborFields.push(fields[+posNum.x][+posNum.y - 1] || null);
  //     neighborFields.push(fields[+posNum.x][+posNum.y + 1] || null);
  //     neighborFields.push(fields[+posNum.x + 1][+posNum.y - 1] || null);
  //     neighborFields.push(fields[+posNum.x + 1][+posNum.y] || null);
  //     neighborFields.push(fields[+posNum.x + 1][+posNum.y + 1] || null);
  //   }
  //   console.log(neighborFields);

  //   return {
  //     ...state,
  //   };
  // })
);

export function reducer(state: BoardState | undefined, action: Action) {
  return authReducer(state, action);
}
