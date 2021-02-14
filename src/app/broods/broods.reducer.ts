import { Action, createReducer, on } from '@ngrx/store';
import {
  BoardState,
  Brood,
  BroodsState,
  Field,
  Fields,
} from '../shared/types-interfaces';

import * as appActions from './broods.actions';

export const featureKey = 'broods';

export const initialBroodsState: BroodsState = {
  broodsOnBoard: [],
  raport: null,
};

const authReducer = createReducer(
  initialBroodsState,
  on(appActions.addBrood, (state, { brood }) => {
    let newBroods = [...state.broodsOnBoard];
    console.log(newBroods);

    newBroods.push(brood);

    console.log(newBroods);
    console.log({ ...state, broodsOnBoard: newBroods });

    return {
      ...state,
      broodsOnBoard: newBroods,
    };
  }),
  on(appActions.removeBrood, (state, { id }) => {
    let newBroods = [...state.broodsOnBoard.filter((b) => b.id !== id)];

    return {
      ...state,
      broodsOnBoard: newBroods,
    };
  }),
  on(appActions.clearBroods, (state) => {
    return {
      ...state,
      broodsOnBoard: [],
    };
  })
);

export function reducer(state: BroodsState | undefined, action: Action) {
  return authReducer(state, action);
}
