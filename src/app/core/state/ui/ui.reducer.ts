import { Action, createReducer, on } from '@ngrx/store';
import { UIState } from '@/src/app/shared/types/ui.types';

import * as uiActions from '@/src/app/core/state/ui/ui.actions';
import { BOARD_DIMENSIONS, DEFAULT_FIELD_SIZE_COMPUTED, PX_MULTIPLIER } from '@/src/app/shared/constants/board.constants';

export const initialUIState = {
  decorShowing: true,
  panelShowing: true,
  boardDimensions: BOARD_DIMENSIONS,
  fieldSizeComputed: DEFAULT_FIELD_SIZE_COMPUTED,
};

export const uiReducer = createReducer(
  initialUIState,
  on(uiActions.toggleUIPanelShowing, (state: UIState) => {
    let panelShowing = state.panelShowing;
    panelShowing = !panelShowing;

    return { ...state, panelShowing };
  }),

  on(uiActions.toggleUIDecorShowing, (state: UIState) => {
    let decorShowing = state.decorShowing;
    decorShowing = !decorShowing;

    return { ...state, decorShowing };
  }),

  on(uiActions.setFieldSize, (state: UIState, { size }) => {
    return { ...state, fieldSizeComputed: PX_MULTIPLIER * size };
  }),

  on(uiActions.setBoardDimensions, (state: UIState, { dimensions }) => {
    return { ...state, boardDimensions: dimensions };
  })
);
