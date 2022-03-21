import { createAction, props } from '@ngrx/store';
import { FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';

// *** Groups ***
export const addMemberToGroupUnits = createAction('[Board/Field] Add Member To Group Units', props<{ unit: Unit }>());

export const swapGroupMemberOnPos = createAction('[Board/Field] Swap Member onto Position', props<{ unit: Unit }>());

export const setUnitGroupBelonging = createAction('[Board/Field] Set Unit Group belonging ', props<{ unit: Unit }>());

export const removeMemberFromGroup = createAction('[Board/Field] Remove Member from Group', props<{ pos: FieldPos }>());

export const removeGroupMember = createAction('[Board/Field] Remove Group member', props<{ pos: FieldPos }>());
