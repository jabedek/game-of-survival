import { createAction, props } from '@ngrx/store';
import { BoardFields } from '@/src/app/shared/types/board/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { Group } from '@/src/app/shared/types/board/group.types';

// *** Board Fields ***
export const loadBoardFields = createAction('[Board] Load Board Fields', props<{ fields: BoardFields }>());

export const moveUnitFromTo = createAction('[Board] Move Unit', props<{ pos: FieldPos; newPos: FieldPos }>());

export const setField = createAction('[Service] Set/Overwrite Field', props<{ field: Field }>());

export const toggleBuilderMode = createAction('[Board] Toggle Builder Mode');

// *** Units List ***
export const addUnitToList = createAction('[Board/Field] Add Unit to list', props<{ unit: Unit }>());

export const deleteUnitFromList = createAction('[Board/Field] Delete Unit from list', props<{ pos: FieldPos }>());

export const clearUnitsList = createAction('[Board/Field] Clear Units');

// *** Groups List ***
export const addGroupToList = createAction('[Board/Field] Add Broot to List', props<{ group: Group }>());

export const removeGroupFromList = createAction('[Board/Field] Remove Group from List', props<{ id: string }>());

export const clearGroupsList = createAction('[Board/Field] Clear Groups');
