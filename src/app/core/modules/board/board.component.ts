import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
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
import { tap, share, switchMap, filter, takeUntil, auditTime, withLatestFrom, map, take, throwIfEmpty, first } from 'rxjs/operators';

import { setAllFieldsHighlightFalse, setFieldObject, setFieldsHighlightTrue } from '@/src/app/core/state/board/actions/field.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { BoardFields, NeighborField, NeighborsRaport } from '@/src/app/shared/types/board/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { DEFAULT_FIELD_SIZE_COMPUTED, FIELD_CONTENT_REDUCING_FACTOR } from '@/src/app/shared/constants/board.constants';
import { BoardService } from '@/src/app/core/modules/board/board.service';
import { RootState } from '@/src/app/core/state/root-state.types';
import { selectFieldNeighbors } from '@/src/app/core/state/board/board.selectors';
// import { selectFieldNeighbors } from '../../store/board.selectors';
import * as HELPERS from '@/src/app/shared/helpers/board.helpers';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { Pos } from '@/src/app/shared/types/common.types';

const AUDIT_TIME = 16;

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  // providers: [BoardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() boardDimensions = 0;
  @Input() fieldSizeComputed = 0;
  @Input() fields: BoardFields = [];
  CSS: BoardDynamicCSS | undefined;

  hostRect: DOMRect | undefined;

  // @Output() setUnitEvent: EventEmitter<Unit> = new EventEmitter();
  // @Output() setObsticleEvent: EventEmitter<FieldPos> = new EventEmitter();
  // @Output() setEmptyEvent: EventEmitter<FieldPos> = new EventEmitter();
  @ViewChildren('fieldsTemplates', { read: ElementRef }) fieldsTemplates: QueryList<ElementRef> | undefined;
  mouseDragStart: Pos | undefined;
  mousePosStart: Pos | undefined;
  mouseMoveTo: Pos | undefined;
  // fieldSizeComputed = DEFAULT_FIELD_SIZE_COMPUTED;
  CSSsize = DEFAULT_FIELD_SIZE_COMPUTED * FIELD_CONTENT_REDUCING_FACTOR;
  sub: Subscription = new Subscription();
  currentFieldNeighbors$: Observable<NeighborsRaport> | undefined;
  // ### Functional flags
  borderObsticlesUp = false;
  refs: ElementRef[] | undefined;
  subscription: Subscription = new Subscription();
  mouseAccessibleFields: Field[] | undefined;
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

    this.initBoardWithStylings();
    this.observeMouseMove();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.boardDimensions || changes?.fieldSizeComputed || changes?.fields) {
      this.initBoardWithStylings();
      this.CSSsize = this.fieldSizeComputed * FIELD_CONTENT_REDUCING_FACTOR;
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

  trackByFnRow(index: number): string {
    return `${index}`;
  }

  trackByFnCell(index: number, item: Field): string {
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

  private initBoardWithStylings(): void {
    this.CSS = this.uiService.getStylingsDetails(this.boardDimensions, this.fieldSizeComputed);
    // this.CSS.structurings.display = 'none';
  }

  /**
   * Observe mouse action (move, up, down)
   */
  private observeMouseMove(): void {
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

  getFieldFromPos(positionSource: Pos): FieldPos {
    let pos: FieldPos = { column: -1, row: -1 };

    this.fieldsTemplates?.toArray().find((t, i) => {
      if (HELPERS.isClickInRectBoundries(t.nativeElement.getBoundingClientRect(), positionSource)) {
        pos = {
          row: Math.floor(i / this.boardDimensions),
          column: i % this.boardDimensions,
        };
        return true;
      }
    });

    return pos;
  }

  onMouseUp(event: MouseEvent): void {
    this.sub.unsubscribe();

    if (this.mouseDragStart && this.mousePosStart) {
      const startPos = this.getFieldFromPos(this.mousePosStart);
      const endPos = this.getFieldFromPos(event);

      if (startPos && endPos) {
        if (HELPERS.areTwoPositionsEqual(startPos, endPos)) {
          const field = Object.assign({}, this.fields[startPos.row][startPos.column]);

          this.toggleField(field);
        } else {
          if (this.fields[startPos.row][startPos.column]?.occupyingUnit && this.fields[startPos.row][startPos.column]?.mode !== 'other') {
            /**
             * Unit can only move in straight lines like '+' (correct), not diagonal like 'x' (not correct).
             */
            const existingAndCorrect = this.mouseAccessibleFields?.find((f: Field | undefined) => f && HELPERS.areTwoPositionsEqual(f.pos, endPos));

            /**
             * Without this condition we can move Units any way we want.
             */
            if (existingAndCorrect) {
              this.boardService.moveUnit(startPos, endPos);
            }
          }
        }

        this.store.dispatch(setAllFieldsHighlightFalse());

        this.mouseDragStart = undefined;
        this.mousePosStart = undefined;
      }
    }
  }

  onMouseDown(event: MouseEvent): void {
    let startPos: FieldPos;

    this.fieldsTemplates?.toArray().find((t, i) => {
      const rect: DOMRect = t.nativeElement.getBoundingClientRect();

      if (HELPERS.isClickInRectBoundries(rect, event)) {
        startPos = {
          row: Math.floor(i / this.boardDimensions),
          column: i % this.boardDimensions,
        };

        if (!!this.fields[startPos.row][startPos.column]) {
          this.mouseDragStart = (event.target as HTMLElement).getBoundingClientRect();
          this.mousePosStart = { x: event.x, y: event.y };

          this.store
            .select(selectFieldNeighbors, startPos)
            .pipe(first())
            .subscribe((data: NeighborsRaport) => {
              const fields: Field[] = [];
              data.accessibleToMove.forEach((n) => (!!n.field ? fields.push(n.field) : undefined));
              this.mouseAccessibleFields = fields;

              if (this.fields[startPos.row][startPos.column]?.occupyingUnit && this.fields[startPos.row][startPos.column].mode !== 'other') {
                this.store.dispatch(
                  setFieldsHighlightTrue({
                    fieldsToHighLight: this.mouseAccessibleFields,
                  })
                );
              }
            });
        }
      }
    });
  }

  onDrag(event: MouseEvent): void {}

  /**
   * Determines NEXT mode change based on field's current state.
   */
  toggleField(field: Field): void {
    this.boardService.toggleField(field);
  }

  addGroupOnContextmenu(event: MouseEvent): void {
    this.boardService.addNewGroupOnContextmenu(`evitons${getRandom(1000)}`, this.getFieldFromPos(event), 'red');
  }
}
