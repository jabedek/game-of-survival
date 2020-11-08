import { createAction, props } from '@ngrx/store';
import { Unit } from './board.constants';
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
export const setFieldsUnblocked = createAction(
  '[Board] Set All Fields Unblocked'
);

export const setFieldUnblocked = createAction(
  '[Board/Field] Set Field Unblocked',
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

export const setOccupyingUnit = createAction(
  '[Board/Field] Set Field OccupyingUnit',
  props<{ unit: Unit }>()
);

export const setFieldOccupyingUnitNull = createAction(
  '[Board/Field] Set Field OccupyingUnitNull',
  props<{ pos: FieldPos }>()
);
