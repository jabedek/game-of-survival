import { trimTrailingNulls } from '@angular/compiler/src/render3/view/util';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

import * as uuid from 'uuid';

import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
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
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('openClose', [
      // ...
      state(
        'open',
        style({
          height: '200px',
          opacity: 1,
          backgroundColor: 'yellow',
        })
      ),
      state(
        'closed',
        style({
          height: '100px',
          opacity: 0.5,
          backgroundColor: 'green',
        })
      ),
      transition('open => closed', [animate('1s')]),
      transition('closed => open', [animate('0.5s')]),
      transition('* => closed', [animate('1s')]),
      transition('* => open', [animate('0.5s')]),
      transition('open <=> closed', [animate('0.5s')]),
      transition('* => open', [animate('1s', style({ opacity: '*' }))]),
      transition('* => *', [animate('1s')]),
    ]),
  ],
})
export class BoardComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  constructor(public store: Store<AppState>, public fb: FormBuilder) {}

  @Input() boardDimensions;
  @Input() fieldSize;

  fields$: Observable<Fields> = this.store.select(selectBoardFields);
  availableBoardFields$: Observable<Field[]> = this.store.select(
    selectAvailableFieldsTotal
  );
  broodSpaces$: Observable<Fields> = this.store.select(selectBroodSpaces);
  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;

  form: FormGroup;

  boardMode: 'admin' | 'playing' = 'admin';
  // boardDimensions = BOARD_DIMENSIONS;
  dimensions = 0;
  boardCSSsizePx: string;
  fieldCSSSizePx: string;
  fieldDimensions: FieldPos[][] = [];

  subscription: Subscription = new Subscription();

  borderObsticlesUp = false;

  initForm() {
    let group = {};

    group['dimensions'] = new FormControl(BOARD_DIMENSIONS || 1, [
      Validators.min(1),
      Validators.max(50),
    ]);
    group['fieldSize'] = new FormControl(FIELD_SIZE || 1, [
      Validators.min(1),
      Validators.max(50),
    ]);

    this.form = this.fb.group(group);
  }

  // @HostListener('setFieldOccupyingUnit', ['$event.target'])
  toggleSwitch(): void {
    this.boardMode = this.boardMode === 'admin' ? 'playing' : 'admin';
  }

  public getBoardStyles(): any {
    return {
      display: 'grid',
      'grid-template-columns': `repeat(${this.boardDimensions}, ${this.fieldCSSSizePx})`,
      'grid-template-rows': `repeat(${this.boardDimensions}, ${this.fieldCSSSizePx})`,
      width: ` ${this.boardCSSsizePx}`,
      height: ` ${this.boardCSSsizePx}`,
    };
  }

  ngOnInit(): void {
    this.boardCSSsizePx = this.boardDimensions * this.fieldSize + 'px';
    this.fieldCSSSizePx = this.fieldSize + 'px';
    // #### IT IS WORKING CODE BUT NOT FOR CONSTANS USE - MEMORY LEAKS
    // this.subscription.add(
    //   this.store
    //     .select(selectBroodSpaces)
    //     .subscribe((data) => console.log(data))
    // );
    this.initForm();

    this.subscription.add(
      this.availableBoardFields$.subscribe((data) => {
        if (data) {
          // console.log(data.length);
        }
      })
    );
    this.setupBoard();
    this.borders();
    this.setSomeUnits();
    // this.setSomeBlockades();
    // this.findBroodSpaces();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngAfterViewChecked(): void {}
  ngOnDestroy(): void {
    console.log('destroy');

    this.subscription.unsubscribe();
  }

  setupBoard(): void {
    for (let row = 0; row < BOARD_DIMENSIONS; row++) {
      this.fieldDimensions[row] = [];
      for (let column = 0; column < BOARD_DIMENSIONS; column++) {
        this.fieldDimensions[row][column] = { row, column };
        // this.fieldDimensions[row][column] = `${row}:${column}`;
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

      this.store.dispatch(setFieldBlockedTrue({ pos: { row, column } }));
    }
  }

  setSomeUnits(): void {
    const brood: Brood = {
      id: 's',
      name: 'froggo-jumper',
      units: [],
      color: 'rgba(0, 0, 0, 0)',
    };
    let done = false;
    this.putUnitOnUnblockedField();
    // this.putUnitOnUnblockedField();
    // this.putUnitOnUnblockedField();
    // this.putUnitOnUnblockedField();
    // this.putUnitOnUnblockedField();

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

            if (!rndmlySelectedField.blocked) {
              const unit: Unit = {
                id: uuid.v4(),
                pos: rndmlySelectedField.pos,
                name: 'animalien',
                broodId: uuid.v4(),
              };
              console.log(unit);

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

    for (let row = 0; row < BOARD_DIMENSIONS; row++) {
      for (let column = 0; column < BOARD_DIMENSIONS; column++) {
        if (
          row == 0 ||
          column == 0 ||
          row == BOARD_DIMENSIONS - 1 ||
          column == BOARD_DIMENSIONS - 1
        ) {
          const pos: FieldPos = { row, column };
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
