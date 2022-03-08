import { createAction, props } from '@ngrx/store';
import { BoardFields } from '@/src/app/shared/types/board/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { Brood } from '@/src/app/shared/types/board/brood.types';

// *** Board Fields ***
export const loadBoardFields = createAction('[Board] Load Board Fields', props<{ fields: BoardFields }>());

export const moveUnitFromTo = createAction('[Board] Move Unit', props<{ pos: FieldPos; newPos: FieldPos }>());

export const setField = createAction('[Service] Set/Overwrite Field', props<{ field: Field }>());

export const toggleBuilderMode = createAction('[Board] Toggle Builder Mode');

// *** Units List ***
export const addUnitToList = createAction('[Board/Field] Add Unit to list', props<{ unit: Unit }>());

export const deleteUnitFromList = createAction('[Board/Field] Delete Unit from list', props<{ pos: FieldPos }>());

export const clearUnitsList = createAction('[Board/Field] Clear Units');

// *** Broods List ***
export const addBroodToList = createAction('[Board/Field] Add Broot to List', props<{ brood: Brood }>());

export const removeBroodFromList = createAction('[Board/Field] Remove Brood from List', props<{ id: string }>());

export const clearBroodsList = createAction('[Board/Field] Clear Broods');
