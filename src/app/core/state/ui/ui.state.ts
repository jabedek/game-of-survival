import { TurnSpeedMs } from '@/src/app/shared/types/ui.types';

export interface UIState {
  panelShowing: boolean;
  decorShowing: DecorShowingState;
  boardDimensions: number;
  fieldSizeComputed: number;
  simulation: SimulationUIState;
}

export interface DecorShowingState {
  animated: boolean;
  fixed: boolean;
}

export interface SimulationUIState {
  turnSpeedMs: TurnSpeedMs;
}
