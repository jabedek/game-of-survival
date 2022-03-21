import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { RootState } from '@/src/app/core/state/root-state.types';
import {
  addGroupToList,
  addUnitToList,
  clearGroupsList,
  clearUnitsList,
  deleteUnitFromList,
  loadBoardFields,
  moveUnitFromTo,
} from '@/src/app/core/state/board/actions/board.actions';
import { addMemberToGroupUnits, removeGroupMember, swapGroupMemberOnPos } from '@/src/app/core/state/board/actions/group.actions';
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
  clearGroupsList() {
    this.store.dispatch(clearGroupsList());
  }

  /**
   * ATOMIC OPERATION
   * Adds existing unit as next member to a group.
   * Doesn't update unit's belonging.
   */

  addMemberToGroupUnits(unit: Unit) {
    this.store.dispatch(addMemberToGroupUnits({ unit }));
  }

  /**
   * ATOMIC OPERATION
   * Removes member from a group.
   * Doesn't update unit's belonging.
   */
  removeGroupMember(pos: FieldPos) {
    this.store.dispatch(removeGroupMember({ pos }));
  }

  /**
   * ATOMIC OPERATION
   * Overwrites group member on member field position.
   * Doesn't update unit's belonging.
   */
  swapGroupMemberOnPos(unit: Unit) {
    this.store.dispatch(swapGroupMemberOnPos({ unit }));
  }

  /**
   * Sets an existing unit's belonging to different group and adds it to the group units.
   */
  setUnitGroupBelonging(unit: Unit, groupId: string) {
    // 1. If unit already had set group, remove it from that group
    this.removeGroupMember(unit.pos);

    // 2. Update unit's internal groupId
    const updatedUnit = { ...unit, groupId };

    // 3. Update group units
    this.swapGroupMemberOnPos(updatedUnit);
  }
}
