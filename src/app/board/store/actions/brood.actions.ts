import { createAction, props } from '@ngrx/store';
import { ParticleUnit } from './../../types/board.types';
import { FieldPos } from '../../types/field.types';

// *** Broods ***
export const addMemberToBroodUnits = createAction(
  '[Board/Field] Add Member To Brood Units',
  props<{ unit: ParticleUnit }>()
);
export const swapBroodMemberOnPos = createAction(
  '[Board/Field] Swap Member onto Position',
  props<{ unit: ParticleUnit }>()
);

export const setParticleBroodBelonging = createAction(
  '[Board/Field] Set Particle Brood belonging ',
  props<{ unit: ParticleUnit }>()
);

export const removeMemberFromBrood = createAction(
  '[Board/Field] Remove Member from Brood',
  props<{ pos: FieldPos }>()
);

export const removeBroodMember = createAction(
  '[Board/Field] Remove Brood member',
  props<{ pos: FieldPos }>()
);
