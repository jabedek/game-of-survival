import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BoardService } from '../board/board.service';

import * as CONSTS from '../board/board.constants';

import { Observable, of, Subscription } from 'rxjs';
import {
  selectAllUnitsNeighborsAndBroodsList,
  selectAvailableFieldsAndSpaces,
  selectBoard,
  selectBoardFields,
  selectBoardSnapshot,
  selectParticlesAndBroods,
  selectUnitsNeighbors,
} from '../board/store/board.selectors';
import { countTurn, loadChangesAfterTurn, setTurnPhase } from './game.actions';
import { getRandom } from '../shared/helpers';

import { RootState } from '../root-state';
import { TurnUpdate } from './game.types';
import { Field } from '../board/types/field.types';
import {
  BoardFields,
  Brood,
  NeighborsRaport,
  ParticleUnit,
  Unit,
  ValidPotentialBroodSpace,
} from '../board/types/board.types';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  // Observables
  fields$: Observable<BoardFields> = this.store.select(selectBoardFields);
  particlesAndBroods$ = this.store.select(selectParticlesAndBroods);
  availableFieldsAndSpaces$ = this.store.select(selectAvailableFieldsAndSpaces);
  boardSnapshot$ = this.store.select(selectBoardSnapshot);
  boardState$ = this.store.select(selectBoard);
  // Observable data
  particlesList: ParticleUnit[] = [];
  broodsList: Brood[] = [];
  emptyFields: Field[] = [];
  validBroodSpaces: ValidPotentialBroodSpace[] = null;

  // Subscriptions
  subscription: Subscription = new Subscription();

  broodId = '';

  constructor(
    public store: Store<RootState>,
    public boardService: BoardService
  ) {}

  addNewParticleToBrood = (particle) => {
    this.addNewParticle(particle);
  };

  addNewParticle = (particle) => {};

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
          cb: this.addNewParticleToBrood,
        });
      })
      .unsubscribe();
  }

  computeResults() {
    // 1. Get all particles' neighbors
    let update: TurnUpdate = null;
    this.fields$
      .subscribe((data) => {
        if (data) {
          this.store
            .select(selectAllUnitsNeighborsAndBroodsList, data)
            .subscribe((data) => {
              const neighbors = data.fieldsNeighbors;
              let unitsToAdd = [];
              let unitsToDel = [];

              // 2. prepare Update and filter particles based on their neighbors amount
              neighbors.forEach((n, i) => {
                const unitType = n.centerField.occupyingUnit?.type;

                if (!unitType || unitType !== 'void') {
                  switch (n.particles.length) {
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
                    return !unitsToAdd.find((u: Unit) => u.pos === f.field.pos);
                  });
                }

                /**
                 * Void particles appear randomly and can't multiply or die due to neighbors presence.
                 * In general the more particles are on board the more often voids will spawn.
                 */
                const voidSpawn = getRandom(800) === 1;

                if (voidSpawn) {
                  const voidParticle = this.getMultipliedMember(n, null, true);
                  unitsToAdd.push(voidParticle);
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
    let unit = null;

    while (!added) {
      unit = this.getMultipliedMember(n, n.centerField?.occupyingUnit?.groupId);
      if (unit) {
        const posAlreadyTaken: boolean = unitsToAdd.find(
          (u) => u.row === unit.pos.row && u.column === unit.pos.row
        );

        if (!posAlreadyTaken) {
          unitsToAdd.push(unit);
          added = true;
        }
      }
    }

    return unitsToAdd;
  }

  private getMultipliedMember(
    n: NeighborsRaport,
    forcedGroupId?: string,
    voidParticle?: boolean
  ): ParticleUnit {
    const field = n.centerField;
    // console.log('groupId', forcedGroupId);

    let groupId = forcedGroupId || field?.occupyingUnit?.groupId;
    groupId = voidParticle ? null : groupId;

    let id = `${groupId}-${getRandom(100)}` || 'randomer';
    id = voidParticle ? 'voider' : id;

    let color = (field?.occupyingUnit as ParticleUnit)?.color || 'blue';
    color = voidParticle ? 'black' : color;

    let type: 'void' | 'regular' = voidParticle ? 'void' : 'regular';

    if (n.accessible.length > 0) {
      const pos = n.accessible[getRandom(n.accessible.length - 1)].field.pos;
      // console.log(new ParticleUnit(id, pos, color, groupId, null));

      return new ParticleUnit(id, pos, color, groupId, null, type);
    }

    return null;
  }

  private willSpawn(data, n, bonus = 0, noNeighbors?: boolean): boolean {
    const brood = data.broodsList.find((b) =>
      b.units.find((u) => u.pos === n.centerPos)
    );

    const broodStrength = brood?.units?.length || 0;
    const rnd = getRandom(CONSTS.RANDOM_ADDITIONAL_LIMIT, true);
    const base = noNeighbors
      ? 0
      : CONSTS.BASE_CHANCES_TO_PARTICLE_MULTIPLY_WITH_NEIGHBORS;
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
    console.log('update', !!update);

    if (update) {
      update.unitsToDel.forEach((u) => {
        this.boardService.deleteUnit(u);
      });

      update.unitsToAdd.forEach((u) => {
        this.boardService.addNewParticle(u);
      });
    }

    this.store.dispatch(countTurn());
    this.store.dispatch(loadChangesAfterTurn({ update }));
    this.store.dispatch(setTurnPhase({ phase: 'all done' }));
  }
}
