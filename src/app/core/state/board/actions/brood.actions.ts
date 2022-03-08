import { createAction, props } from '@ngrx/store';
import { FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';

// *** Broods ***
export const addMemberToBroodUnits = createAction('[Board/Field] Add Member To Brood Units', props<{ unit: Unit }>());

export const swapBroodMemberOnPos = createAction('[Board/Field] Swap Member onto Position', props<{ unit: Unit }>());

export const setUnitBroodBelonging = createAction('[Board/Field] Set Unit Brood belonging ', props<{ unit: Unit }>());

export const removeMemberFromBrood = createAction('[Board/Field] Remove Member from Brood', props<{ pos: FieldPos }>());

export const removeBroodMember = createAction('[Board/Field] Remove Brood member', props<{ pos: FieldPos }>());
