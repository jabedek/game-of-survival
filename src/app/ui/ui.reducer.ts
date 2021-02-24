import { UIState } from '../ui/types-interfaces';
import {
  Action,
  combineReducers,
  createAction,
  createReducer,
  on,
} from '@ngrx/store';

import * as uiActions from './ui.actions';

export const featureKey = 'ui';

export const initialUIState = {
  decorShowing: true,
  panelShowing: true,
};

const uiReducer = createReducer(
  initialUIState,
  on(uiActions.toggleUIPanelShowing, (state: UIState) => {
    let panelShowing = state.panelShowing;
    panelShowing = !panelShowing;

    return {
      ...state,
      panelShowing,
    };
  }),
  on(uiActions.toggleUIDecorShowing, (state: UIState) => {
    let decorShowing = state.decorShowing;
    decorShowing = !decorShowing;

    return {
      ...state,
      decorShowing,
    };
  })
);

export function reducer(state: UIState | undefined, action: Action) {
  return uiReducer(state, action);
}
