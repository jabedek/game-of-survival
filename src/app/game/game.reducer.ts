import { Action, createReducer, on } from '@ngrx/store';

import * as gameActions from './game.actions';
import { GameState } from './types-interfaces';

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

  ui: { decorShowing: true, panelShowing: true },
};

const featureReducer = createReducer(
  initialFeatureState,
  on(gameActions.countTurn, (state) => {
    return {
      ...state,
      turn: { ...state.turn, index: state.turn.index + 1 },
    };
  }),
  on(gameActions.resetTurnCounter, (state) => {
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
  }),
  on(gameActions.toggleUIPanelShowing, (state: GameState) => {
    let ui = { ...state.ui };
    ui.panelShowing = !ui.panelShowing;
    return {
      ...state,
      ui,
    };
  }),
  on(gameActions.toggleUIDecorShowing, (state: GameState) => {
    let ui = { ...state.ui };
    ui.decorShowing = !ui.decorShowing;
    return {
      ...state,
      ui,
    };
  })
);

export function reducer(state: GameState | undefined, action: Action) {
  return featureReducer(state, action);
}
