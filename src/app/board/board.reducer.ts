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
  on(appActions.setOccupyingUnit, (state, { unit }) => {
    console.log(unit);

    console.log(appActions.setOccupyingUnit.type);
    const { pos } = unit;

    const currentField = { ...state.fields[pos.x][pos.y] };
    const newField: Field = {
      ...currentField,
      blocked: true,
      occupyingUnit: unit,
    };

    console.log(newField);

    // composeFields(newField, [...state.fields]);

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.x === pos.x && field.pos.y === pos.y) {
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
    console.log(appActions.setFieldOccupyingUnitNull.type);

    const currentField = { ...state.fields[pos.x][pos.y] };
    const newField: Field = {
      ...currentField,
      occupyingUnit: null,
    };

    // composeFields(newField, [...state.fields]);

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.x === pos.x && field.pos.y === pos.y) {
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
    const previousField: Field = { ...state.fields[pos.x][pos.y] };
    let blocked: boolean;
    if (!!previousField?.occupyingUnit?.pos) {
      blocked = previousField.blocked;
    } else blocked = !previousField.blocked;

    const newField: Field = {
      ...previousField,
      blocked: blocked,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.x === pos.x && field.pos.y === pos.y) {
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
  on(appActions.setFieldUnblocked, (state, { pos }) => {
    console.log(appActions.setFieldUnblocked.type);
    const previousField: Field = { ...state.fields[pos.x][pos.y] };
    let blocked: boolean;
    if (!!previousField?.occupyingUnit?.pos) {
      blocked = previousField.blocked;
    } else blocked = !previousField.blocked;

    const newField: Field = {
      ...previousField,
      blocked: false,
      occupyingUnit: null,
    };

    const fields: Fields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.x === pos.x && field.pos.y === pos.y) {
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
    console.log(appActions.setFieldBlockedTrue.type);
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
    // console.log(pos, newField);
    return {
      ...state,
      fields,
    };
  }),
  on(appActions.setFieldBlockedFalse, (state, { pos }) => {
    // console.log('setFieldBlockedFalse');

    console.log(appActions.setFieldBlockedFalse.type);

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