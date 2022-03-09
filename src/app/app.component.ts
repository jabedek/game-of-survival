import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { interval } from 'rxjs';
import { selectBoardSnapshot } from '@/src/app/core/state/board/board.selectors';

import { BoardService } from '@/src/app/core/modules/board/board.service';
import { ValidPotentialBroodSpace } from '@/src/app/shared/types/board/board.types';
import { Field } from '@/src/app/shared/types/board/field.types';

import { setTurnPhase } from '@/src/app/core/state/game/game.actions';
import { selectTurnIndex, selectTurnPhase } from '@/src/app/core/state/game/game.selectors';
import { GameService } from './core/services/game.service';
import { RootState } from '@/src/app/core/state/root-state.types';
import { toggleUIDecorShowing, toggleUIPanelShowing } from '@/src/app/core/state/ui/ui.actions';
import { selectUI } from '@/src/app/core/state/ui/ui.selectors';
import { Unit } from './shared/types/board/unit.types';
import { Brood } from './shared/types/board/brood.types';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  ui$ = this.store.select(selectUI);
  decorShowing = true;
  panelShowing = true;

  // simulationPaused = false;
  // simulationPause$: Subject<boolean> = new Subject();
  // paused(event: any) {
  //   this.simulationPaused = event;

  //   this.simulationPause$.next(this.simulationPaused);
  // }

  turnButtonBlocked = false;

  // boardSnapshot$ = this.store.select(selectBoardSnapshot);

  // unitsList: Unit[] = [];
  // broodsList: Brood[] = [];
  // emptyFields: Field[] = [];
  // validBroodSpaces: ValidPotentialBroodSpace[] = undefined;
  // mockTurnSub: Subscription = undefined;
  subscription: Subscription = new Subscription();
  // turnCounter = 0;

  constructor(public store: Store<RootState>, private game: GameService, public boardService: BoardService) {
    this.subscription.add(
      this.ui$.subscribe((data) => {
        if (data) {
          this.decorShowing = data.decorShowing;
          this.panelShowing = data.panelShowing;
        }
      })
    );

    // this.subscription.add(
    //   this.boardSnapshot$.subscribe((data) => {
    //     this.unitsList = data.occupied.unitsList;
    //     this.broodsList = data.occupied.broodsList;
    //     this.emptyFields = data.available.emptyFields;
    //     this.validBroodSpaces = data.available.validBroodSpaces;
    //   })
    // );

    this.subscription.add(
      this.store.select(selectTurnPhase).subscribe((data) => {
        this.turnButtonBlocked = data === 'all done' ? false : true;
      })
    );

    // this.subscription.add(
    //   this.store.select(selectTurnIndex).subscribe((data) => {

    //     this.turnCounter = data;
    //   })
    // );
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit() {}

  toggleDecor() {
    this.store.dispatch(toggleUIDecorShowing());
  }

  togglePanel() {
    this.store.dispatch(toggleUIPanelShowing());
  }
}
