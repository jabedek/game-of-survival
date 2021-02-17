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
      const fallbackId = `nuniton-${this.broodsOnBoard.length}`;
      const fallbackUnits: ParticleUnit[] = bsr.space.map((s, index) => {
        return new ParticleUnit(fallbackId, s.pos, color, `nunitons`);
      });

      let brood = new Brood('nunitons', fallbackUnits, color);
      console.log(brood);

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
    const fallbackId = `${id}s` || `unitons-${this.broodsOnBoard.length}`;

    const fallbackUnits = [
      new ParticleUnit(
        fallbackId,
        {
          row: pos.row,
          column: pos.column,
        },
        color,
        `${id}-${0}`
      ),
      new ParticleUnit(
        fallbackId,
        {
          row: pos.row,
          column: pos.column + 1,
        },
        color,
        `${id}-${1}`
      ),
      new ParticleUnit(
        fallbackId,
        {
          row: pos.row + 1,
          column: pos.column,
        },
        color,
        `${id}-${2}`
      ),
      new ParticleUnit(
        fallbackId,
        {
          row: pos.row + 1,
          column: pos.column + 1,
        },
        color,
        `${id}-${3}`
      ),
    ];

    let brood = new Brood(fallbackId, fallbackUnits, color);
    console.log(brood);

    brood.units.forEach((unit) => {
      this.store.dispatch(setFieldParticle({ unit }));
    });

    this.store.dispatch(addBrood({ brood }));
    // this.c
  }

  getAllValidBroodSpaces$() {
    return this.validBroodSpaces$;
  }

  clearBroods() {
    this.store.dispatch(clearBroods());
  }
}
