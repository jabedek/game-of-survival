import { FieldSize } from '@/src/app/shared/constants/board.constants';
import { TurnSpeedMs } from '@/src/app/shared/types/ui.types';
import { createAction, props } from '@ngrx/store';
import { DecorShowingState } from './ui.state';

export const toggleUIPanelShowing = createAction('[App Component] Toggle Panel');

export const toggleUIDecorShowingAnimated = createAction('[App Component] Toggle Decor Animated');
export const toggleUIDecorShowingFixed = createAction('[App Component] Toggle Decor Fixed');

export const setFieldSize = createAction('[Settings Panel] Set Field Size', props<{ size: FieldSize }>());

export const setBoardDimensions = createAction('[Settings Panel] Set Board Dimensions', props<{ dimensions: number }>());

export const setSimulationTurnSpeed = createAction('[Settings Panel] Set Simulation Turn Speed', props<{ turnSpeedMs: TurnSpeedMs }>());
