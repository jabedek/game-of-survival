import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';
import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
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
  Field,
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
  FIELD_SIZE,
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
  availableBoardFields$: Observable<Field[]> = this.store.select(
    selectAvailableFieldsTotal
  );
  broodSpaces$: Observable<Fields> = this.store.select(selectBroodSpaces);
  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;

  private loadedFields = 0;
  boardMode: 'admin' | 'playing' = 'admin';
  boardDimension = BOARD_DIMENSIONS;

  boardCSSsizePx: string = this.boardDimension * FIELD_SIZE + 'px';
  fieldCSSSizePx: string = FIELD_SIZE + 'px';

  subscription: Subscription = new Subscription();

  borderObsticlesUp = false;

  fieldDimensions: FieldPos[][] = [];

  @HostListener('setFieldOccupyingUnit', ['$event.target'])
  onClick(btn) {
    console.log('setFieldOccupyingUnit');
  }

  toggleSwitch(): void {
    console.log('elo');

    this.boardMode = this.boardMode === 'admin' ? 'playing' : 'admin';
  }

  public getBoardStyles(): any {
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
    // #### IT IS WORKING CODE BUT NOT FOR CONSTANS USE - MEMORY LEAKS
    // this.subscription.add(
    //   this.store
    //     .select(selectBroodSpaces)
    //     .subscribe((data) => console.log(data))
    // );

    this.subscription.add(
      this.availableBoardFields$.subscribe((data) => {
        if (data) {
          console.log(data.length);
        }
      })
    );
    this.setupBoard();
    this.borders();
    this.setSomeUnits();
    // this.setSomeBlockades();
    // this.findBroodSpaces();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  ngAfterViewChecked(): void {}
  ngOnDestroy(): void {
    console.log('destroy');

    this.subscription.unsubscribe();
  }

  setupBoard(): void {
    for (let column = 0; column < BOARD_DIMENSIONS; column++) {
      this.fieldDimensions[column] = [];
      for (let row = 0; row < BOARD_DIMENSIONS; row++) {
        this.fieldDimensions[column][row] = { column, row };
        // this.fieldDimensions[column][row] = `${column}:${row}`;
      }
    }
  }

  reloadFields(): void {
    this.borderObsticlesUp = false;
    this.store.dispatch(setFieldsUnblocked());

    this.setupBoard();
    this.borders();
    this.setSomeUnits();
  }

  setSomeBlockades(): void {
    let totalBlockades = Math.floor((BOARD_DIMENSIONS * BOARD_DIMENSIONS) / 8);
    totalBlockades = 4;

    for (let i = 0; i < totalBlockades; i++) {
      const column = Math.floor(Math.random() * BOARD_DIMENSIONS);
      const row = Math.floor(Math.random() * BOARD_DIMENSIONS);

      this.store.dispatch(setFieldBlockedTrue({ pos: { column, row } }));
    }
  }

  setSomeUnits(): void {
    const brood: Brood = {
      broodName: 'froggo-jumper',
      broodUnits: [],
      broodColor: 'rgba(0, 0, 0, 0)',
    };
    let done = false;
    this.putUnitOnUnblockedField();
    this.putUnitOnUnblockedField();
    this.putUnitOnUnblockedField();
    this.putUnitOnUnblockedField();
    this.putUnitOnUnblockedField();
    // this.store.select(selectBoardFields).subscribe((data: Fields) => {
    //   let totalUnits = 1;
    //   for (let i = 0; i < totalUnits; i++) {
    //     this.putUnitOnUnblockedField();

    //     // brood.broodUnits[i] = unit;

    //     if (i === totalUnits - 1) {
    //       done = true;
    //       break;
    //     }
    //   }
    // });

    // if (done) {
    //   brood.broodUnits.forEach((unit) => {
    //     this.store.dispatch(setOccupyingUnit({ unit }));
    //   });
    // }
  }

  putUnitOnUnblockedField() {
    let success = false;
    let newUnit: Unit = null;
    let board: Field[] = [];

    this.availableBoardFields$
      .subscribe((data: Field[]) => {
        board = data;

        if (board.length) {
          while (!success) {
            const rndmlySelectedField =
              board[Math.floor(Math.random() * board.length)];

            console.log(rndmlySelectedField);

            if (!rndmlySelectedField.blocked) {
              const unit = {
                pos: rndmlySelectedField.pos,
                unitName: 'mouse-deer-0',
                broodName: 'animalien',
              };
              newUnit = unit;
              success = true;
              this.store.dispatch(setOccupyingUnit({ unit: newUnit }));
            } else {
              success = false;
            }
          }
        } else {
          console.log('no available fields');
        }
        // if (success && newUnit) {
        //   console.log(newUnit);

        //   this.store.dispatch(setOccupyingUnit({ unit: newUnit }));
        // }
        // return newUnit;
      })
      .unsubscribe();
  }

  handleToggleFieldBlockade(event: FieldPos): void {
    this.store.dispatch(toggleFieldBlockade({ pos: event }));
  }

  handleSetFieldOccupyingUnit(event: Unit): void {
    this.store.dispatch(setOccupyingUnit({ unit: event }));
  }

  handleSetFieldUnblocked(event: FieldPos): void {
    this.store.dispatch(setFieldUnblocked({ pos: event }));
  }

  borders(): void {
    this.borderObsticlesUp = !this.borderObsticlesUp;

    for (let column = 0; column < BOARD_DIMENSIONS; column++) {
      for (let row = 0; row < BOARD_DIMENSIONS; row++) {
        if (
          column == 0 ||
          row == 0 ||
          column == BOARD_DIMENSIONS - 1 ||
          row == BOARD_DIMENSIONS - 1
        ) {
          const pos: FieldPos = { column, row };
          let actionTrue = setFieldBlockedTrue({ pos });
          let actionFalse = setFieldBlockedFalse({ pos });

          let actionResult = this.borderObsticlesUp ? actionTrue : actionFalse;

          this.store.dispatch(setFieldOccupyingUnitNull({ pos }));
          this.store.dispatch(actionResult);
        }
      }
    }
  }

  findBroodSpaces(): void {
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
