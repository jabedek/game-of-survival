import { Action, createReducer, on } from '@ngrx/store';

import * as gameActions from './game.actions';
import { GameState } from './game.types';

export const featureKey = 'game';

export const initialFeatureState: GameState = {
  turn: {
    index: 0,
    phase: 'all done',
    update: {
      unitsToAdd: [],
      unitsToDel: [],
    },
  },
};

const turnReducer = createReducer(
  initialFeatureState,
  on(gameActions.countTurn, (state) => {
    return {
      ...state,
      turn: { ...state.turn, index: state.turn.index + 1 },
    };
  }),
  on(gameActions.resetTurnCounter, (state: GameState) => {
    return {
      ...state,
      turn: { ...state.turn, index: 0 },
    };
  }),
  on(gameActions.setTurnDone, (state: GameState) => {
    return {
      ...state,
      turn: { ...state.turn, phase: 'all done' },
    };
  }),
  on(gameActions.setTurnPhase, (state: GameState, { phase }) => {
    return {
      ...state,
      turn: { ...state.turn, phase },
    };
  }),
  on(gameActions.loadChangesAfterTurn, (state: GameState, { update }) => {
    const fallbackUpdate = update || { unitsToAdd: [], unitsToDel: [] };

    return {
      ...state,

      turn: { ...state.turn, update: fallbackUpdate },
    };
  })
);

export function reducer(state: GameState | undefined, action: Action) {
  return turnReducer(state, action);
}
