import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  AppState,
  BroodSpace,
  BroodSpaceRaport,
  BroodsState,
  Fields,
} from '../shared/types-interfaces';

import * as HELPERS from '../board/board.helpers';
import { selectBoardFields } from '../board';

export const selectBroods = (state: AppState) => state.broods;

export const featureSelector = createFeatureSelector<BroodsState>('broods');

export const selectBroodsOnBoard = createSelector(
  featureSelector,
  (state: BroodsState) => {
    console.log(state);

    return state.broodsOnBoard;
  }
);
export const selectRaport = createSelector(
  featureSelector,
  (state: BroodsState) => state.raport
);

export const selectBroodSpaces = createSelector(
  selectBoardFields,
  (fields: Fields) => {
    let bss: BroodSpace[] = [];
    let bssRootPos: any[] = [];

    let raport: BroodSpaceRaport[] = [];

    [...fields].forEach((fieldsCol) => {
      [...fieldsCol].forEach((field) => {
        let result = HELPERS.checkIfBroodSpaceRoot([...fields], field.pos);
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
