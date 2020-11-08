import { Action, createReducer, on } from '@ngrx/store';
import { BoardState } from '../shared/AppState';

import * as appActions from './board.actions';
import { Field, Fields } from './board.models';

export interface PatchProperty {
  [key: string]: any;
}
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
  on(appActions.setFieldBlockedBy, (state, { pos, blocker }) => {
    // const currentField = { ...state.fields[pos.x][pos.y] };
    // const newField: Field = {
    //   ...currentField,
    //   blockedBy: blocker,
    // };

    // composeFields(newField, [...state.fields]);

    // const fields: Fields = [...state.fields].map((data: Field[]) =>
    //   data.map((field: Field) => {
    //     if (field.pos.x === pos.x && field.pos.y === pos.y) {
    //       field = { ...newField };
    //     }
    //     return field;
    //   })
    // );

    return {
      ...state,
    };
  }),
  on(appActions.toggleFieldBlockade, (state, { pos }) => {
    console.log('toggleFieldBlockade');

    const currentField = { ...state.fields[pos.x][pos.y] };
    const newField: Field = {
      ...currentField,
      blocked: !currentField.blocked,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.x === pos.x && field.pos.y === pos.y) {
          field = { ...newField };
        }
        return field;
      })
    );
    console.log(pos, newField);

    return {
      ...state,
      fields,
    };
  }),
  on(appActions.setFieldBlockedTrue, (state, { pos }) => {
    console.log('setFieldBlockedTrue');

    const currentField = { ...state.fields[pos.x][pos.y] };
    const newField: Field = {
      ...currentField,
      blocked: true,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.x === pos.x && field.pos.y === pos.y) {
          field = { ...newField };
        }
        return field;
      })
    );
    console.log(pos, newField);
    return {
      ...state,
      fields,
    };
  }),
  on(appActions.setFieldBlockedFalse, (state, { pos }) => {
    console.log('setFieldBlockedFalse');

    const currentField = { ...state.fields[pos.x][pos.y] };
    const newField: Field = {
      ...currentField,
      blocked: false,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.x === pos.x && field.pos.y === pos.y) {
          field = { ...newField };
        }
        return field;
      })
    );
    console.log(pos, newField);
    return {
      ...state,
      fields,
    };
  })
);

export function reducer(state: BoardState | undefined, action: Action) {
  return authReducer(state, action);
}

function composeFields(newField: Field, fields: Field[][]) {
  const newFields: Fields = fields.map((data: Field[]) =>
    data.map((field: Field) => {
      if (field.pos.x === newField.pos.x && field.pos.y === newField.pos.y) {
        field = { ...newField };
      }
      return field;
    })
  );
  console.log(newField);

  return newFields;
}
