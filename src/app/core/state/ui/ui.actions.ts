import { FieldSize } from '@/src/app/shared/constants/board.constants';
import { createAction, props } from '@ngrx/store';

export const toggleUIPanelShowing = createAction('[App Component] Toggle Panel');

export const toggleUIDecorShowing = createAction('[App Component] Toggle Decor');
export const toggleUIDecorShowingForced = createAction('[App Component] Toggle Decor Forced', props<{ mode: boolean }>());

export const setFieldSize = createAction('[Settings Panel] Set Field Size', props<{ size: FieldSize }>());

export const setBoardDimensions = createAction('[Settings Panel] Set Board Dimensions', props<{ dimensions: number }>());
