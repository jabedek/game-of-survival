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
import { interval } from 'rxjs';
import {
  selectBoardSnapshot,
  selectTurnIndex,
  selectTurnPhase,
  selectUI,
} from './board';
import {
  implementLoadedChanges,
  setTurnPhase,
  toggleUIDecorShowing,
  toggleUIPanelShowing,
} from './board/board.actions';
import { BoardService } from './board/board.service';
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
  mockTurnSub: Subscription = null;

  turnCounter = 0;

  constructor(
    public store: Store<AppState>,
    private game: GameService,
    public boardService: BoardService
  ) {
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

    this.subscription.add(
      this.store.select(selectTurnIndex).subscribe((data) => {
        this.turnCounter = data;
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

  startAuto() {
    this.boardService.scenario2();
    if (this.mockTurnSub === null) {
      this.mockTurnSub = interval(1000).subscribe(() => {
        this.nextTurn();
        if (this.particlesList.length === 0) {
          this.stopAuto();
        }
      });
    }
  }

  stopAuto() {
    this.mockTurnSub.unsubscribe();
    this.mockTurnSub = null;
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
