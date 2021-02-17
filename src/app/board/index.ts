import { createFeatureSelector, createSelector, props } from '@ngrx/store';
import {
  AppState,
  BoardState,
  BroodSpace,
  ValidPotentialBroodSpace,
  BroodsState,
  Field,
  FieldPos,
  Fields,
  NeighborsRaport,
} from '../shared/types-interfaces';
import { BOARD_DIMENSIONS } from './board.constants';

import * as HELPERS from './board.helpers';

export const selectBoard = (state: AppState) => state.board;
export const selectParticleUnits = (state: AppState) => state.particleUnits;

// export const featureSelector = createFeatureSelector<BoardState>('broods');

// export const featureSelector = createFeatureSelector<BoardState>('board');

export const selectBroodsOnBoard = createSelector(
  selectBoard,
  (state: BoardState) => {
    return state.broodsOnBoard;
  }
);

export const selectParticlesOnBoard = createSelector(
  selectBoard,
  (state: BoardState) => {
    // console.log(state.particlesOnBoard);

    return state.particlesOnBoard;
  }
);
export const selectBroodsRaport = createSelector(
  selectBoard,
  (state: BoardState) => state.raport
);

export const selectBoardFields = createSelector(
  selectBoard,
  (state: BoardState) => state.fields
);

export const selectValidBroodSpaces = createSelector(
  selectBoardFields,
  (fields: Fields) => {
    let bss: BroodSpace[] = [];
    let bssRootPos: FieldPos[] = [];

    let raport: ValidPotentialBroodSpace[] = [];

    [...fields].forEach((fieldsCol) => {
      [...fieldsCol].forEach((field) => {
        const result = HELPERS.checkIfBroodSpaceRoot([...fields], field.pos);
        if (result !== null) {
          bssRootPos.push(field.pos);
          bss.push(result);

          raport.push({ startingPos: field.pos, space: result });
        }
      });
    });

    return raport;
  }
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
    const neighbors: NeighborsRaport = HELPERS.getNeighbors([...fields], props);

    return neighbors;
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
  }
);
