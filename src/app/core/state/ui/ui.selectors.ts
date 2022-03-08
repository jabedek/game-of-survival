import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from '@/src/app/shared/types/ui.types';
import { RootState } from '@/src/app/core/state/root-state.types';

export const featureKey = 'ui';

export const selectUI = createFeatureSelector<RootState, UIState>(featureKey);

export const selectUIPanelShowing = createSelector(selectUI, (state: UIState) => state.panelShowing);
export const selectUIDecorShowing = createSelector(selectUI, (state: UIState) => state.decorShowing);
