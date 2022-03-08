import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BoardService } from '@/src/app/core/modules/board/board.service';

import * as CONSTS from '@/src/app/shared/constants/board.constants';

import { Observable, of, Subscription } from 'rxjs';
import {
  selectAllUnitsNeighborsAndBroodsList,
  selectAvailableFieldsAndSpaces,
  selectBoard,
  selectBoardFields,
  selectBoardSnapshot,
  selectUnitsAndBroods,
  selectUnitsNeighbors,
} from '@/src/app/core/state/board/board.selectors';
import { countTurn, loadChangesAfterTurn, setTurnPhase } from '@/src/app/core/state/game/game.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';

import { RootState } from '@/src/app/core/state/root-state.types';
import { TurnUpdate } from '@/src/app/shared/types/game.types';
import { Field } from '@/src/app/shared/types/board/field.types';
import { BoardFields, NeighborsRaport, ValidPotentialBroodSpace } from '@/src/app/shared/types/board/board.types';
import { CoreModule } from '../core.module';
import { UnitsService } from '../modules/board/services/units.service';
import { UnitBase } from '../../shared/types/board/unit-base.types';
import { Unit } from '../../shared/types/board/unit.types';
import { Brood } from '../../shared/types/board/brood.types';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  // Observables
  fields$: Observable<BoardFields> = this.store.select(selectBoardFields);
  unitsAndBroods$ = this.store.select(selectUnitsAndBroods);
  availableFieldsAndSpaces$ = this.store.select(selectAvailableFieldsAndSpaces);
  boardSnapshot$ = this.store.select(selectBoardSnapshot);
  boardState$ = this.store.select(selectBoard);
  // Observable data
  // unitsList: Unit[] = [];
  // broodsList: Brood[] = [];
  // emptyFields: Field[] = [];
  // validBroodSpaces: ValidPotentialBroodSpace[] =undefined;

  // Subscriptions
  subscription: Subscription = new Subscription();

  broodId = '';

  constructor(public store: Store<RootState>, public boardService: BoardService) {}

  addNewUnitToBrood = (unit) => {
    this.addNewUnit(unit);
  };

  addNewUnit = (unit) => {};

  nextTurn(broods: Brood[]) {
    broods.forEach((brood) => {
      this.nextTurnSingle(brood);
    });
  }

  nextTurnSingle(brood: Brood) {
    this.store.dispatch(setTurnPhase({ phase: 'pending' }));
    this.store
      .select(selectUnitsNeighbors, brood.units)
      .subscribe((data) => {
        brood.beginTurn({
          neighbors: data,
          cb: this.addNewUnitToBrood,
        });
      })
      .unsubscribe();
  }

  computeResults() {
    // 1. Get all units' neighbors
    let update: TurnUpdate = undefined;
    this.fields$
      .subscribe((data) => {
        if (data) {
          this.store
            .select(selectAllUnitsNeighborsAndBroodsList, data)
            .subscribe((data) => {
              const neighbors = data.fieldsNeighbors;
              let unitsToAdd = [];
              let unitsToDel = [];

              // 2. prepare Update and filter units based on their neighbors amount
              neighbors.forEach((n, i) => {
                const unitType = n.centerField.occupyingUnit?.type;

                if (!unitType || unitType !== 'void') {
                  switch (n.units.length) {
                    // SECTION: REPRO
                    case 0: {
                      let willSpawn = this.willSpawn(data, n, 1, true);
                      if (willSpawn) {
                        unitsToAdd = this.updateUnitsToAdd(n, unitsToAdd);
                      }
                      break;
                    }
                    case 1: {
                      let willSpawn = this.willSpawn(data, n, 10);

                      if (willSpawn) {
                        unitsToAdd = this.updateUnitsToAdd(n, unitsToAdd);
                      }
                      break;
                    }
                    case 2: {
                      let willSpawn = this.willSpawn(data, n, -2);
                      if (willSpawn) {
                        unitsToAdd = this.updateUnitsToAdd(n, unitsToAdd);
                      }
                      break;
                    }
                    // SECTION: DYING
                    case 3:
                    case 4: {
                      unitsToDel.push(n.centerField.pos);
                      break;
                    }
                    default: {
                      unitsToDel.push(n.centerField.pos);
                      break;
                    }
                  }
                }

                let updatedN = { ...n };

                if (updatedN.accessible.length > 0) {
                  updatedN.accessible = updatedN.accessible.filter((f) => {
                    return !unitsToAdd.find((u: UnitBase) => u.pos === f.field.pos);
                  });
                }

                /**
                 * Void units appear randomly and can't multiply or die due to neighbors presence.
                 * In general the more units are on board the more often voids will spawn.
                 */
                const voidSpawn = getRandom(800) === 1;

                if (voidSpawn) {
                  const voidUnit = this.getMultipliedMember(n, undefined, true);
                  unitsToAdd.push(voidUnit);
                }
              });

              update = { unitsToAdd, unitsToDel };

              return;
            })
            .unsubscribe();
        }
      })
      .unsubscribe();

    // 3. update board
    this.updateBoard(update);

    return;
  }

  private updateUnitsToAdd(n, unitsToAdd) {
    let added = false;
    let unit = undefined;

    while (!added) {
      unit = this.getMultipliedMember(n, n.centerField?.occupyingUnit?.broodId);
      if (unit) {
        const posAlreadyTaken: boolean = unitsToAdd.find((u) => u.row === unit.pos.row && u.column === unit.pos.row);

        if (!posAlreadyTaken) {
          unitsToAdd.push(unit);
          added = true;
        }
      }
    }

    return unitsToAdd;
  }

  private getMultipliedMember(n: NeighborsRaport, forcedGroupId?: string, voidUnit?: boolean): Unit {
    const field = n.centerField;
    // console.log('broodId', forcedGroupId);

    let broodId = forcedGroupId || field?.occupyingUnit?.broodId;
    broodId = voidUnit ? undefined : broodId;

    let id = `${broodId}-${getRandom(100)}` || 'randomer';
    id = voidUnit ? 'voider' : id;

    let color = (field?.occupyingUnit as Unit)?.color || 'blue';
    color = voidUnit ? 'black' : color;

    let type: 'void' | 'regular' = voidUnit ? 'void' : 'regular';

    if (n.accessible.length > 0) {
      const pos = n.accessible[getRandom(n.accessible.length - 1)].field.pos;
      // console.log(new Unit(id, pos, color, broodId,undefined));

      return new Unit(id, pos, color, broodId, undefined, type);
    }

    return undefined;
  }

  private willSpawn(data, n, bonus = 0, noNeighbors?: boolean): boolean {
    const brood = data.broodsList.find((b) => b.units.find((u) => u.pos === n.centerPos));

    const broodStrength = brood?.units?.length || 0;
    const rnd = getRandom(CONSTS.RANDOM_ADDITIONAL_LIMIT, true);
    const base = noNeighbors ? 0 : CONSTS.BASE_CHANCES_TO_PARTICLE_MULTIPLY_WITH_NEIGHBORS;
    const probability = Math.round(base + rnd + broodStrength);

    let probArray: boolean[] = Array.from({ length: 100 });
    for (let i = 0; i < probArray.length; i++) {
      probArray[i] = i < probability + bonus ? true : false;
    }
    const randomOutcome = probArray[getRandom(100)];
    // console.log(data, n, bonus, randomOutcome);

    return randomOutcome;
  }

  updateBoard(update: TurnUpdate): void {
    // console.log('update', !!update);

    if (update) {
      update.unitsToDel.forEach((u) => {
        this.boardService.deleteUnit(u);
      });

      update.unitsToAdd.forEach((u) => {
        this.boardService.addNewUnit(u);
      });
    }

    this.store.dispatch(countTurn());
    this.store.dispatch(loadChangesAfterTurn({ update }));
    this.store.dispatch(setTurnPhase({ phase: 'all done' }));
  }
}
