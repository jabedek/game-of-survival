import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { selectBoardSnapshot, selectUI } from './board';
import {
  toggleUIDecorShowing,
  toggleUIPanelShowing,
} from './board/board.actions';
import { GameService } from './game.service';
import {
  AppState,
  Brood,
  Field,
  ParticleUnit,
  ValidPotentialBroodSpace,
} from './shared/types-interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  ui$ = this.store.select(selectUI);
  decorShowing = true;
  panelShowing = true;

  boardSnapshot$ = this.store.select(selectBoardSnapshot);

  particlesList: ParticleUnit[] = [];
  broodsList: Brood[] = [];
  emptyFields: Field[] = [];
  validBroodSpaces: ValidPotentialBroodSpace[] = null;
  subscription: Subscription = new Subscription();

  constructor(public store: Store<AppState>, private game: GameService) {
    this.subscription.add(
      this.ui$.subscribe((data) => {
        this.decorShowing = data.decorShowing;
        this.panelShowing = data.panelShowing;
      })
    );

    this.subscription.add(
      this.boardSnapshot$.subscribe((data) => {
        this.particlesList = data.occupied.particlesList;
        this.broodsList = data.occupied.broodsList;
        this.emptyFields = data.available.emptyFields;
        this.validBroodSpaces = data.available.validBroodSpaces;
      })
    );
  }

  ngOnInit() {
    this.game.launchBroodTurns();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleDecor() {
    this.store.dispatch(toggleUIDecorShowing());
  }

  togglePanel() {
    this.store.dispatch(toggleUIPanelShowing());
  }
}
