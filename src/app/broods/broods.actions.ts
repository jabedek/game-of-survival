import { createAction, props } from '@ngrx/store';
import {
  Brood,
  Field,
  FieldPos,
  Fields,
  Unit,
} from '../shared/types-interfaces';

export const addBrood = createAction(
  '[Board/Field] Add Broot on Root',
  props<{ brood: Brood }>()
);

export const removeBrood = createAction(
  '[Board/Field] Add Broot on Root',
  props<{ id: string }>()
);

export const clearBroods = createAction('[Board/Field] Add Broot on Root');
