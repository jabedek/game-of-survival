import { createAction, props } from '@ngrx/store';
import {
  BoardFields,
  Brood,
  ParticleUnit,
} from '@/src/app/shared/types/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/field.types';

// *** Board Fields ***
export const loadBoardFields = createAction(
  '[Board] Load Board Fields',
  props<{ fields: BoardFields }>()
);

export const moveParticleFromTo = createAction(
  '[Board] Move Particle',
  props<{ pos: FieldPos; newPos: FieldPos }>()
);

export const setField = createAction(
  '[Service] Set/Overwrite Field',
  props<{ field: Field }>()
);

export const toggleBuilderMode = createAction('[Board] Toggle Builder Mode');

// *** Particles List ***
export const addParticleToList = createAction(
  '[Board/Field] Add Particle to list',
  props<{ unit: ParticleUnit }>()
);

export const deleteParticleFromList = createAction(
  '[Board/Field] Delete Particle from list',
  props<{ pos: FieldPos }>()
);

export const clearParticlesList = createAction('[Board/Field] Clear Particles');

// *** Broods List ***
export const addBroodToList = createAction(
  '[Board/Field] Add Broot to List',
  props<{ brood: Brood }>()
);

export const removeBroodFromList = createAction(
  '[Board/Field] Remove Brood from List',
  props<{ id: string }>()
);

export const clearBroodsList = createAction('[Board/Field] Clear Broods');
