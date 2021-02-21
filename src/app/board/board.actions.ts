import { createAction, props } from '@ngrx/store';
import {
  Brood,
  Field,
  FieldPos,
  Fields,
  ParticleUnit,
  Unit,
} from '../shared/types-interfaces';

export const toggleUIPanelShowing = createAction('[Board] Toggle Panel');

export const toggleUIDecorShowing = createAction('[Board] Toggle Decor');

export const loadFields = createAction(
  '[Board] Load Fields',
  props<{ fields: Fields }>()
);

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

export const removeBroodMember = createAction(
  '[Board/Field] Remove  Brood member',
  props<{ pos: FieldPos }>()
);
export const addMemberToBroodUnits = createAction(
  '[Board/Field] Add Member To Brood Units',
  props<{ unit: ParticleUnit }>()
);
export const swapBroodMemberOnPos = createAction(
  '[Board/Field] Swap Member onto Position',
  props<{ unit: ParticleUnit }>()
);

export const clearParticles = createAction('[Board/Field] Clear Particles');
export const addParticleToList = createAction(
  '[Board/Field] Add Particle to list',
  props<{ unit: ParticleUnit }>()
);

export const deleteParticleFromList = createAction(
  '[Board/Field] Delete Particle from list',
  props<{ pos: FieldPos }>()
);

export const setParticleBroodBelonging = createAction(
  '[Board/Field] Set Particle Brood belonging ',
  props<{ unit: ParticleUnit }>()
);
export const removeMemberFromBrood = createAction(
  '[Board/Field] Remove Member from Brood',
  props<{ pos: FieldPos }>()
);

export const addBroodToList = createAction(
  '[Board/Field] Add Broot to List',
  props<{ brood: Brood }>()
);

export const removeBroodFromList = createAction(
  '[Board/Field] Remove Brood from List',
  props<{ id: string }>()
);

export const clearBroods = createAction('[Board/Field] Clear Broods');
