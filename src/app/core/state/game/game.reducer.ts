import { createReducer, on } from '@ngrx/store';
import * as gameActions from '@/src/app/core/state/game/game.actions';
import { GameTurnPhase } from '@/src/app/shared/types/game.types';
import { GameState } from './game.state';

export const initialFeatureState: GameState = {
  error: false,
  turn: {
    index: 0,
    phase: GameTurnPhase.ALL_DONE,
    update: {
      unitsToAdd: [],
      unitsToDel: [],
    },
  },
};

export const gameReducer = createReducer(
  initialFeatureState,
  on(gameActions.countTurn, (state) => {
    return { ...state, turn: { ...state.turn, index: state.turn.index + 1 } };
  }),

  on(gameActions.resetTurnCounter, (state: GameState) => {
    return { ...state, turn: { ...state.turn, index: 0 } };
  }),

  on(gameActions.setTurnDone, (state: GameState) => {
    return { ...state, turn: { ...state.turn, phase: GameTurnPhase.ALL_DONE } };
  }),

  on(gameActions.setTurnPhase, (state: GameState, { phase }) => {
    return { ...state, turn: { ...state.turn, phase } };
  }),

  on(gameActions.loadChangesAfterTurn, (state: GameState, { update }) => {
    const fallbackUpdate = update || { unitsToAdd: [], unitsToDel: [] };
    return { ...state, turn: { ...state.turn, update: fallbackUpdate } };
  }),

  on(gameActions.setError, (state: GameState, { isError }) => {
    return { ...state, turn: { ...state.turn, error: isError } };
  })
);
