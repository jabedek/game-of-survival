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
import { concatMap, mergeMap, switchMap } from 'rxjs/operators';
import {
  AppState,
  Brood,
  BroodSpace,
  FieldPos,
  Fields,
  Unit,
} from 'src/app/shared/types-interfaces';
import {
  selectAvailableFieldsTotal,
  selectBoardFields,
  selectBroodSpaces,
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
  BOARD_FIELD_SIZE,
  FIELD_DISPLAY_INFO,
} from '../board.constants';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  fields$: Observable<Fields> = this.store.select(selectBoardFields);
  availableFieldsTotal$: Observable<number> = this.store.select(
    selectAvailableFieldsTotal
  );
  broodSpaces$: Observable<Fields> = this.store.select(selectBroodSpaces);
  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;

  loadedFields = 0;
  boardMode = true;
  // true: 'admin'; false: 'play''

  boardDimension = BOARD_DIMENSIONS;
  fieldSize = BOARD_FIELD_SIZE;
  boardCSSsizePx: string = this.boardDimension * this.fieldSize + 'px';
  fieldCSSSizePx: string = this.fieldSize + 'px';

  subscription: Subscription = new Subscription();

  borderObsticlesUp: boolean = false;

  board2: string[][] = [];
  toggleSwitch() {
    console.log('elo');

    this.boardMode = !this.boardMode;
  }
  public getBoardStyles() {
    return {
      display: 'grid',
      'grid-template-columns': `repeat(${this.boardDimension}, ${this.fieldCSSSizePx})`,
      'grid-template-rows': `repeat(${this.boardDimension}, ${this.fieldCSSSizePx})`,
      width: ` ${this.boardCSSsizePx}`,
      height: ` ${this.boardCSSsizePx}`,
    };
  }

  constructor(public store: Store<AppState>) {}

  ngOnInit(): void {
    this.subscription.add(
      this.store
        .select(selectBroodSpaces)
        .subscribe((data) => console.log(data))
    );

    this.subscription.add(
      this.availableFieldsTotal$.subscribe((data) => console.log(data))
    );
    this.setupBoard();
    this.borders();
    // this.setSomeBlockades();
    this.setSomeUnits();
    this.findBroodSpaces();
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
    this.borderObsticlesUp = false;
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
    let brood: Brood = {
      broodName: 'froggo-jumper',
      broodUnits: [],
      broodColor: 'rgba(0, 0, 0, 0)',
    };
    let done = false;

    this.store.select(selectBoardFields).subscribe((data: Fields) => {
      let totalUnits = 1;
      for (let i = 0; i < totalUnits; i++) {
        const unit: Unit = this.putUnitOnUnblockedField(data);

        brood.broodUnits[i] = unit;
        if (i === totalUnits - 1) {
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
    }

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
      }
    }
  }

  findBroodSpaces() {
    let spaces: BroodSpace[] = [];

    // this.fields$
    //   .pipe(
    //     concatMap((data) => {
    //       return data;
    //     })
    //   )
    //   .subscribe((data) => console.log(data));

    // this.fields$.subscribe((data) => {
    //   this.store
    //     .select(selectBroodSpaces)
    //     .subscribe((data) => console.log(data));
    //   // data.forEach((fieldsCol) => {
    //   //   fieldsCol.forEach((field) => {

    //   //   });
    //   // });
    // });
  }
}
