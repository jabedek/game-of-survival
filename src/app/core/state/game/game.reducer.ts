import { Action, createReducer, on } from '@ngrx/store';

import * as gameActions from '@/src/app/core/state/game/game.actions';
import { GameState } from '@/src/app/shared/types/game.types';

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

export const gameReducer = createReducer(
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
