import { Action, createReducer, on } from '@ngrx/store';
import { BoardState, Field, Fields } from '../shared/types-interfaces';

import * as appActions from './board.actions';

export const featureKey = 'board';

export const initialBoardState: BoardState = {
  fields: [],
};

const authReducer = createReducer(
  initialBoardState,
  on(appActions.loadFields, (state, { fields }) => {
    return {
      ...state,
      fields,
    };
  }),

  on(appActions.setFieldParticle, (state, { unit }) => {
    const { pos } = unit;

    const currentField = { ...state.fields[pos.row][pos.column] };
    const newField: Field = {
      ...currentField,
      blocked: true,
      occupyingUnit: unit,
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

  on(appActions.setFieldObsticle, (state, { pos }) => {
    const currentField: Field = { ...state.fields[pos.row][pos.column] };

    // console.log('reducer:', currentField.pos);
    const newField: Field = {
      ...currentField,
      blocked: true,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = { ...newField };
          console.log(field.pos);
        }

        return field;
      })
    );
    console.log(fields[pos.row][pos.column]);

    // console.log(state.fields);

    // console.log(fields);

    return {
      ...state,
      fields,
    };
  }),

  on(appActions.setFieldEmpty, (state, { pos }) => {
    console.log(pos);

    const previousField: Field = { ...state.fields[pos.row][pos.column] };
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
  })
);

export function reducer(state: BoardState | undefined, action: Action) {
  return authReducer(state, action);
}
