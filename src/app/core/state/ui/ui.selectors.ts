import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RootState } from '@/src/app/core/state/root-state.types';
import { SimulationUIState, UIState } from './ui.state';

export const featureKey = 'ui';

export const selectUI = createFeatureSelector<RootState, UIState>(featureKey);

export const selectUIPanelShowing = createSelector(selectUI, (state: UIState) => state.panelShowing);
export const selectUIDecorShowing = createSelector(selectUI, (state: UIState) => state.decorShowing);

export const selectFieldSizeComputed = createSelector(selectUI, (state: UIState) => state.fieldSizeComputed);
export const selectBoardDimensions = createSelector(selectUI, (state: UIState) => state.boardDimensions);

export const selectSimulation = createSelector(selectUI, (state: UIState) => state.simulation);
export const selectSimulationTurnSpeed = createSelector(selectSimulation, (state: SimulationUIState) => state.turnSpeedMs);
