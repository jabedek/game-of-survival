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

  ngOnInit(): void {
    // this.borders();
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

  setSomeBlockades() {
    let totalBlockades = Math.floor((BOARD_DIMENSIONS * BOARD_DIMENSIONS) / 8);
    totalBlockades = 6;

    for (let i = 0; i <= totalBlockades; i++) {
      let rndX = Math.floor(Math.random() * BOARD_DIMENSIONS);
      let rndY = Math.floor(Math.random() * BOARD_DIMENSIONS);

      this.store.dispatch(setFieldBlockedTrue({ pos: { x: rndX, y: rndY } }));
    }
  }

  setSomeUnits() {
    console.log('setSomeUnits');

    // let brood: Brood = [null, null, null, null];

    this.store.select(selectBoardFields).subscribe((data: Fields) => {
      // for (let i = 0; i < 4; i++) {
      //   let field = this.getAvailableField(data);
      //   console.log('wylosowane', field);
      //   let unit: Unit = null;
      //   if (!!field) {
      //     unit = {
      //       pos: field.pos,
      //       unitName: 'moouse-deer-0',
      //       broodName: 'animalien',
      //     };
      //   }
      //   // brood[i] = unit;
      //   this.store.dispatch(
      //     setFieldOccupyingUnit({ pos: unit?.pos, occupyingUnit: unit })
      //   );
      // }
    });
  }

  getAvailableField(fields: Fields) {
    let available = false;
    let field: Field = null;
    while (!available) {
      let x = Math.floor(Math.random() * BOARD_DIMENSIONS);
      let y = Math.floor(Math.random() * BOARD_DIMENSIONS);
      let pos: FieldPos = { x, y };

      let result = this.checkIfFieldAvailable(fields, pos);

      if (result !== null) {
        field = result;
        available = true;
        break;
      }

      return field;
    }
  }

  checkIfFieldAvailable(fields: Fields, checkedPos: FieldPos): Field | null {
    const field: Field = fields[checkedPos.x][checkedPos.y];
    return !field.blocked ? field : null;
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
