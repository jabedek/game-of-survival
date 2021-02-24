import { createAction, props } from '@ngrx/store';
import { TurnUpdate } from './types-interfaces';

export const loadChangesAfterTurn = createAction(
  '[Game] Load Changes After Turn',
  props<{ update: TurnUpdate }>()
);

export const countTurn = createAction('[Game] Count up Turn Index');

export const resetTurnCounter = createAction('[Game] Reset Turn Index to 0');

export const setTurnDone = createAction('[Game] Set Turn to Done');

export const setTurnPhase = createAction(
  '[Board] Set Turn Phase',
  props<{ phase: string }>()
);

export const toggleUIPanelShowing = createAction(
  '[App Component] Toggle Panel'
);

export const toggleUIDecorShowing = createAction(
  '[App Component] Toggle Decor'
);
