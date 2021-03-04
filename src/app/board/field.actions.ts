import { createAction, props } from '@ngrx/store';
import { ParticleUnit } from './board/board.types';
import { Field, FieldPos } from './board/field.types';

export const setFieldParticle = createAction(
  '[Board/Field] Set Particle on Field ',
  props<{ unit: ParticleUnit }>()
);

export const setFieldObsticle = createAction(
  '[Board/Field] Set Obsticle on Field ',
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
