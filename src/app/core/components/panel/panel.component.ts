import {
  AfterContentChecked,
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { GameService } from '@/src/app/core/services/game.service';
import { selectBoardFields, selectBoardSnapshot, selectValidGroupSpaces } from '@/src/app/core/state/board/board.selectors';

import { BoardService } from '@/src/app/core/modules/board/board.service';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { RootState } from '@/src/app/core/state/root-state.types';
import {
  selectBoardDimensions,
  selectFieldSizeComputed,
  selectSimulation,
  selectSimulationTurnSpeed,
  selectUI,
} from '@/src/app/core/state/ui/ui.selectors';
import {
  setBoardDimensions,
  setFieldSize,
  setSimulationTurnSpeed,
  toggleUIDecorShowingAnimated,
  toggleUIDecorShowingFixed,
  toggleUIPanelShowing,
} from '@/src/app/core/state/ui/ui.actions';
import { toggleBuilderMode } from '@/src/app/core/state/board/actions/board.actions';
import { ValidPotentialGroupSpace } from '@/src/app/shared/types/board/board.types';
import {
  FIELD_DISPLAY_INFO,
  DEFAULT_FIELD_SIZE_COMPUTED,
  FIELD_SIZES,
  FieldSize,
  DIMENSIONS_RANGE,
} from '@/src/app/shared/constants/board.constants';
import { Option } from '@/src/app/shared/types/common.types';
import { UnitsService } from '../../modules/board/services/units.service';
import { debounce, map, takeUntil, tap } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { Group } from '@/src/app/shared/types/board/group.types';
import { Field } from '@/src/app/shared/types/board/field.types';
import { selectTurnIndex } from '../../state/game/game.selectors';
import { SimulationComponent } from '@/src/app/features/simulation/simulation.component';
import { SimulationService } from '@/src/app/features/simulation/simulation.service';
import { TurnSpeedMs } from '@/src/app/shared/types/ui.types';
import { SimulationUIState } from '../../state/ui/ui.state';
import { ViewportScroller } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent implements OnInit, OnDestroy, AfterViewChecked {
  TurnSpeedMs = TurnSpeedMs;
  @ViewChildren('details') templates: QueryList<ElementRef<HTMLDetailsElement>> | undefined;
  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;
  panelShowing = true;
  borderObsticlesUp = false;
  fieldSizeOptions = FIELD_SIZES;

  selectFieldSizeComputed$ = this.store.select(selectFieldSizeComputed);
  fieldSizeComputed = DEFAULT_FIELD_SIZE_COMPUTED;

  // Observables
  ui$ = this.store.select(selectUI);
  fields$ = this.store.select(selectBoardFields);
  validGroupSpaces$ = this.store.select(selectValidGroupSpaces);
  validGroupSpaces: ValidPotentialGroupSpace[] = [];

  // UI related
  selectBoardDimensions$ = this.store.select(selectBoardDimensions);
  boardDimensions = 0;
  boardDimensionsRange = DIMENSIONS_RANGE;

  turnSpeed$: Observable<TurnSpeedMs> = this.store.select(selectSimulation).pipe(map((d) => d.turnSpeedMs));

  boardSettingsForm: FormGroup = new FormGroup({
    boardDimensions: new FormControl(this.boardDimensionsRange.default, [
      Validators.min(this.boardDimensionsRange.min),
      Validators.max(this.boardDimensionsRange.max),
    ]),
    fieldSize: new FormControl(this.fieldSizeOptions[1], [
      Validators.min(this.fieldSizeOptions[0]),
      Validators.max(this.fieldSizeOptions[this.fieldSizeOptions.length - 1]),
    ]),
    turnSpeed: new FormControl(TurnSpeedMs.MED, [Validators.min(TurnSpeedMs.SLOW), Validators.max(TurnSpeedMs.FAST)]),
  });

  destroy$: Subject<void> = new Subject();
  destroyForm$: Subject<void> = new Subject();
  boardSnapshot$ = this.store.select(selectBoardSnapshot);
  unitsList: Unit[] = [];
  groupsList: Group[] = [];
  emptyFields: Field[] = [];
  turnCounter = 0;
  constructor(
    public store: Store<RootState>,
    public boardService: BoardService,
    public gameService: GameService,
    public cdr: ChangeDetectorRef,
    public unitsService: UnitsService,
    public simulationService: SimulationService
  ) {}

  ngOnInit(): void {
    this.subscribeStore();
    this.subscribeBoardSettingForm();
    this.subscribeBoardSnapshot();

    this.toggleBordersDown();
    this.addNewGroupValidRootRandomly();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    // this.scrollTo('main');
  }

  allDetailsOpen = false;

  checkIfAllDetailsSame() {
    const elements = this.getDetailsElements();
    let allSameWhichValue = elements[0].nativeElement.open;
    const allSame = elements.every((e) => e.nativeElement.open === allSameWhichValue);
    return { whichValue: allSameWhichValue, allSame };
  }

  toggleAllDetails(forced: boolean | undefined) {
    if (this.templates?.toArray()) {
      this.allDetailsOpen = !this.allDetailsOpen;
      if (forced !== undefined) {
        this.allDetailsOpen = forced;
      }

      this.getDetailsElements().forEach((e) => (e.nativeElement.open = this.allDetailsOpen));
    }
  }

  getDetailsElements() {
    return this.templates?.toArray() as ElementRef<HTMLDetailsElement>[];
  }

  scrollTo(whereTo: string, eventTarget?: HTMLElement) {
    const isClosed = !(eventTarget?.parentElement as HTMLDetailsElement)?.open;

    if (isClosed) {
      setTimeout(() => {
        document?.getElementById(whereTo)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }, 1);
    }
  }

  subscribeBoardSnapshot(): void {
    this.boardSnapshot$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.unitsList = data.occupied.unitsList;
      this.groupsList = data.occupied.groupsList;
      this.emptyFields = data.available.emptyFields;
      this.validGroupSpaces = data.available.validGroupSpaces;
    });
  }

  subscribeBoardSettingForm(): void {
    this.boardSettingsForm
      .get('boardDimensions')
      ?.valueChanges.pipe(
        debounce(() => timer(300)),
        takeUntil(this.destroyForm$)
      )
      .subscribe((dimensions) => {
        this.store.dispatch(setBoardDimensions({ dimensions }));
      });

    this.boardSettingsForm
      .get('fieldSize')
      ?.valueChanges.pipe(
        debounce(() => timer(100)),
        takeUntil(this.destroyForm$)
      )
      .subscribe((size: FieldSize) => {
        this.store.dispatch(setFieldSize({ size }));
      });

    this.boardSettingsForm
      .get('turnSpeed')
      ?.valueChanges.pipe(takeUntil(this.destroyForm$))
      .subscribe((turnSpeedMs: TurnSpeedMs) => {
        this.store.dispatch(setSimulationTurnSpeed({ turnSpeedMs }));
        this.reloadBoard();
        this.cdr.detectChanges();
      });
  }

  subscribeStore(): void {
    this.selectBoardDimensions$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.boardDimensions = d;
      this.reloadBoard();
      this.cdr.detectChanges();
    });

    this.selectFieldSizeComputed$.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      this.fieldSizeComputed = s;

      this.reloadBoard();

      this.cdr.detectChanges();
    });

    this.ui$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.panelShowing = data.panelShowing;
    });

    this.store
      .select(selectTurnIndex)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.turnCounter = data;
      });
  }

  reloadFormSub(): void {
    this.destroyForm$.next();
    this.destroyForm$.complete();

    this.subscribeBoardSettingForm();
    // this.subscribeStore();
  }

  reloadBoard(): void {
    // this.reloadFormSub();

    this.initBoard();
    this.toggleBordersDown();
  }

  scenario1(): void {
    this.initBoard();
    this.toggleBordersUp();
    this.addUnitsRandomly(2, 2);
  }

  toggleBorders(): void {
    this.boardService.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = !this.borderObsticlesUp;
  }

  toggleDecor(which: 'animated' | 'fixed'): void {
    if (which === 'animated') {
      this.store.dispatch(toggleUIDecorShowingAnimated());
    } else {
      this.store.dispatch(toggleUIDecorShowingFixed());
    }
  }

  togglePanel(): void {
    this.store.dispatch(toggleUIPanelShowing());
  }

  // private toggleBuilderMode():void {
  //   this.store.dispatch(toggleBuilderMode());
  // }

  addNewGroupValidRootRandomly(): void {
    if (!!this.validGroupSpaces.length && this.validGroupSpaces.length > 0) {
      let randomValidIndex = getRandom(this.validGroupSpaces.length);

      let rndId = `unitons${getRandom(1000)}`;

      this.boardService.addNewGroupOnContextmenu(rndId, this.validGroupSpaces[randomValidIndex]?.startingPos, 'green');
    }
  }

  private addUnitsRandomly(units: number, obsticles: number): void {
    this.boardService.addUnitsRandomly(units, obsticles);
  }

  private initBoard(): void {
    this.borderObsticlesUp = false;
    this.boardService.reloadBoard();
  }

  private toggleBordersDown(): void {
    this.borderObsticlesUp = true;
    this.boardService.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = false;
  }

  private toggleBordersUp(): void {
    this.borderObsticlesUp = false;
    this.boardService.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = true;
  }
}
