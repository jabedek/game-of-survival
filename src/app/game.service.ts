import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BoardService } from './board/board.service';
import {
  AppState,
  Brood,
  Field,
  Fields,
  ParticleUnit,
  TurnUpdate,
  ValidPotentialBroodSpace,
} from './shared/types-interfaces';
import * as CONSTS from './board/board.constants';

import { Observable, of, Subscription } from 'rxjs';
import {
  selectAllUnitsNeighbors,
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
            .select(selectAllUnitsNeighbors, data)
            .subscribe((neighbors) => {
              console.log(neighbors.length);

              let unitsToAdd = [];
              let unitsToDel = [];

              // 2. prepare Update and filter particles based on their neighbors amount

              neighbors.forEach((n, i) => {
                console.log('checking particle on', n.centerPos);
                console.log(n.accessible);

                if (n.particles.length === 3 || n.particles.length === 4) {
                  unitsToDel.push(n.centerPos);
                }

                if (n.particles.length === 1) {
                  const base = CONSTS.BASE_CHANCES_TO_PARTICLE_MULTIPLY;
                  const rnd = +parseFloat(
                    `${Math.random() * CONSTS.RANDOM_ADDITIONAL_LIMIT}`
                  ).toFixed(2);

                  let CHANCE_TO_MULTIPLE = Math.round((base + rnd) * 100);
                  let RESULT = Math.round(Math.random() * 100);
                  console.log(CHANCE_TO_MULTIPLE, RESULT);

                  let willMultiply = !!(RESULT <= CHANCE_TO_MULTIPLE);
                  if (willMultiply) {
                    console.log('WILL MULTIPLY');

                    const field: Field = n.particles[0]?.field as Field;

                    if (field && field.occupyingUnit) {
                      const sourceUnit = {
                        ...field.occupyingUnit,
                      } as ParticleUnit;
                      const id = `${Math.round(Math.random() * 100)}`;
                      const pos = n.accessible[0].field.pos;
                      const unit: ParticleUnit = new ParticleUnit(
                        id,
                        pos,
                        sourceUnit.color,
                        sourceUnit.groupId,
                        null
                      );
                      console.log(
                        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>will multiply onto',
                        unit.pos
                      );
                      unitsToAdd.push(unit);
                    }
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

  update(update: TurnUpdate) {
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
