import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { FieldPos } from '@/src/app/shared/types/field.types';
import { RootState } from '@/src/app/core/state/root-state';
import { BoardModule } from '../board.module';

import { setFieldObject, setFieldEmpty, setFieldObsticle, setFieldUnit } from '@/src/app/core/state/board/actions/field.actions';
import { moveUnitFromTo } from '../../../state/board/actions/board.actions';
import { Unit } from '@/src/app/shared/types/board/unit.types';

@Injectable({
  providedIn: 'root',
})
export class FieldService {
  constructor(public store: Store<RootState>) {}

  /**
   * ATOMIC OPERATION
   * Doesnt resolve Fields's relationships with other enitites in board state.
   */
  setFieldEmpty(pos: FieldPos) {
    this.store.dispatch(setFieldEmpty({ pos }));
  }
  /**
   * ATOMIC OPERATION
   * Doesnt resolve Fields's relationships with other enitites in board state.
   */
  setFieldObsticle(pos: FieldPos) {
    this.store.dispatch(setFieldObsticle({ pos }));
  }

  /**
   * ATOMIC OPERATION
   * @param pos
   */
  setFieldObject(pos: FieldPos) {
    this.store.dispatch(setFieldObject({ pos }));
  }

  /**
   * ATOMIC OPERATION
   * @param unit
   */
  setFieldUnit(unit: Unit) {
    this.store.dispatch(setFieldUnit({ unit }));
  }

  /**
   * ATOMIC OPERATION
   * @param pos
   * @param newPos
   */
  moveUnit(pos: FieldPos, newPos: FieldPos) {
    this.store.dispatch(moveUnitFromTo({ pos, newPos }));
  }
}
