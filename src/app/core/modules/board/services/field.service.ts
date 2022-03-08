import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { FieldPos } from '@/src/app/shared/types/field.types';
import { RootState } from '@/src/app/core/state/root-state';
import { BoardModule } from '../board.module';

import { setFieldBox, setFieldEmpty, setFieldObsticle, setFieldParticle } from '@/src/app/core/state/board/actions/field.actions';
import { moveParticleFromTo } from '../../../state/board/actions/board.actions';
import { ParticleUnit } from '@/src/app/shared/types/board.types';

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
  setFieldBox(pos: FieldPos) {
    this.store.dispatch(setFieldBox({ pos }));
  }

  /**
   * ATOMIC OPERATION
   * @param unit
   */
  setFieldParticle(unit: ParticleUnit) {
    this.store.dispatch(setFieldParticle({ unit }));
  }

  /**
   * ATOMIC OPERATION
   * @param pos
   * @param newPos
   */
  moveParticle(pos: FieldPos, newPos: FieldPos) {
    this.store.dispatch(moveParticleFromTo({ pos, newPos }));
  }
}
