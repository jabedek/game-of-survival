import { createAction, props } from '@ngrx/store';
import { Field, FieldPos, Fields, Unit } from '../shared/types-interfaces';

export const loadFields = createAction(
  '[Board] Load Fields',
  props<{ fields: Fields }>()
);

export const setFieldParticle = createAction(
  '[Board/Field] Set Particle on Field ',
  props<{ unit: Unit }>()
);

export const setFieldObsticle = createAction(
  '[Board/Field] Set Obsticle on Field ',
  props<{ pos: FieldPos }>()
);

export const setFieldEmpty = createAction(
  '[Board/Field] Set Field empty',
  props<{ pos: FieldPos }>()
);
