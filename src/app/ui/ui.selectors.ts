import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from './ui.types';
import { RootState } from '../root-state';

export const featureKey = 'ui';

export const selectUI = createFeatureSelector<RootState, UIState>(featureKey);

export const selectUIPanelShowing = createSelector(
  selectUI,
  (state: UIState) => state.panelShowing
);
export const selectUIDecorShowing = createSelector(
  selectUI,
  (state: UIState) => state.decorShowing
);
