import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BoardService } from './board/board.service';
import {
  AppState,
  Brood,
  Field,
  Fields,
  ParticleUnit,
  ValidPotentialBroodSpace,
} from './shared/types-interfaces';

import { Observable, of, Subscription } from 'rxjs';
import {
  selectAvailableFieldsAndSpaces,
  selectBoard,
  selectBoardFields,
  selectBoardSnapshot,
  selectFieldNeighbors,
  selectParticleField,
  selectParticlesAndBroods,
  selectUnitsNeighbors,
} from './board';

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

  constructor(
    public store: Store<AppState>,
    public boardService: BoardService
  ) {
    this.boardSnapshot$.subscribe((data) => console.log());
    // this.store

    // this.boardState$.subscribe((data) => console.log(data));
  }

  nextTurn(broods: Brood[]) {
    broods.forEach((b) => {
      this.store.select(selectUnitsNeighbors, b.units).subscribe((data) => {
        const neighbors = data;

        let filtered: any[] = [];

        b.units.forEach((u) => {
          neighbors.forEach((n) => {
            n.particles.forEach((p) => {
              if (p?.field?.pos === u.pos) {
                filtered.push(n);
              }
            });
          });
        });
      });

      b.units;

      b.beginTurn();
    });
  }
}
