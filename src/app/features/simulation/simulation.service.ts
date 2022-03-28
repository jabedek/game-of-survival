import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { interval, Observable, Subject, Subscription } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { BoardService } from '../../core/modules/board/board.service';
import { GameService } from '../../core/services/game.service';
import { selectBoardSnapshot } from '../../core/state/board/board.selectors';
import { setTurnPhase } from '../../core/state/game/game.actions';
import { selectError, selectTurnIndex, selectTurnPhase } from '../../core/state/game/game.selectors';
import { RootState } from '../../core/state/root-state.types';
import { ValidPotentialGroupSpace } from '../../shared/types/board/board.types';
import { Group } from '../../shared/types/board/group.types';
import { Field } from '../../shared/types/board/field.types';
import { Unit } from '../../shared/types/board/unit.types';
import { TriplexMode } from '../../shared/types/common.types';
import { GameTurnPhase } from '../../shared/types/game.types';
import { scenarioData_A } from './scenarios';
import { TurnSpeedMs } from '../../shared/types/ui.types';
import { selectSimulation } from '../../core/state/ui/ui.selectors';

@Injectable({
  providedIn: 'root',
})
export class SimulationService implements OnDestroy {
  // Process
  running = false;
  paused = false;
  private simulationTurnSub: Subscription | undefined;
  turnCounter = 0;

  // Data
  unitsList: Unit[] = [];
  groupsList: Group[] = [];
  // emptyFields: Field[] = [];
  // validGroupSpaces: ValidPotentialGroupSpace[] = [];
  // subscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();
  private isError$ = this.store.select(selectError).pipe(
    tap((isError) => {
      if (isError) {
        this.stop();
      }
    }),
    takeUntil(this.destroy$)
  );

  boardSnapshot$ = this.store.select(selectBoardSnapshot);
  turnPhase: GameTurnPhase | undefined;

  // Flags
  turnButtonBlocked = false;

  turnSpeed: TurnSpeedMs | undefined;

  turnSpeed$ = this.store.select(selectSimulation).pipe(
    tap((d) => {
      this.turnSpeed = d.turnSpeedMs;
    }),
    takeUntil(this.destroy$)
  );

  constructor(public store: Store<RootState>, private boardService: BoardService, private gameService: GameService) {
    this.turnSpeed$.subscribe();
    this.subscribeAnalytics();
    this.isError$.subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changePause(paused: boolean) {
    if (this.running) {
      this.paused = paused;
    }
  }

  start(): void {
    this.scenarioA();
    this.running = true;

    if (this.simulationTurnSub === undefined) {
      this.simulationTurnSub = interval(this.turnSpeed)
        .pipe(filter(() => this.paused !== true))
        .subscribe(() => {
          if (this.turnPhase === GameTurnPhase.ALL_DONE) {
            // console.log('### in [start] calling [nextTurn] ###');

            this.nextTurn();
            if (this.unitsList.length === 0) {
              this.stop();
            }
          }
        });
    }
  }

  stop(): void {
    if (this.simulationTurnSub) {
      this.simulationTurnSub.unsubscribe();
      this.simulationTurnSub = undefined;
      this.paused = false;
      this.running = false;
    }
  }

  async nextTurn(): Promise<void> {
    // chyab trza zamontownac observable na flage skonczonść tur groupów
    this.store.dispatch(setTurnPhase({ phase: GameTurnPhase.PENDING }));
    if (this.groupsList.length > 0) {
      // this.groupsList.forEach((group) => this.gameService.nextTurnSingle(group));
    }

    this.gameService.computeResults();
  }

  private scenarioA(): void {
    this.boardService.reloadBoard();
    scenarioData_A(this.boardService.boardDimensions).forEach((group) => this.boardService.addGroupOntoBoard(group));
  }

  private subscribeAnalytics(): void {
    this.boardSnapshot$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.unitsList = data.occupied.unitsList;
      this.groupsList = data.occupied.groupsList;
    });

    this.store
      .select(selectTurnPhase)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.turnPhase = data;
        this.turnButtonBlocked = data !== GameTurnPhase.ALL_DONE;
      });

    this.store
      .select(selectTurnIndex)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.turnCounter = data;
      });
  }
}
