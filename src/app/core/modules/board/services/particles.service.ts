import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { ParticleUnit } from '@/src/app/shared/types/board.types';
import { RootState } from '@/src/app/core/state/root-state';
import {
  addBroodToList,
  addParticleToList,
  clearBroodsList,
  clearParticlesList,
  deleteParticleFromList,
  loadBoardFields,
  moveParticleFromTo,
} from '@/src/app/core/state/board/actions/board.actions';
import { addMemberToBroodUnits, removeBroodMember, swapBroodMemberOnPos } from '@/src/app/core/state/board/actions/brood.actions';
import { FieldPos } from '@/src/app/shared/types/field.types';
@Injectable({
  providedIn: 'root',
})
export class ParticlesService {
  constructor(public store: Store<RootState>) {}

  /**
   * ATOMIC OPERATION
   * @param action
   * @param unit
   */
  updateParticlesList(action: 'add' | 'del', unit: ParticleUnit) {
    action === 'add' ? this.store.dispatch(addParticleToList({ unit })) : this.store.dispatch(deleteParticleFromList({ pos: unit.pos }));
  }

  /**
   * ATOMIC OPERATION
   * Doesnt resolve Fields's relationships with other enitites in board state.
   */
  clearParticlesList() {
    this.store.dispatch(clearParticlesList());
  }

  /**
   * ATOMIC OPERATION
   */
  clearBroodsList() {
    this.store.dispatch(clearBroodsList());
  }

  /**
   * ATOMIC OPERATION
   * Adds existing particle as next member to a brood.
   * Doesn't update particle's belonging.
   */

  addMemberToBroodUnits(unit: ParticleUnit) {
    this.store.dispatch(addMemberToBroodUnits({ unit }));
  }

  /**
   * ATOMIC OPERATION
   * Removes member from a brood.
   * Doesn't update particle's belonging.
   */
  removeBroodMember(pos: FieldPos) {
    this.store.dispatch(removeBroodMember({ pos }));
  }

  /**
   * ATOMIC OPERATION
   * Overwrites brood member on member field position.
   * Doesn't update particle's belonging.
   */
  swapBroodMemberOnPos(unit: ParticleUnit) {
    this.store.dispatch(swapBroodMemberOnPos({ unit }));
  }

  /**
   * Sets an existing particle's belonging to different brood and adds it to the brood units.
   */
  setParticleBroodBelonging(unit: ParticleUnit, groupId: string) {
    // 1. If unit already had set brood, remove it from that brood
    this.removeBroodMember(unit.pos);

    // 2. Update particle's internal groupId
    const updatedUnit = { ...unit, groupId };
    // console.log(updatedUnit);

    // 3. Update brood units
    this.swapBroodMemberOnPos(updatedUnit);
  }
}
