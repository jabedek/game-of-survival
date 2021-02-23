import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BoardService } from './board/board.service';
import {
  AppState,
  Brood,
  Field,
  Fields,
  NeighborsRaport,
  ParticleUnit,
  TurnUpdate,
  Unit,
  ValidPotentialBroodSpace,
} from './shared/types-interfaces';
import * as CONSTS from './board/board.constants';

import { Observable, of, Subscription } from 'rxjs';
import {
  selectAllUnitsNeighbors,
  selectAllUnitsNeighborsAndBroodsList,
  selectAvailableFieldsAndSpaces,
  selectBoard,
  selectBoardFields,
  selectBoardSnapshot,
  selectFieldNeighbors,
  selectParticleField,
  selectParticlesAndBroods,
  selectTurnIndex,
  selectUnitsNeighbors,
} from './board';
import {
  countTurn,
  implementLoadedChanges,
  loadChangesAfterTurn,
  resetTurnCounter,
  setTurnDone,
  setTurnPhase,
} from './board/board.actions';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  // Observables
  fields$: Observable<Fields> = this.store.select(selectBoardFields);
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
    public store: Store<AppState>,
    public boardService: BoardService
  ) {
    this.boardSnapshot$.subscribe((data) => console.log());
    // this.store

    // this.boardState$.subscribe((data) => console.log(data));
  }

  addNewParticleToBrood = (particle) => {
    this.addNewParticle(particle);
  };

  addNewParticle = (particle) => {
    // this.boardService.addNewParticle(particle);
    // console.log(this);
  };

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
        // console.log(data);
      })
      .unsubscribe();
    // this.
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
                switch (n.particles.length) {
                  case 0: {
                    let willMultiply = this.willMultiply(data, n, 1, true);
                    if (willMultiply) {
                      const unit = this.getMultipliedMember(n);
                      if (unit) {
                        console.log(unit);

                        unitsToAdd.push(unit);
                      }
                    }
                    break;
                  }
                  case 1: {
                    let willMultiply = this.willMultiply(data, n);

                    if (willMultiply) {
                      const unit = this.getMultipliedMember(n);
                      if (unit) {
                        unitsToAdd.push(unit);
                      }
                    }
                    break;
                  }
                  case 2: {
                    let willMultiply = this.willMultiply(data, n, -2);
                    if (willMultiply) {
                      const unit = this.getMultipliedMember(n);
                      if (unit) {
                        console.log(unit);

                        unitsToAdd.push(unit);
                      }
                    }
                    break;
                  }
                  case 3:
                  case 4: {
                    unitsToDel.push(n.centerField.pos);
                    break;
                  }
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
    this.update(update);

    return;
  }

  private getMultipliedMember(n: NeighborsRaport): ParticleUnit {
    const field = n.centerField;
    const groupId = field?.occupyingUnit?.groupId || 'randoms';
    const id = `${groupId}-${Math.round(Math.random() * 100)}`;
    const color = (field?.occupyingUnit as ParticleUnit).color || 'blue';
    const pos =
      n.accessible[Math.round(Math.random() * (n.accessible.length - 1))].field
        .pos;

    return new ParticleUnit(id, pos, color, groupId, null);
  }

  private willMultiply(data, n, bonus = 0, noNeighbors?: boolean): boolean {
    const brood = data.broodsList.find((b) =>
      b.units.find((u) => u.pos === n.centerPos)
    );

    const broodStrength = brood?.units?.length || 0;
    const rnd = Math.random() * CONSTS.RANDOM_ADDITIONAL_LIMIT;
    const base = noNeighbors
      ? 0
      : CONSTS.BASE_CHANCES_TO_PARTICLE_MULTIPLY_WITH_NEIGHBORS;

    const probability = Math.round(base + rnd + broodStrength);

    let probArray: boolean[] = Array.from({ length: 100 });
    for (let i = 0; i < probArray.length; i++) {
      probArray[i] = i < probability + bonus ? true : false;
    }

    const randomOutcome = probArray[Math.round(Math.random() * 100)];

    return randomOutcome;
  }

  update(update: TurnUpdate): void {
    console.log(update);

    if (update) {
      update.unitsToDel.forEach((u) => {
        this.boardService.deleteUnit(u);
      });

      update.unitsToAdd.forEach((u) => {
        this.boardService.addNewParticle(u);
      });
      // this.store.dispatch(setTurnDone());
    }
    this.store.dispatch(countTurn());

    this.store.dispatch(loadChangesAfterTurn({ update }));

    this.store.dispatch(setTurnPhase({ phase: 'all done' }));
  }
}
