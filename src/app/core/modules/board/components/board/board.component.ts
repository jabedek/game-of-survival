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

import { setAllFieldsHighlightFalse, setFieldBox, setFieldsHighlightTrue } from '@/src/app/core/state/board/actions/field.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { BoardFields, NeighborsRaport, ParticleUnit, Unit } from '@/src/app/shared/types/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/field.types';
import { BOARD_DIMENSIONS, FIELD_SIZE } from '@/src/app/shared/constants/board.constants';
import { BoardService } from '@/src/app/core/modules/board/board.service';
import { RootState } from '@/src/app/core/state/root-state';
import { selectFieldNeighbors } from '@/src/app/core/state/board/board.selectors';
// import { selectFieldNeighbors } from '../../store/board.selectors';
import * as HELPERS from '@/src/app/shared/helpers/board.helpers';

const AUDIT_TIME = 16;

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() boardDimensions: number = null;
  @Input() fieldSize: number = null;
  @Input() fields: BoardFields = [];
  CSS: BoardDynamicCSS = null;

  hostRect: DOMRect = null;

  private destroy = new Subject<void>();
  @Output() setParticleEvent: EventEmitter<Unit> = new EventEmitter();
  @Output() setObsticleEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setEmptyEvent: EventEmitter<FieldPos> = new EventEmitter();
  @ViewChildren('div', { read: ElementRef }) div;
  @ViewChildren('fieldsTemplates', { read: ElementRef })
  fieldsTemplates: ElementRef;
  dragStart;
  moveTo;
  // fieldSize = FIELD_SIZE;
  CSSsize = FIELD_SIZE * 0.8;
  sub: Subscription = new Subscription();
  currentFieldNeighbors$: Observable<NeighborsRaport> = null;
  // ### Functional flags
  borderObsticlesUp = false;
  refs: ElementRef[] = null;
  subscription: Subscription = new Subscription();
  accessibleNeighbors: any[] = null;
  posStart = null;
  fieldsLoaded = false;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.boardDimensions || changes?.fieldSize) {
      this.initBoardWithStylings();
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngAfterViewInit(): void {
    fastdom.measure(() => {
      fastdom.mutate(() => {
        this.refs = [...(this.fieldsTemplates as any).toArray()];
      });
    });
  }

  trackByFn(index, item: Field) {
    console.info(index, '===', this);

    if (index === this.boardDimensions - 1) {
      this.fieldsLoaded = true;
      // this.CSS.structurings.display = 'initial';
      this.cdr.markForCheck();
    }
    return `${item.pos.row}${item.pos.column}`;
  }

  getDisplay() {
    console.log(this.fieldsLoaded ? 'initial' : 'none');

    return this.fieldsLoaded ? 'initial' : 'none';
  }

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
        withLatestFrom(mousemove$, (selectBox, event: MouseEvent) => ({
          selectBox,
          event,
        })),
        map(({ event }) => event)
      );

      moveOnDrag$.pipe(takeUntil(this.destroy)).subscribe((event) => this.ngZone.run(() => this.onDrag(event)));
    });
  }

  onMouseUp(event) {
    this.sub.unsubscribe();
    let startPos: FieldPos = null;
    let endPos: FieldPos = null;

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
             * Particle can only move in straight lines like '+' (correct), not diagonal like 'x' (not correct).
             */
            const existingAndCorrect = this.accessibleNeighbors.find(
              (f: Field) => f.pos.row === endPos?.row && f.pos.column === endPos?.column
            );

            /**
             * Without this condition we can move Particles any way we want.
             */
            if (existingAndCorrect) {
              this.boardService.moveParticle(startPos, endPos);
            }
          }
        }

        this.store.dispatch(setAllFieldsHighlightFalse());

        this.dragStart = null;
        this.posStart = null;
      }
    }
  }

  onMouseDown(event) {
    let startPos = null;

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

  onDrag(event) {
    // console.log(event);
  }

  /**
   * Determines NEXT mode change based on field's current state.
   */
  toggleField(field) {
    switch (field.mode) {
      case 'empty':
        this.boardService.setFieldObsticle(field.pos);
        break;
      case 'obsticle':
        const unit: ParticleUnit = new ParticleUnit(`solo${getRandom(1000)}`, field.pos, 'blue');
        this.boardService.addNewParticle(unit);
        break;
      case 'particle':
        this.boardService.setFieldBox(field.pos);
        break;
      case 'other':
      default:
        this.boardService.deleteUnit(field.pos);
        break;
    }
  }

  addBroodOnContextmenu(event) {
    let startPos: FieldPos = null;

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
