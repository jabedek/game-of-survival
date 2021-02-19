import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { addBrood, clearBroods, setFieldParticle } from './board.actions';
import { BoardService } from './board.service';
import {
  AppState,
  Brood,
  BroodSpace,
  ValidPotentialBroodSpace,
  FieldPos,
  Unit,
  ParticleUnit,
  ParticleColor,
} from '../shared/types-interfaces';
import { selectBroodsOnBoard, selectValidBroodSpaces } from '.';
// import { addBrood } from './broods.actions';

@Injectable({
  providedIn: 'root',
})
export class BroodsService {
  public broodsOnBoard: Brood[] = [];
  constructor(public store: Store<AppState>, public service: BoardService) {
    this.store
      .select(selectBroodsOnBoard)
      .subscribe((data) => (this.broodsOnBoard = data));
  }

  validBroodSpaces$: Observable<ValidPotentialBroodSpace[]> = this.store.select(
    selectValidBroodSpaces
  );

  getBroodById(id: string) {
    return this.broodsOnBoard.find((brood) => brood.id === id);
  }

  getBroodByIndex(index: number) {
    return this.broodsOnBoard[index];
  }

  getUnit(id: string) {
    return this.broodsOnBoard.forEach((b) => b.units.find((u) => u.id === id));
  }

  getBroodsOnBoard$() {
    return this.store.select(selectBroodsOnBoard);
  }

  addNewBroodBSRRoot(
    id: string,
    bsr: ValidPotentialBroodSpace,
    color: ParticleColor
  ) {
    if (bsr) {
      const broodId = `${id || 'fallbiton'}-${this.broodsOnBoard.length || 0}`;
      const fallbackUnits: ParticleUnit[] = bsr.space.map((s, index) => {
        return new ParticleUnit(`${id}-${index}`, s.pos, color, broodId);
      });

      let brood = new Brood(broodId, fallbackUnits, color);

      brood.units.forEach((unit) => {
        this.store.dispatch(setFieldParticle({ unit }));
      });

      this.store.dispatch(addBrood({ brood }));
    }
  }

  addNewBroodOnContextmenu(
    id: string,
    pos: FieldPos,
    color: ParticleColor = 'red'
  ) {
    const broodId = `${id || 'fallbiton'}-${this.broodsOnBoard.length || 0}`;

    const fallbackUnits = [
      new ParticleUnit(
        `${broodId}-0`,
        {
          row: pos.row,
          column: pos.column,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `${broodId}-1`,
        {
          row: pos.row,
          column: pos.column + 1,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `${broodId}-2`,
        {
          row: pos.row + 1,
          column: pos.column,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `${broodId}-3`,
        {
          row: pos.row + 1,
          column: pos.column + 1,
        },
        color,
        broodId
      ),
    ];

    let brood = new Brood(broodId, fallbackUnits, color);

    brood.units.forEach((unit) => {
      this.store.dispatch(setFieldParticle({ unit }));
    });

    this.store.dispatch(addBrood({ brood }));
  }

  getAllValidBroodSpaces$() {
    return this.validBroodSpaces$;
  }

  clearBroods() {
    this.store.dispatch(clearBroods());
  }
}
