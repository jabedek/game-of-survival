import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { BoardService } from '@/src/app/core/modules/board/board.service';

import { selectTurnPhase } from '@/src/app/core/state/game/game.selectors';
import { GameService } from './core/services/game.service';
import { RootState } from '@/src/app/core/state/root-state.types';
import { toggleUIPanelShowing } from '@/src/app/core/state/ui/ui.actions';
import { selectUI } from '@/src/app/core/state/ui/ui.selectors';

import { GameTurnPhase } from './shared/types/game.types';
import { DecorShowingState } from './core/state/ui/ui.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  ui$ = this.store.select(selectUI);
  decorShowing: DecorShowingState | undefined;
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
  // groupsList: Group[] = [];
  // emptyFields: Field[] = [];
  // validGroupSpaces: ValidPotentialGroupSpace[] = undefined;
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
    //     this.groupsList = data.occupied.groupsList;
    //     this.emptyFields = data.available.emptyFields;
    //     this.validGroupSpaces = data.available.validGroupSpaces;
    //   })
    // );

    this.subscription.add(
      this.store.select(selectTurnPhase).subscribe((data) => {
        this.turnButtonBlocked = data === GameTurnPhase.ALL_DONE ? false : true;
      })
    );

    // this.subscription.add(
    //   this.store.select(selectTurnIndex).subscribe((data) => {

    //     this.turnCounter = data;
    //   })
    // );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit(): void {}

  // setDecor(which: 'animated' | 'fixed', toValue: boolean): void {
  //   if (which === 'animated') {
  //     this.store.dispatch(setUIDecorShowingAnimated({ animated: toValue }));
  //   } else {
  //     this.store.dispatch(setUIDecorShowingFixed({ fixed: toValue }));
  //   }
  // }

  togglePanel(): void {
    this.store.dispatch(toggleUIPanelShowing());
  }
}
