import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { BroodsService } from 'src/app/board/broods.service';
import { GameService } from 'src/app/game.service';
import {
  AppState,
  Brood,
  ValidPotentialBroodSpace,
  Field,
  Fields,
  ParticleUnit,
} from 'src/app/shared/types-interfaces';
import {
  selectBoardFields,
  selectValidBroodSpaces,
  selectEmptyFields,
  selectParticlesList,
  selectParticlesAndBroods,
  selectAvailableFieldsAndSpaces,
} from '..';
import { loadFields, removeBroodFromList } from '../board.actions';
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
export class BoardComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  constructor(
    public store: Store<AppState>,
    public boardService: BoardService,
    public broodService: BroodsService,
    public gameService: GameService,
    public cdr: ChangeDetectorRef
  ) {}

  // Observables
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
      this.validBroodSpaces$.subscribe((data) => {
        this.validBroodSpaces = data;
      })
    );

    this.initBoard();
    this.toggleBordersDown();
    this.addNewBroodValidRootRandomly();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy(): void {}

  showPanel() {
    this.panelShowing = !this.panelShowing;

    if (this.panelShowing === false) {
    }
  }

  addNewBroodValidRootRandomly() {
    if (!!this.validBroodSpaces.length && this.validBroodSpaces.length > 0) {
      let randomValidIndex = Math.floor(
        Math.random() * this.validBroodSpaces.length
      );

      let rndId = `uniton-${Math.floor(Math.random() * 1000)}`;
      console.log(rndId);

      this.broodService.addNewBroodOnContextmenu(
        rndId,
        this.validBroodSpaces[randomValidIndex]?.startingPos,
        'green'
      );
    }
  }

  initBoard() {
    this.borderObsticlesUp = false;
    this.store.dispatch(
      loadFields({
        fields: this.boardService.getInitialFields(this.boardDimensions),
      })
    );

    this.boardService.clearParticles();
    this.broodService.clearBroods();
  }

  handleClick(type: string) {
    this[type]();
  }

  reloadBoard() {
    this.initBoard();
    this.toggleBordersDown();
  }

  toggleBordersUp() {
    this.borderObsticlesUp = false;
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
    this.borderObsticlesUp = true;
  }

  toggleBordersDown() {
    this.borderObsticlesUp = true;
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
    this.borderObsticlesUp = false;
  }

  toggleBorders(): void {
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
    this.borderObsticlesUp = !this.borderObsticlesUp;
  }

  // ### Composit actions

  // Reinit board fields, then: add borders (obsticles), then: add 2 particles, then: add 2 more obsticles
  scenario1() {
    this.initBoard();
    this.toggleBordersUp();
    this.addUnits(2, 2);
  }

  addUnits(particles: number, obsticles = 0) {
    this.boardService.addUnitsRandomly(particles, obsticles);
  }
}
