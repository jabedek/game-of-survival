import { Action, createReducer, on } from '@ngrx/store';
import { UIState } from '@/src/app/shared/types/ui.types';

import * as uiActions from '@/src/app/core/state/ui/ui.actions';

export const featureKey = 'ui';

export const initialUIState = {
  decorShowing: true,
  panelShowing: true,
};

export const uiReducer = createReducer(
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

function reducer(state: UIState | undefined, action: Action) {
  return uiReducer(state, action);
}
