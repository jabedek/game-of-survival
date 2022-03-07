import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { interval } from 'rxjs';
import { selectBoardSnapshot } from '@/src/app/core/state/board/board.selectors';

import { BoardService } from '@/src/app/core/services/board.service';
import {
  Brood,
  ParticleUnit,
  ValidPotentialBroodSpace,
} from '@/src/app/shared/types/board.types';
import { Field } from '@/src/app/shared/types/field.types';

import { setTurnPhase } from '@/src/app/core/state/game/game.actions';
import {
  selectTurnIndex,
  selectTurnPhase,
} from '@/src/app/core/state/game/game.selectors';
import { GameService } from './core/services/game.service';
import { RootState } from '@/src/app/core/state/root-state';
import {
  toggleUIDecorShowing,
  toggleUIPanelShowing,
} from '@/src/app/core/state/ui/ui.actions';
import { selectUI } from '@/src/app/core/state/ui/ui.selectors';

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
    public store: Store<RootState>,
    private game: GameService,
    public boardService: BoardService
  ) {
    this.subscription.add(
      this.ui$.subscribe((data) => {
        if (data) {
          this.decorShowing = data.decorShowing;
          this.panelShowing = data.panelShowing;
        }
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
        // console.log('new turn', data);

        this.turnCounter = data;
      })
    );
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngAfterViewInit() {}

  startAuto() {
    this.boardService.scenario2();
    if (this.mockTurnSub === null) {
      this.mockTurnSub = interval(600).subscribe(() => {
        this.nextTurn();
        if (this.particlesList.length === 0) {
          this.stopAuto();
        }
      });
    }
  }

  stopAuto() {
    if (this.mockTurnSub) {
      this.mockTurnSub.unsubscribe();
      this.mockTurnSub = null;
    }
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
  }

  toggleDecor() {
    this.store.dispatch(toggleUIDecorShowing());
  }

  togglePanel() {
    this.store.dispatch(toggleUIPanelShowing());
  }
}
