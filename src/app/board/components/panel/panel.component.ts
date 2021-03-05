import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game/game.service';
import {
  selectBoardFields,
  selectValidBroodSpaces,
} from '../../store/board.selectors';

import { BoardService } from '../../board.service';
import { getRandom } from 'src/app/shared/helpers';
import { RootState } from 'src/app/root-state';
import { selectUI } from 'src/app/ui/ui.selectors';
import { toggleUIPanelShowing } from 'src/app/ui/ui.actions';
import { toggleBuilderMode } from '../../store/actions/board.actions';
import { ValidPotentialBroodSpace } from '../../types/board.types';
import {
  BOARD_DIMENSIONS,
  FIELD_DISPLAY_INFO,
  FIELD_SIZE,
} from '../../board.constants';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent implements OnInit {
  constructor(
    public store: Store<RootState>,
    public boardService: BoardService,
    public gameService: GameService,
    public cdr: ChangeDetectorRef
  ) {}

  // Observables
  ui$ = this.store.select(selectUI);
  fields$ = this.store.select(selectBoardFields);
  validBroodSpaces$ = this.store.select(selectValidBroodSpaces);
  validBroodSpaces: ValidPotentialBroodSpace[] = null;
  subscription: Subscription = new Subscription();

  // UI related
  boardDimensions = BOARD_DIMENSIONS;
  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;
  fieldSize = FIELD_SIZE;
  panelShowing = true;
  borderObsticlesUp = false;

  ngOnInit(): void {
    // this.fields$.subscribe((data) => console.log(data));

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

    this.initBoard();
    this.toggleBordersDown();
    this.addNewBroodValidRootRandomly();
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
    this.addUnits(2, 2);
  }

  toggleBorders(): void {
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
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

      this.boardService.addNewBroodOnContextmenu(
        rndId,
        this.validBroodSpaces[randomValidIndex]?.startingPos,
        'green'
      );
    }
  }

  private addUnits(particles: number, obsticles = 0) {
    this.boardService.addUnitsRandomly(particles, obsticles);
  }

  private initBoard() {
    this.borderObsticlesUp = false;
    this.boardService.reloadBoard();
  }

  private toggleBordersDown() {
    this.borderObsticlesUp = true;
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
    this.borderObsticlesUp = false;
  }

  private toggleBordersUp() {
    this.borderObsticlesUp = false;
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
    this.borderObsticlesUp = true;
  }
}
