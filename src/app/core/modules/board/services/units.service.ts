import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { RootState } from '@/src/app/core/state/root-state.types';
import {
  addBroodToList,
  addUnitToList,
  clearBroodsList,
  clearUnitsList,
  deleteUnitFromList,
  loadBoardFields,
  moveUnitFromTo,
} from '@/src/app/core/state/board/actions/board.actions';
import { addMemberToBroodUnits, removeBroodMember, swapBroodMemberOnPos } from '@/src/app/core/state/board/actions/brood.actions';
import { FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';
@Injectable({
  providedIn: 'root',
})
export class UnitsService {
  constructor(public store: Store<RootState>) {}

  /**
   * ATOMIC OPERATION
   * @param action
   * @param unit
   */
  updateUnitsList(action: 'add' | 'del', unit: Partial<Unit>) {
    action === 'add'
      ? this.store.dispatch(addUnitToList({ unit: unit as Unit }))
      : this.store.dispatch(deleteUnitFromList({ pos: (unit as Unit).pos }));
  }

  /**
   * ATOMIC OPERATION
   * Doesnt resolve Fields's relationships with other enitites in board state.
   */
  clearUnitsList() {
    this.store.dispatch(clearUnitsList());
  }

  /**
   * ATOMIC OPERATION
   */
  clearBroodsList() {
    this.store.dispatch(clearBroodsList());
  }

  /**
   * ATOMIC OPERATION
   * Adds existing unit as next member to a brood.
   * Doesn't update unit's belonging.
   */

  addMemberToBroodUnits(unit: Unit) {
    this.store.dispatch(addMemberToBroodUnits({ unit }));
  }

  /**
   * ATOMIC OPERATION
   * Removes member from a brood.
   * Doesn't update unit's belonging.
   */
  removeBroodMember(pos: FieldPos) {
    this.store.dispatch(removeBroodMember({ pos }));
  }

  /**
   * ATOMIC OPERATION
   * Overwrites brood member on member field position.
   * Doesn't update unit's belonging.
   */
  swapBroodMemberOnPos(unit: Unit) {
    this.store.dispatch(swapBroodMemberOnPos({ unit }));
  }

  /**
   * Sets an existing unit's belonging to different brood and adds it to the brood units.
   */
  setUnitBroodBelonging(unit: Unit, broodId: string) {
    // 1. If unit already had set brood, remove it from that brood
    this.removeBroodMember(unit.pos);

    // 2. Update unit's internal broodId
    const updatedUnit = { ...unit, broodId };
    // console.log(updatedUnit);

    // 3. Update brood units
    this.swapBroodMemberOnPos(updatedUnit);
  }
}
