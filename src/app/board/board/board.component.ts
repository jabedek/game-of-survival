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
import { GameService } from 'src/app/game/game.service';
import { defaultThrottleConfig } from 'rxjs/internal/operators/throttle';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent
  implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  constructor(
    public store: Store<AppState>,
    public fb: FormBuilder,
    public game: GameService
  ) {}

  @Input() boardDimensions;
  @Input() fieldSize;

  // fields$: Observable<Fields> = this.store.select(selectBoardFields);
  // availableBoardFields$: Observable<Field[]> = this.store.select(
  //   selectAvailableFieldsTotal
  // );
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

    this.reloadBoard();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  ngAfterViewChecked(): void {}
  ngOnDestroy(): void {
    console.log('destroy');

    this.subscription.unsubscribe();
  }

  private setupBoard(): void {
    this.fieldDimensions = this.game.initFieldsPositions();
  }

  reloadBoard(): void {
    this.setupBoard();
    this.game.reloadFields();
  }

  toggleBorders(): void {
    this.game.toggleBorders();
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
}
