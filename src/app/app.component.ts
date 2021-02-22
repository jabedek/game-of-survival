import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { selectBoardSnapshot, selectTurnPhase, selectUI } from './board';
import {
  implementLoadedChanges,
  setTurnPhase,
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
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  ui$ = this.store.select(selectUI);
  decorShowing = true;
  panelShowing = true;

  turnButtonBlocked = false;

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

    this.subscription.add(
      this.store.select(selectTurnPhase).subscribe((data) => {
        this.turnButtonBlocked = data === 'all done' ? false : true;
      })
    );
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit() {
    // console.log('elo');
  }

  async nextTurn() {
    // chyab trza zamontownac observable na flage skonczonść tur broodów
    this.store.dispatch(setTurnPhase({ phase: 'pending' }));
    if (this.broodsList.length > 0) {
      this.broodsList.forEach((brood) => {
        this.game.nextTurnSingle(brood);
      });
      // this.game.nextTurn(this.broodsList);
    }

    this.game.computeResults();
    // this.store
  }

  toggleDecor() {
    this.store.dispatch(toggleUIDecorShowing());
  }

  togglePanel() {
    this.store.dispatch(toggleUIPanelShowing());
  }
}
