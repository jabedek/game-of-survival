import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { dispatch } from 'rxjs/internal/observable/pairs';
import { AppState } from 'src/app/shared/AppState';
import { selectBoardFields } from '..';
import {
  initFields,
  setFieldBlockedTrue,
  setFieldBlockedFalse,
  toggleFieldBlockade,
} from '../board.actions';
import {
  BOARD_DIMENSIONS,
  BOARD_DIMENSIONS_X,
  BOARD_DIMENSIONS_Y,
  BOARD_FIELD_SIZE,
} from '../board.constants';
import { Field, Fields } from '../board.models';
import { FieldPos, FieldPropertyUpdateDetails } from '../field/field.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  fields$: Observable<Fields> = this.store.select(selectBoardFields);

  boardDimension = BOARD_DIMENSIONS;
  fieldSize = BOARD_FIELD_SIZE;
  boardCSSsizePx: string = this.boardDimension * this.fieldSize + 'px';
  fieldCSSSizePx: string = this.fieldSize + 'px';

  subscription: Subscription = new Subscription();

  borderObsticlesUp: boolean = false;

  board: Fields = [];
  board2: string[][] = [];

  public getBoardStyles() {
    return {
      display: 'grid',
      'grid-template-columns': `repeat(${this.boardDimension}, ${this.fieldCSSSizePx})`,
      'grid-template-rows': `repeat(${this.boardDimension}, ${this.fieldCSSSizePx})`,
      width: ` ${this.boardCSSsizePx}`,
      height: ` ${this.boardCSSsizePx}`,
    };
  }

  constructor(public store: Store<AppState>) {
    // this.subscription.add(this.fields$.subscribe((data) => console.log(data)));
    this.setupBoard();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    console.log('board changes', changes);
  }

  ngAfterViewChecked() {}
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  setupBoard() {
    for (let x = 0; x < BOARD_DIMENSIONS; x++) {
      this.board2[x] = [];
      for (let y = 0; y < BOARD_DIMENSIONS; y++) {
        this.board2[x][y] = `${x}:${y}`;
      }
    }
  }

  handleToggleFieldBlockade(event: FieldPos) {
    console.log(event);

    this.store.dispatch(toggleFieldBlockade({ pos: event }));
  }

  borders() {
    this.borderObsticlesUp = !this.borderObsticlesUp;

    for (let x = 0; x < BOARD_DIMENSIONS; x++) {
      for (let y = 0; y < BOARD_DIMENSIONS; y++) {
        //  this.board2[x][y] = `${x}:${y}`;
        if (
          x == 0 ||
          y == 0 ||
          x == BOARD_DIMENSIONS - 1 ||
          y == BOARD_DIMENSIONS - 1
        ) {
          let actionTrue = setFieldBlockedTrue({ pos: { x, y } });
          let actionFalse = setFieldBlockedFalse({ pos: { x, y } });

          let actionResult = this.borderObsticlesUp ? actionTrue : actionFalse;

          this.store.dispatch(actionResult);
        }
      }
    }
  }
}
