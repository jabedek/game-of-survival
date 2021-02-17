import { Action, createReducer, on } from '@ngrx/store';
import {
  BoardState,
  Brood,
  Field,
  Fields,
  ParticleUnit,
} from '../shared/types-interfaces';

import * as appActions from './board.actions';

export const featureKey = 'board';

export const initialBoardState: BoardState = {
  fields: [],
  broodsOnBoard: [],
  particlesOnBoard: [],
  raport: null,
};

const authReducer = createReducer(
  initialBoardState,
  on(appActions.removeBrood, (state, { id }) => {
    let newBroods = [...state.broodsOnBoard.filter((b) => b.id !== id)];

    return {
      ...state,
      broodsOnBoard: newBroods,
    };
  }),

  on(appActions.addBrood, (state: BoardState, { brood }) => {
    const broodsOnBoard: Brood[] = [
      ...[...state.broodsOnBoard].map((data) => data),
      brood,
    ];

    return {
      ...state,
      broodsOnBoard: [...state.broodsOnBoard, brood],
    };
  }),

  on(appActions.clearBroods, (state) => {
    return {
      ...state,
      broodsOnBoard: [],
    };
  }),

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
      particlesOnBoard: [...state.particlesOnBoard, unit],
      fields,
    };
  }),

  on(appActions.setFieldObsticle, (state, { pos }) => {
    const currentField: Field = { ...state.fields[pos.row][pos.column] };

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

  on(appActions.setFieldEmpty, (state, { pos }) => {
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

    let particlesOnBoard: any[] = [
      ...[...state.particlesOnBoard].map((p) => p),
    ];

    // BROODS
    let broodsOnBoard: Brood[] = [...[...state.broodsOnBoard].map((p) => p)];
    // Check if it was particle and if was in brood then delete it from there

    if (!!previousField.occupyingUnit && previousField.occupyingUnit?.groupId) {
      const { occupyingUnit } = previousField;

      particlesOnBoard = [
        ...state.particlesOnBoard.filter((p) => p.id !== occupyingUnit.id),
      ];

      // brzydki syntax ale ngrx nie przepuści bez skopiowania obiektu / tablicy
      let indexToUpdate = -1;
      let broodToUpdate: Brood = {
        ...[...state.broodsOnBoard].find((br: Brood, index) => {
          indexToUpdate = index;
          return br.id === occupyingUnit.groupId;
        }),
      };

      if (broodToUpdate && broodToUpdate.units) {
        broodToUpdate.units = broodToUpdate.units?.filter(
          (u) => u.pos !== occupyingUnit.pos
        );

        broodsOnBoard[indexToUpdate] = broodToUpdate;
      }
    }

    return {
      ...state,
      particlesOnBoard,
      broodsOnBoard,
      fields,
    };
  })
);

export function reducer(state: BoardState | undefined, action: Action) {
  return authReducer(state, action);
}
