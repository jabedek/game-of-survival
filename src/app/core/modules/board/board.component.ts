import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';

import * as fastdom from 'fastdom';
import { Store } from '@ngrx/store';
import { UIService } from '@/src/app/core/services/ui.service';

import { BoardDynamicCSS } from '@/src/app/shared/types/ui.types';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';
import { tap, share, switchMap, filter, takeUntil, auditTime, withLatestFrom, map, take, throwIfEmpty } from 'rxjs/operators';

import { setAllFieldsHighlightFalse, setFieldObject, setFieldsHighlightTrue } from '@/src/app/core/state/board/actions/field.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { BoardFields, NeighborsRaport } from '@/src/app/shared/types/board/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { BOARD_DIMENSIONS, FIELD_SIZE } from '@/src/app/shared/constants/board.constants';
import { BoardService } from '@/src/app/core/modules/board/board.service';
import { RootState } from '@/src/app/core/state/root-state.types';
import { selectFieldNeighbors } from '@/src/app/core/state/board/board.selectors';
// import { selectFieldNeighbors } from '../../store/board.selectors';
import * as HELPERS from '@/src/app/shared/helpers/board.helpers';
import { Unit } from '@/src/app/shared/types/board/unit.types';

const AUDIT_TIME = 16;

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  // providers: [BoardService],
})
export class BoardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() boardDimensions: number = undefined;
  @Input() fieldSize: number = undefined;
  @Input() fields: BoardFields = [];
  CSS: BoardDynamicCSS = undefined;

  hostRect: DOMRect = undefined;

  @Output() setUnitEvent: EventEmitter<Unit> = new EventEmitter();
  @Output() setObsticleEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setEmptyEvent: EventEmitter<FieldPos> = new EventEmitter();
  @ViewChildren('div', { read: ElementRef }) div;
  @ViewChildren('fieldsTemplates', { read: ElementRef }) fieldsTemplates: ElementRef;
  dragStart;
  moveTo;
  // fieldSize = FIELD_SIZE;
  CSSsize = FIELD_SIZE * 0.8;
  sub: Subscription = new Subscription();
  currentFieldNeighbors$: Observable<NeighborsRaport> = undefined;
  // ### Functional flags
  borderObsticlesUp = false;
  refs: ElementRef[] = undefined;
  subscription: Subscription = new Subscription();
  accessibleNeighbors: any[] = undefined;
  posStart = undefined;
  fieldsLoaded = false;

  private destroy$ = new Subject<void>();

  constructor(
    public store: Store<RootState>,
    public boardService: BoardService,
    private uiService: UIService,
    private ngZone: NgZone,
    private host: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.hostRect = (this.host.nativeElement as Element).getBoundingClientRect();
    console.log(this.hostRect);

    this.initBoardWithStylings();
    this.observeMouseMove();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.boardDimensions || changes?.fieldSize) {
      this.initBoardWithStylings();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    fastdom.measure(() => {
      fastdom.mutate(() => {
        this.refs = [...(this.fieldsTemplates as any).toArray()];
      });
    });
  }

  trackByFn(index, item: Field) {
    if (index === this.boardDimensions - 1) {
      this.fieldsLoaded = true;
      // this.CSS.structurings.display = 'initial';
      this.cdr.markForCheck();
    }
    return `${item.pos.row}${item.pos.column}`;
  }

  // getDisplay() {
  //   return this.fieldsLoaded ? 'initial' : 'none';
  // }

  private initBoardWithStylings() {
    this.CSS = this.uiService.getStylingsDetails(this.boardDimensions, this.fieldSize);
    // this.CSS.structurings.display = 'none';
  }

  /**
   * Observe mouse action (move, up, down)
   */
  private observeMouseMove() {
    this.ngZone.runOutsideAngular(() => {
      const mousemove$ = fromEvent<MouseEvent>(window, 'mousemove');

      const mouseup$ = fromEvent<MouseEvent>(window, 'mouseup').pipe(
        tap((event) => this.onMouseUp(event)),
        share()
      );

      const mousedown$ = fromEvent<MouseEvent>(window, 'mousedown').pipe(
        filter((event) => event.button === 0),
        tap((event) => this.onMouseDown(event)),
        share()
      );

      const dragging$ = mousedown$.pipe(
        filter(() => Boolean(true)),
        switchMap(() => mousemove$.pipe(takeUntil(mouseup$))),
        share()
      );

      const moveOnDrag$ = dragging$.pipe(
        auditTime(AUDIT_TIME),
        withLatestFrom(mousemove$, (selectObject, event: MouseEvent) => ({
          selectObject,
          event,
        })),
        map(({ event }) => event)
      );

      moveOnDrag$.pipe(takeUntil(this.destroy$)).subscribe((event) => this.ngZone.run(() => this.onDrag(event)));
    });
  }

  onMouseUp(event) {
    this.sub.unsubscribe();
    let startPos: FieldPos = undefined;
    let endPos: FieldPos = undefined;

    if (this.dragStart && this.posStart) {
      [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
        const rect: DOMRect = t.nativeElement.getBoundingClientRect();
        if (HELPERS.isClickInRectBoundries(rect, this.posStart.x, this.posStart.y)) {
          startPos = {
            row: Math.floor(i / BOARD_DIMENSIONS),
            column: i % BOARD_DIMENSIONS,
          };
        }
      });

      [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
        const rect: DOMRect = t.nativeElement.getBoundingClientRect();
        if (HELPERS.isClickInRectBoundries(rect, event.x, event.y)) {
          endPos = {
            row: Math.floor(i / BOARD_DIMENSIONS),
            column: i % BOARD_DIMENSIONS,
          };
        }
      });

      if (startPos && endPos) {
        if (startPos.row === endPos.row && startPos.column === endPos.column) {
          let field = Object.assign({}, this.fields[startPos.row][startPos.column]);

          this.toggleField(field);
        } else {
          if (this.fields[startPos.row][startPos.column]?.occupyingUnit && this.fields[startPos.row][startPos.column]?.mode !== 'other') {
            /**
             * Unit can only move in straight lines like '+' (correct), not diagonal like 'x' (not correct).
             */
            const existingAndCorrect = this.accessibleNeighbors.find(
              (f: Field) => f.pos.row === endPos?.row && f.pos.column === endPos?.column
            );

            /**
             * Without this condition we can move Units any way we want.
             */
            if (existingAndCorrect) {
              this.boardService.moveUnit(startPos, endPos);
            }
          }
        }

        this.store.dispatch(setAllFieldsHighlightFalse());

        this.dragStart = undefined;
        this.posStart = undefined;
      }
    }
  }

  onMouseDown(event) {
    let startPos = undefined;

    [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
      const rect: DOMRect = t.nativeElement.getBoundingClientRect();

      if (HELPERS.isClickInRectBoundries(rect, event.x, event.y)) {
        startPos = {
          row: Math.floor(i / BOARD_DIMENSIONS),
          column: i % BOARD_DIMENSIONS,
        };

        if (!!this.fields[startPos.row][startPos.column]) {
          this.dragStart = event.target.getBoundingClientRect();
          this.posStart = { x: event.x, y: event.y };

          this.store
            .select(selectFieldNeighbors, startPos)
            .pipe(take(1))
            .subscribe((data) => {
              this.accessibleNeighbors = data.accessibleToMove.map((a) => a.field);
              if (
                this.fields[startPos.row][startPos.column]?.occupyingUnit &&
                this.fields[startPos.row][startPos.column].mode !== 'other'
              ) {
                this.store.dispatch(
                  setFieldsHighlightTrue({
                    fieldsToHighLight: this.accessibleNeighbors,
                  })
                );
              }
            });
        }
      }
    });
  }

  onDrag(event) {}

  /**
   * Determines NEXT mode change based on field's current state.
   */
  toggleField(field) {
    this.boardService.toggleField(field);
  }

  addBroodOnContextmenu(event) {
    let startPos: FieldPos = undefined;

    [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
      const rect: DOMRect = t.nativeElement.getBoundingClientRect();

      if (HELPERS.isClickInRectBoundries(rect, event.x, event.y)) {
        startPos = {
          row: Math.floor(i / BOARD_DIMENSIONS),
          column: i % BOARD_DIMENSIONS,
        };
      }
    });

    let rndId = `evitons${getRandom(1000)}`;
    this.boardService.addNewBroodOnContextmenu(rndId, startPos, 'red');
  }
}
