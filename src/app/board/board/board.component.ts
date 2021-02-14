import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import {
  AppState,
  Field,
  FieldPos,
  Fields,
  Unit,
} from 'src/app/shared/types-interfaces';
import { selectBoardFields, selectBroodSpaces } from '..';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  constructor(public store: Store<AppState>, public service: BoardService) {}

  boardDimensions = BOARD_DIMENSIONS;

  fieldSize = FIELD_SIZE;

  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;

  borderObsticlesUp = false;

  fields$: Observable<Fields> = this.store.select(selectBoardFields);

  broodSpaces$: Observable<Fields> = this.store.select(selectBroodSpaces);

  subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.initBoard();
    this.toggleBordersDown();
  }
  ngAfterViewInit() {}
  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initBoard() {
    this.borderObsticlesUp = false;
    this.service.initEmptyFields(this.boardDimensions);
  }

  reloadBoard() {
    this.initBoard();
    this.toggleBordersDown();
  }

  toggleBordersUp() {
    this.borderObsticlesUp = false;
    this.service.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = true;
  }

  toggleBordersDown() {
    this.borderObsticlesUp = true;
    this.service.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = false;
  }

  toggleBorders(): void {
    this.service.toggleBorders(this.boardDimensions, this.borderObsticlesUp);
    this.borderObsticlesUp = !this.borderObsticlesUp;
  }

  handleSetParticleEvent(event: Unit): void {
    this.store.dispatch(setFieldParticle({ unit: event }));
  }

  handleSetObsticleEvent(event: FieldPos): void {
    this.store.dispatch(setFieldObsticle({ pos: event }));
  }

  handleSetEmptyEvent(event: FieldPos): void {
    this.store.dispatch(setFieldEmpty({ pos: event }));
  }

  // ### Composit actions

  // Reinit board fields, then: add borders (obsticles), then: add 2 particles, then: add 2 more obsticles
  scenario1() {
    this.initBoard();
    this.toggleBordersUp();
    this.addUnits(2, 2);
  }

  addUnits(particles: number, obsticles = 0) {
    this.service.addUnits(particles, obsticles);
  }
}
