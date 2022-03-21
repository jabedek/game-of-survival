import { Action, createReducer, on } from '@ngrx/store';

import * as uiActions from '@/src/app/core/state/ui/ui.actions';
import { DEFAULT_FIELD_SIZE_COMPUTED, DIMENSIONS_RANGE, getFieldSizeComputed } from '@/src/app/shared/constants/board.constants';
import { UIState } from './ui.state';
import { TurnSpeedMs } from '@/src/app/shared/types/ui.types';

export const initialUIState: UIState = {
  decorShowing: {
    animated: true,
    fixed: true,
  },
  simulation: { turnSpeedMs: TurnSpeedMs.MED },
  panelShowing: true,
  boardDimensions: DIMENSIONS_RANGE.default,
  fieldSizeComputed: DEFAULT_FIELD_SIZE_COMPUTED,
};

export const uiReducer = createReducer(
  initialUIState,
  on(uiActions.toggleUIPanelShowing, (state: UIState) => {
    let panelShowing = state.panelShowing;
    panelShowing = !panelShowing;

    return { ...state, panelShowing };
  }),

  on(uiActions.toggleUIDecorShowingAnimated, (state: UIState) => {
    return { ...state, decorShowing: { ...state.decorShowing, animated: !state.decorShowing.animated } };
  }),
  on(uiActions.toggleUIDecorShowingFixed, (state: UIState) => {
    return { ...state, decorShowing: { ...state.decorShowing, fixed: !state.decorShowing.fixed } };
  }),

  on(uiActions.setFieldSize, (state: UIState, { size }) => {
    return { ...state, fieldSizeComputed: getFieldSizeComputed(size) };
  }),

  on(uiActions.setSimulationTurnSpeed, (state: UIState, { turnSpeedMs }) => {
    return { ...state, simulation: { turnSpeedMs } };
  }),

  on(uiActions.setBoardDimensions, (state: UIState, { dimensions }) => {
    if (dimensions >= DIMENSIONS_RANGE.min && dimensions <= DIMENSIONS_RANGE.max) {
      return { ...state, boardDimensions: dimensions };
    } else {
      return state;
    }
  })
);
