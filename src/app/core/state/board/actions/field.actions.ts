import { createAction, props } from '@ngrx/store';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';

export const setFieldUnit = createAction('[Board/Field] Set Unit on Field ', props<{ unit: Unit }>());

export const setFieldObsticle = createAction('[Board/Field] Set Obsticle on Field ', props<{ pos: FieldPos }>());

export const setFieldObject = createAction('[Board/Field] Set Object on Field ', props<{ pos: FieldPos }>());

export const setFieldEmpty = createAction('[Board/Field] Set Field empty', props<{ pos: FieldPos }>());

export const setFieldsHighlightTrue = createAction("[Board] Set Fields' Highlight True", props<{ fieldsToHighLight: Field[] }>());

export const setAllFieldsHighlightFalse = createAction("[Board] Set All Fields' Highlight False");
