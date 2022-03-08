import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BoardService } from '../../core/modules/board/board.service';
import { GameService } from '../../core/services/game.service';
import { selectBoardSnapshot } from '../../core/state/board/board.selectors';
import { setTurnPhase } from '../../core/state/game/game.actions';
import { selectTurnIndex, selectTurnPhase } from '../../core/state/game/game.selectors';
import { RootState } from '../../core/state/root-state.types';
import { ValidPotentialBroodSpace } from '../../shared/types/board/board.types';
import { Brood } from '../../shared/types/board/brood.types';
import { Field } from '../../shared/types/board/field.types';
import { Unit } from '../../shared/types/board/unit.types';
import { TriplexMode } from '../../shared/types/common.types';
import { scenarioData_A } from './scenarios';

@Injectable({
  providedIn: 'root',
})
export class SimulationService implements OnDestroy {
  // Process
  private running = false;
  private paused: TriplexMode = 'unknown';
  private simulationTurnSub: Subscription = undefined;
  turnCounter = 0;

  // Data
  unitsList: Unit[] = [];
  broodsList: Brood[] = [];
  emptyFields: Field[] = [];
  validBroodSpaces: ValidPotentialBroodSpace[] = undefined;
  subscription: Subscription = new Subscription();
  boardSnapshot$ = this.store.select(selectBoardSnapshot);

  // Flags
  turnButtonBlocked = false;

  constructor(public store: Store<RootState>, private boardService: BoardService, private gameService: GameService) {
    this.subscribeAnalytics();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  changePause(paused: boolean) {
    this.paused = paused;
  }

  start() {
    this.scenarioA();

    if (this.simulationTurnSub === undefined) {
      this.simulationTurnSub = interval(600)
        .pipe(filter(() => this.paused !== true))
        .subscribe(() => {
          this.nextTurn();
          if (this.unitsList.length === 0) {
            this.stop();
          }
        });
    }
  }

  stop() {
    if (this.simulationTurnSub) {
      this.simulationTurnSub.unsubscribe();
      this.simulationTurnSub = undefined;
    }
  }

  async nextTurn() {
    console.log('nextTurn');

    // chyab trza zamontownac observable na flage skonczonść tur broodów
    this.store.dispatch(setTurnPhase({ phase: 'pending' }));
    if (this.broodsList.length > 0) {
      this.broodsList.forEach((brood) => {
        this.gameService.nextTurnSingle(brood);
      });
      //this.gameService.nextTurn(this.broodsList);
    }

    this.gameService.computeResults();
  }

  private scenarioA() {
    this.boardService.reloadBoard();
    const broods = scenarioData_A();
    broods.forEach((brood) => {
      this.boardService.addBrood(brood);
    });
  }

  private subscribeAnalytics() {
    this.subscription.add(
      this.boardSnapshot$.subscribe((data) => {
        this.unitsList = data.occupied.unitsList;
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
}
