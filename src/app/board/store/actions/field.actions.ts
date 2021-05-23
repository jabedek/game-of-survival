import { createAction, props } from '@ngrx/store';
import { ParticleUnit } from '../../types/board.types';
import { Field, FieldPos } from '../../types/field.types';

export const setFieldParticle = createAction(
  '[Board/Field] Set Particle on Field ',
  props<{ unit: ParticleUnit }>()
);

export const setFieldObsticle = createAction(
  '[Board/Field] Set Obsticle on Field ',
  props<{ pos: FieldPos }>()
);

export const setFieldBox = createAction(
  '[Board/Field] Set Box on Field ',
  props<{ pos: FieldPos }>()
);

export const setFieldEmpty = createAction(
  '[Board/Field] Set Field empty',
  props<{ pos: FieldPos }>()
);

export const setFieldsHighlightTrue = createAction(
  "[Board] Set Fields' Highlight True",
  props<{ fieldsToHighLight: Field[] }>()
);
export const setAllFieldsHighlightFalse = createAction(
  "[Board] Set All Fields' Highlight False"
);
