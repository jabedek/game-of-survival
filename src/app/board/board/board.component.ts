import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { GameService } from 'src/app/game.service';
import {
  AppState,
  ValidPotentialBroodSpace,
} from 'src/app/shared/types-interfaces';
import { selectBoardFields, selectUI, selectValidBroodSpaces } from '..';
import { loadFields, toggleUIPanelShowing } from '../board.actions';
import {
  BOARD_DIMENSIONS,
  FIELD_SIZE,
  FIELD_DISPLAY_INFO,
} from '../board.constants';

import { BoardService } from '../board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit {
  constructor(
    public store: Store<AppState>,
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

  private addNewBroodValidRootRandomly() {
    if (!!this.validBroodSpaces.length && this.validBroodSpaces.length > 0) {
      let randomValidIndex = Math.floor(
        Math.random() * this.validBroodSpaces.length
      );

      let rndId = `uniton-${Math.floor(Math.random() * 1000)}`;
      console.log(rndId);

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
    this.store.dispatch(
      loadFields({
        fields: this.boardService.getInitialFields(this.boardDimensions),
      })
    );

    this.boardService.clearParticles();
    this.boardService.clearBroods();
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
