import { createAction, props } from '@ngrx/store';
import { Field, Fields } from './board.models';
import { FieldPos, FieldPropertyUpdateDetails } from './field/field.component';

export const initFields = createAction(
  '[Board] Load Fields',
  props<{ fields: Fields }>()
);

export const toggleFieldBlockade = createAction(
  '[Board/Field] Toggle Field Blockade',
  props<{ pos: FieldPos }>()
);

export const setFieldBlockedTrue = createAction(
  '[Board/Field] Toggle Field Blocked True',
  props<{ pos: FieldPos }>()
);
export const setFieldBlockedFalse = createAction(
  '[Board/Field] Toggle Field Blocked False',
  props<{ pos: FieldPos }>()
);

export const setFieldBlockedBy = createAction(
  '[Board/Field] Set Field BlockedBy',
  props<{ pos: FieldPos; blocker: string }>()
);
