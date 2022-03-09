import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GameService } from '@/src/app/core/services/game.service';
import { selectBoardFields, selectValidBroodSpaces } from '@/src/app/core/state/board/board.selectors';

import { BoardService } from '@/src/app/core/modules/board/board.service';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { RootState } from '@/src/app/core/state/root-state.types';
import { selectBoardDimensions, selectFieldSizeComputed, selectUI } from '@/src/app/core/state/ui/ui.selectors';
import { setBoardDimensions, setFieldSize, toggleUIPanelShowing } from '@/src/app/core/state/ui/ui.actions';
import { toggleBuilderMode } from '@/src/app/core/state/board/actions/board.actions';
import { ValidPotentialBroodSpace } from '@/src/app/shared/types/board/board.types';
import { BOARD_DIMENSIONS, FIELD_DISPLAY_INFO, DEFAULT_FIELD_SIZE_COMPUTED, FIELD_SIZES } from '@/src/app/shared/constants/board.constants';
import { Option } from '@/src/app/shared/types/common.types';
import { UnitsService } from '../../modules/board/services/units.service';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent implements OnInit, OnDestroy {
  constructor(
    public store: Store<RootState>,
    public boardService: BoardService,
    public gameService: GameService,
    public cdr: ChangeDetectorRef,
    public unitsService: UnitsService
  ) {}

  // Observables
  ui$ = this.store.select(selectUI);
  fields$ = this.store.select(selectBoardFields);
  validBroodSpaces$ = this.store.select(selectValidBroodSpaces);
  validBroodSpaces: ValidPotentialBroodSpace[] = undefined;
  subscription: Subscription = new Subscription();

  // UI related
  selectBoardDimensions$ = this.store.select(selectBoardDimensions);
  boardDimensions = BOARD_DIMENSIONS;
  boardDimensionsChange(event: any) {
    this.store.dispatch(setBoardDimensions({ dimensions: event }));
  }
  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;
  panelShowing = true;
  borderObsticlesUp = false;
  fieldSizeOptions = FIELD_SIZES;

  selectFieldSizeComputed$ = this.store.select(selectFieldSizeComputed);
  fieldSizeComputed = DEFAULT_FIELD_SIZE_COMPUTED;
  fieldSize = this.fieldSizeOptions[1];
  changeFieldSize(event) {
    this.fieldSize = event;
    this.store.dispatch(setFieldSize({ size: event }));
  }

  ngOnInit(): void {
    this.subscription.add(
      this.selectBoardDimensions$.subscribe((d) => {
        this.boardDimensions = d;
        this.reloadBoard();
        this.cdr.detectChanges();
      })
    );

    this.subscription.add(
      this.selectFieldSizeComputed$.subscribe((s) => {
        this.fieldSizeComputed = s;
        this.reloadBoard();

        this.cdr.detectChanges();
      })
    );

    this.subscription.add(
      this.ui$.subscribe((data) => {
        this.panelShowing = data.panelShowing;
      })
    );

    this.subscription.add(
      this.validBroodSpaces$.subscribe((data) => {
        this.validBroodSpaces = data;
      })
    );

    // this.initBoard();
    this.toggleBordersDown();
    this.addNewBroodValidRootRandomly();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  handleClick(type: string) {
    this[type]();
  }

  reloadBoard() {
    this.initBoard();
    this.toggleBordersDown();
  }

  scenario1() {
    this.initBoard();
    this.toggleBordersUp();
    this.addUnitsRandomly(2, 2);
  }

  toggleBorders(): void {
    this.boardService.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = !this.borderObsticlesUp;
  }

  togglePanel() {
    this.store.dispatch(toggleUIPanelShowing());
  }

  private toggleBuilderMode() {
    this.store.dispatch(toggleBuilderMode());
  }

  private addNewBroodValidRootRandomly() {
    if (!!this.validBroodSpaces.length && this.validBroodSpaces.length > 0) {
      let randomValidIndex = getRandom(this.validBroodSpaces.length);

      let rndId = `unitons${getRandom(1000)}`;

      this.boardService.addNewBroodOnContextmenu(rndId, this.validBroodSpaces[randomValidIndex]?.startingPos, 'green');
    }
  }

  private addUnitsRandomly(units: number, obsticles: number) {
    this.boardService.addUnitsRandomly(units, obsticles);
  }

  private initBoard() {
    this.borderObsticlesUp = false;
    this.boardService.reloadBoard();
  }

  private toggleBordersDown() {
    this.borderObsticlesUp = true;
    this.boardService.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = false;
  }

  private toggleBordersUp() {
    this.borderObsticlesUp = false;
    this.boardService.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = true;
  }
}
