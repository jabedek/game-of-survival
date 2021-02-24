import { createAction, props } from '@ngrx/store';
import { Brood, FieldPos, Fields, ParticleUnit } from './types-interfaces';

// *** Fields ***
export const loadBoardFields = createAction(
  '[Board] Load Board Fields',
  props<{ fields: Fields }>()
);

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
