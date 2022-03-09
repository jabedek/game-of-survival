import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval, Subject, Subscription } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
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
  // subscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();
  boardSnapshot$ = this.store.select(selectBoardSnapshot);

  // Flags
  turnButtonBlocked = false;

  constructor(public store: Store<RootState>, private boardService: BoardService, private gameService: GameService) {
    this.subscribeAnalytics();
  }

  ngOnDestroy() {
    console.log('DESTROY');

    this.destroy$.next();
    this.destroy$.complete();
  }

  changePause(paused: boolean) {
    this.paused = paused;
  }

  start() {
    this.scenarioA();

    if (this.simulationTurnSub === undefined) {
      this.simulationTurnSub = interval(600)
        .pipe(
          tap(() => {
            console.log('turn');
          }),
          filter(() => this.paused !== true)
        )
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
      this.broodsList.forEach((brood) => this.gameService.nextTurnSingle(brood));
    }

    this.gameService.computeResults();
  }

  private scenarioA() {
    this.boardService.reloadBoard();
    scenarioData_A(this.boardService.boardDimensions).forEach((brood) => this.boardService.addBrood(brood));
  }

  private subscribeAnalytics() {
    this.boardSnapshot$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.unitsList = data.occupied.unitsList;
      this.broodsList = data.occupied.broodsList;
      this.emptyFields = data.available.emptyFields;
      this.validBroodSpaces = data.available.validBroodSpaces;
    });

    this.store
      .select(selectTurnPhase)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.turnButtonBlocked = data === 'all done' ? false : true;
      });

    this.store
      .select(selectTurnIndex)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.turnCounter = data;
      });
  }
}
