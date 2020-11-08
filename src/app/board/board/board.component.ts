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
import {
  NOselectAvailableFields,
  selectBoardFields,
  selectFieldBlocked,
} from '..';
import {
  initFields,
  setFieldBlockedTrue,
  setFieldBlockedFalse,
  toggleFieldBlockade,
  setFieldOccupyingUnitNull,
  setOccupyingUnit,
  setFieldUnblocked,
  setFieldsUnblocked,
} from '../board.actions';
import {
  BOARD_DIMENSIONS,
  BOARD_DIMENSIONS_X,
  BOARD_DIMENSIONS_Y,
  BOARD_FIELD_SIZE,
  Brood,
  FIELD_DISPLAY_INFO,
  Unit,
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

  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;

  boardDimension = BOARD_DIMENSIONS;
  fieldSize = BOARD_FIELD_SIZE;
  boardCSSsizePx: string = this.boardDimension * this.fieldSize + 'px';
  fieldCSSSizePx: string = this.fieldSize + 'px';

  subscription: Subscription = new Subscription();

  borderObsticlesUp: boolean = false;

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

  ngOnInit(): void {
    this.setSomeBlockades();
    this.setSomeUnits();
  }

  ngOnChanges(changes: SimpleChanges) {}

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

  reloadFields() {
    this.store.dispatch(setFieldsUnblocked());

    this.setupBoard();
    this.setSomeBlockades();
    this.setSomeUnits();
  }

  setSomeBlockades() {
    let totalBlockades = Math.floor((BOARD_DIMENSIONS * BOARD_DIMENSIONS) / 8);
    totalBlockades = 4;

    for (let i = 0; i < totalBlockades; i++) {
      let rndX = Math.floor(Math.random() * BOARD_DIMENSIONS);
      let rndY = Math.floor(Math.random() * BOARD_DIMENSIONS);

      this.store.dispatch(setFieldBlockedTrue({ pos: { x: rndX, y: rndY } }));
    }
  }

  setSomeUnits() {
    console.log('setSomeUnits');

    let brood: Brood = {
      broodName: 'froggo-jumper',
      broodUnits: [null, null, null, null],
    };
    let done = false;

    this.store.select(selectBoardFields).subscribe((data: Fields) => {
      for (let i = 0; i < 4; i++) {
        const unit: Unit = this.putUnitOnUnblockedField(data);
        console.log(unit);

        brood.broodUnits[i] = unit;
        if (i === 3) {
          done = true;
        }
      }
    });

    if (done) {
      brood.broodUnits.forEach((unit) => {
        this.store.dispatch(setOccupyingUnit({ unit }));
      });
    }
  }

  putUnitOnUnblockedField(board: Fields): null | Unit {
    let success = false;
    let newUnit: Unit = null;

    while (!success) {
      const pos: FieldPos = {
        x: Math.floor(Math.random() * BOARD_DIMENSIONS),
        y: Math.floor(Math.random() * BOARD_DIMENSIONS),
      };

      const isBlocked: boolean = board[pos.x][pos.y].blocked;
      // froggo'lion
      // fisho'jumper

      if (!isBlocked) {
        const unit = {
          pos,
          unitName: 'mouse-deer-0',
          broodName: 'animalien',
        };
        newUnit = unit;
        success = true;
      } else {
        success = false;
      }

      // console.log(success);
    }
    // console.log(newUnit);

    return newUnit;
  }

  handleToggleFieldBlockade(event: FieldPos) {
    this.store.dispatch(toggleFieldBlockade({ pos: event }));
  }

  handleSetFieldOccupyingUnit(event: Unit) {
    this.store.dispatch(setOccupyingUnit({ unit: event }));
  }

  handleSetFieldUnblocked(event: FieldPos) {
    this.store.dispatch(setFieldUnblocked({ pos: event }));
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
          const pos: FieldPos = { x, y };
          let actionTrue = setFieldBlockedTrue({ pos });
          let actionFalse = setFieldBlockedFalse({ pos });

          let actionResult = this.borderObsticlesUp ? actionTrue : actionFalse;

          this.store.dispatch(setFieldOccupyingUnitNull({ pos }));
          this.store.dispatch(actionResult);
        }

        let unit: Unit = {
          pos: { x, y },
          unitName: 'mouse-deer-0',
          broodName: '',
        };
      }
    }
  }
}
