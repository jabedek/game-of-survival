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
import { Observable, Subscription } from 'rxjs';
import { selectBroodsOnBoard, selectBroodSpaces } from 'src/app/broods';
import { BroodsService } from 'src/app/broods/broods.service';
import {
  AppState,
  Brood,
  BroodSpaceRaport,
  Field,
  FieldPos,
  Fields,
  ParticleUnit,
  ParticleUnitSimplified,
  Unit,
} from 'src/app/shared/types-interfaces';
import { selectBoardFields, selectEmptyFields } from '..';
import {
  setFieldParticle,
  setFieldObsticle,
  setFieldEmpty,
  loadFields,
} from '../board.actions';
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
    public cdr: ChangeDetectorRef
  ) {}

  boardDimensions = BOARD_DIMENSIONS;

  fieldSize = FIELD_SIZE;

  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;

  borderObsticlesUp = false;
  broodSpaceRaport$: Observable<BroodSpaceRaport[]> = this.store.select(
    selectBroodSpaces
  );
  broodSpaceRaport: BroodSpaceRaport[] = null;
  broodsOnBoard: Observable<Brood[]> = this.store.select(selectBroodsOnBoard);
  fields$: Observable<Fields> = this.store.select(selectBoardFields);
  emptyFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  emptyFieldsTotal = 0;

  broodSpacesTotal = 0;
  subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.initBoard();
    this.getAllBroodSpaces();
    this.broodSpaceRaport$.subscribe((data) => {
      this.broodSpaceRaport = data;
    });

    this.toggleBordersDown();

    this.addNewBroodBSRRootRandomly();

    // NIE USUWAĆ - TESTY
    // function getNeighbors() {
    //   return this.neighborsTotal;
    // }
    // const pos: FieldPos = { row: 1, column: 1 };
    // const unit: ParticleUnitSimplified = {
    //   id: 'uniton-0',
    //   groupId: 'unitons',
    //   pos,
    //   getNeighbors,
    // };
    // this.store.dispatch(setFieldParticle({ unit }));

    // this.addNewBroodBSRRoot()
  }

  addNewBroodBSRRoot() {
    this.broodService.addNewBroodBSRRoot('uniton', this.broodSpaceRaport[0]);
  }

  addNewBroodBSRRootRandomly() {
    let randomBSR = Math.floor(Math.random() * this.broodSpaceRaport.length);
    // this.broodSpaceRaport;
    this.broodService.addNewBroodBSRRoot(
      'uniton',
      this.broodSpaceRaport[randomBSR]
    );
  }

  ngAfterViewInit() {
    // this.cdr.markForCheck();
  }
  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initBoard() {
    this.borderObsticlesUp = false;
    this.boardService.initEmptyFields(this.boardDimensions);
  }

  handleClick(type: string) {
    this[type]();
  }

  getEmptyFields() {
    this.boardService
      .getEmptyFields()
      .subscribe((data) => {
        this.emptyFieldsTotal = data.length;
      })
      .unsubscribe();
  }

  getAllBroodSpaces() {
    this.broodService
      .getAllBroodSpaces()
      .subscribe((data) => {
        this.broodSpacesTotal = data.length;
      })
      .unsubscribe();
    // this.getEmptyFields();
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
    this.boardService.addUnits(particles, obsticles);
  }
}
