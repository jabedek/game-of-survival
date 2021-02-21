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
  FieldPos,
  Fields,
  ParticleUnit,
  ParticleUnitSimplified,
  Unit,
} from 'src/app/shared/types-interfaces';
import {
  selectBoardFields,
  selectBroodsOnBoard,
  selectValidBroodSpaces,
  selectEmptyFields,
  selectParticlesOnBoard,
  selectParticlesAndBroods,
} from '..';
import { loadFields, removeBrood } from '../board.actions';
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
  ) {
    this.store
      .select(selectParticlesAndBroods)
      .subscribe((data) => console.log());
  }

  boardDimensions = BOARD_DIMENSIONS;

  fieldSize = FIELD_SIZE;

  panelShowing = true;

  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;

  borderObsticlesUp = false;
  validBroodSpaces$: Observable<ValidPotentialBroodSpace[]> = this.store.select(
    selectValidBroodSpaces
  );
  validBroodSpaces: ValidPotentialBroodSpace[] = null;
  broodsOnBoard: Observable<Brood[]> = this.store.select(selectBroodsOnBoard);
  particlesOnBoard$: Observable<ParticleUnit[]> = this.store.select(
    selectParticlesOnBoard
  );
  fields$: Observable<Fields> = this.store.select(selectBoardFields);
  emptyFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  emptyFieldsTotal = 0;

  broodSpacesTotal = 0;
  subscription: Subscription = new Subscription();

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

  showPanel() {
    this.panelShowing = !this.panelShowing;
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
        'purple'
      );
    }
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initBoard() {
    this.borderObsticlesUp = false;
    this.store.dispatch(
      loadFields({
        fields: this.boardService.getInitialFields(this.boardDimensions),
      })
    );

    this.broodService.clearBroods();
  }

  handleClick(type: string) {
    this[type]();
  }

  private checkThenDeleteEmptyBroods(data: Brood[]) {
    data.forEach((brood) => {
      if (!brood.units) {
        this.store.dispatch(removeBrood({ id: brood.id }));
      }
    });
  }

  // getEmptyFields() {

  //   this.boardService
  //     .getEmptyFields$()
  //     .subscribe((data) => {
  //       this.emptyFieldsTotal = data.length;
  //     })
  //     .unsubscribe();
  // }

  // getAllValidBroodSpaces() {
  //   this.broodService
  //     .getAllValidBroodSpaces$()
  //     .subscribe((data) => {
  //       this.broodSpacesTotal = data.length;
  //     })
  //     .unsubscribe();
  // }

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
