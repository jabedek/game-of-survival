import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { clearBroods } from './board.actions';
import { BoardService } from './board.service';
import {
  AppState,
  Brood,
  ValidPotentialBroodSpace,
  FieldPos,
  ParticleUnit,
  ParticleColor,
} from '../shared/types-interfaces';
import { selectBroodsList, selectValidBroodSpaces } from '.';
import { BOARD_DIMENSIONS } from './board.constants';
import { isInBoundries } from './board.helpers';
// import { addBroodToList } from './broods.actions';

@Injectable({
  providedIn: 'root',
})
export class BroodsService {
  public broodsList: Brood[] = [];
  constructor(public store: Store<AppState>, public service: BoardService) {
    this.store
      .select(selectBroodsList)
      .subscribe((data) => (this.broodsList = data));
  }

  validBroodSpaces$: Observable<ValidPotentialBroodSpace[]> = this.store.select(
    selectValidBroodSpaces
  );

  getBroodById(id: string) {
    return this.broodsList.find((brood) => brood.id === id);
  }

  getBroodByIndex(index: number) {
    return this.broodsList[index];
  }

  getUnit(id: string) {
    return this.broodsList.forEach((b) => b.units.find((u) => u.id === id));
  }

  getBroodsOnBoard$() {
    return this.store.select(selectBroodsList);
  }

  // addNewFieldsOverwrite(unit:ParticleUnit) {
  //   this.store.dispatch(removeUnitFromBrood({pos:unit.pos}))
  //   this.store.dispatch(setFieldParticle({unit}));
  // }

  addNewBroodBSRRoot(
    id: string,
    potentialSpaces: ValidPotentialBroodSpace,
    color: ParticleColor
  ) {
    if (potentialSpaces) {
      const broodId = id;
      const fallbackUnits: ParticleUnit[] = potentialSpaces.space.map(
        (s, index) => {
          return new ParticleUnit(`${index}`, s.pos, color, broodId);
        }
      );

      let brood = new Brood(broodId, fallbackUnits, color);

      this.service.addBroodToList(brood);
    }
  }

  addNewBroodOnContextmenu(
    id: string,
    pos: FieldPos,
    color: ParticleColor = 'red'
  ) {
    const broodId = id;
    const dimensions = BOARD_DIMENSIONS;
    const fallbackUnits = [
      new ParticleUnit(
        `0`,
        {
          row: pos.row,
          column: pos.column,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `1`,
        {
          row: pos.row,
          column: pos.column + 1,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `2`,
        {
          row: pos.row + 1,
          column: pos.column,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `3`,
        {
          row: pos.row + 1,
          column: pos.column + 1,
        },
        color,
        broodId
      ),
    ];

    const units = fallbackUnits.filter((u) => isInBoundries(dimensions, u.pos));
    const brood = new Brood(broodId, units, color);

    this.service.addBroodToList(brood);
  }

  getAllValidBroodSpaces$() {
    return this.validBroodSpaces$;
  }

  clearBroods() {
    this.store.dispatch(clearBroods());
  }
}
