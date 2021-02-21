import { createFeatureSelector, createSelector, props } from '@ngrx/store';
import {
  AppState,
  BoardState,
  BasicInitialBroodFields,
  ValidPotentialBroodSpace,
  BroodsState,
  Field,
  FieldPos,
  Fields,
  NeighborsRaport,
  ParticleUnit,
} from '../shared/types-interfaces';
import { BOARD_DIMENSIONS } from './board.constants';

import * as HELPERS from './board.helpers';

export const selectBoard = (state: AppState) => state.board;
export const selectUI = (state: AppState) => state.board.ui;
export const selectParticleUnits = (state: AppState) => state.particleUnits;

// export const featureSelector = createFeatureSelector<BoardState>('broods');

// export const featureSelector = createFeatureSelector<BoardState>('board');

export const selectBroodsList = createSelector(
  selectBoard,
  (state: BoardState) => {
    return state.broodsList;
  }
);

export const selectParticlesList = createSelector(
  selectBoard,
  (state: BoardState) => {
    return state.particlesList;
  }
);

export const selectParticlesAndBroods = createSelector(selectBoard, (state) => {
  return {
    particlesList: state.particlesList,
    broodsList: state.broodsList,
  };
});

export const selectBroodsRaport = createSelector(
  selectBoard,
  (state: BoardState) => state.raport
);

export const selectBoardFields = createSelector(
  selectBoard,
  (state: BoardState) => state.fields
);

export interface TEST {
  settlement: BasicInitialBroodFields;
}
export const selectValidBroodSpaces = createSelector(
  selectBoardFields,
  (fields: Fields) => {
    let settlements: BasicInitialBroodFields[] = [];
    let validBroodRoots: FieldPos[] = [];
    let raport: ValidPotentialBroodSpace[] = [];

    [...fields].forEach((fieldsCol) => {
      [...fieldsCol].forEach((field) => {
        const result = HELPERS.isValidBroodRoot([...fields], field.pos);
        if (result !== null) {
          validBroodRoots.push(field.pos);
          settlements.push(result);
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

export const selectAvailableFieldsAndSpaces = createSelector(
  selectEmptyFields,
  selectValidBroodSpaces,
  (emptyFields: any, validBroodSpaces: any) => {
    return { emptyFields, validBroodSpaces };
  }
);

export const selectBoardSnapshot = createSelector(
  selectAvailableFieldsAndSpaces,
  selectParticlesAndBroods,
  (available, occupied) => {
    return { available, occupied };
  }
);

export const selectBoardField = createSelector(
  selectBoard,
  (state: BoardState, props) => {
    const fieldDetails = state?.fields[props.row][props.column];
    return fieldDetails;
  }
);

export const selectParticleField = createSelector(
  selectBoardFields,
  (fields: Fields, props) => {
    return fields[props.row][props.column];
  }
);

export const selectFieldBlocked = createSelector(
  selectBoardFields,
  (fields: Fields, props: FieldPos) => {
    const field: Field = { ...fields[props.column][props.row] };

    return field.blocked;
  }
);

export const selectUnitsNeighbors = createSelector(
  selectBoardFields,
  (fields: Fields, props: ParticleUnit[]) => {
    const fieldsNeighbors: NeighborsRaport[] = props.map((p) => {
      return HELPERS.getNeighbors([...fields], p.pos);
    });

    return fieldsNeighbors;
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
