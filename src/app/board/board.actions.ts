import { createAction, props } from '@ngrx/store';
import {
  Brood,
  Field,
  FieldPos,
  Fields,
  ParticleUnit,
  Unit,
} from '../shared/types-interfaces';

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
export const addBroodMember = createAction(
  '[Board/Field] Add Brood mmber',
  props<{ unit: ParticleUnit }>()
);
export const setBroodMemberOnPos = createAction(
  '[Board/Field] Set Brood member on position',
  props<{ unit: ParticleUnit }>()
);

export const setParticleBroodBelonging = createAction(
  '[Board/Field] Set Particle Brood belonging ',
  props<{ unit: ParticleUnit }>()
);
export const removeUnitFromBrood = createAction(
  '[Board/Field] Remove Unit from Brood',
  props<{ pos: FieldPos }>()
);

export const addBrood = createAction(
  '[Board/Field] Add Broot on Root',
  props<{ brood: Brood }>()
);

export const removeBrood = createAction(
  '[Board/Field] Remove Brood',
  props<{ id: string }>()
);

export const clearBroods = createAction('[Board/Field] Clear Broods');
