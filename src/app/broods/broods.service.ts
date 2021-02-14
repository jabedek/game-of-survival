import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectBroodsOnBoard, selectBroodSpaces } from '.';
import { setFieldParticle } from '../board/board.actions';
import { BoardService } from '../board/board.service';
import {
  AppState,
  Brood,
  BroodSpace,
  BroodSpaceRaport,
  Unit,
} from '../shared/types-interfaces';
import { addBrood } from './broods.actions';

@Injectable({
  providedIn: 'root',
})
export class BroodsService {
  public broods: Brood[] = [];

  // broodsOnBoard$: Observable<Brood[]> = this.store.select(selectBroodsOnBoard);

  broodSpaces$: Observable<BroodSpaceRaport[]> = this.store.select(
    selectBroodSpaces
  );

  getBroodById(id: string) {
    return this.broods.find((brood) => brood.id === id);
  }

  getBroodByIndex(index: number) {
    return this.broods[index];
  }

  getUnit(id: string) {
    return this.broods.forEach((b) => b.units.find((u) => u.id === id));
  }

  getBroodsOnBoard() {
    return this.store.select(selectBroodsOnBoard);
  }

  addNewBroodBSRRoot(id: string, bsr: BroodSpaceRaport) {
    const fallbackId = `${id}s` || `unitons-${this.broods.length}`;
    const fallbackUnits: Unit[] = bsr.space.map((s, index) => {
      return new Unit(`${id}-${index}`, fallbackId, s.pos);
    });

    let brood = new Brood(fallbackId, fallbackUnits);
    // console.log(brood);

    // this.broods.push(brood);

    this.store.dispatch(addBrood({ brood }));

    brood.units.forEach((unit) => {
      this.store.dispatch(setFieldParticle({ unit }));
    });

    // console.log(this.broods);
  }

  getAllBroodSpaces() {
    return this.broodSpaces$;
  }

  constructor(public store: Store<AppState>, public service: BoardService) {}
}
