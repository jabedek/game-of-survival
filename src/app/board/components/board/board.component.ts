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
import { Store } from '@ngrx/store';
import { RootState } from 'src/app/root-state';
import { UIService } from 'src/app/ui/ui.service';

import { BoardDynamicCSS } from 'src/app/ui/ui.types';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';
import {
  tap,
  share,
  switchMap,
  filter,
  takeUntil,
  auditTime,
  withLatestFrom,
  map,
  take,
} from 'rxjs/operators';
import {
  moveParticleFromTo,
  setField,
} from '../../store/actions/board.actions';

import {
  setAllFieldsHighlightFalse,
  setFieldsHighlightTrue,
} from '../../store/actions/field.actions';
import { getRandom } from 'src/app/shared/helpers';
import {
  BoardFields,
  NeighborsRaport,
  ParticleUnit,
  Unit,
} from '../../types/board.types';
import { Field, FieldPos } from '../../types/field.types';
import { BOARD_DIMENSIONS, FIELD_SIZE } from '../../board.constants';
import { BoardService } from '../../board.service';
import { selectFieldNeighbors } from '../../store/board.selectors';

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
  constructor(
    public store: Store<RootState>,
    public boardService: BoardService,
    private uiService: UIService,
    private ngZone: NgZone,
    private host: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.hostRect = (this.host
      .nativeElement as Element).getBoundingClientRect();

    this.initBoardWithStylings();
    this.observeMouseMove();

    // this.subscription.add(
    //   this.store.select(selectBuilderMode).subscribe((data) => {
    //     if (data === true) {
    //     } else {
    //       this.destroy.next();
    //     }
    //   })
    // );
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.boardDimensions || changes?.fieldSize) {
      this.initBoardWithStylings();
    }
  }

  ngAfterViewInit() {
    this.refs = [...(this.fieldsTemplates as any).toArray()];
  }

  trackByFn(_, item: Field) {
    return `${item.pos.row}${item.pos.column}`;
  }

  private initBoardWithStylings() {
    this.CSS = this.uiService.getStylingsDetails(
      this.boardDimensions,
      this.fieldSize
    );
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

      moveOnDrag$
        .pipe(takeUntil(this.destroy))
        .subscribe((event) => this.ngZone.run(() => this.moveParticle(event)));
    });
  }

  inRectBoundries(rect: DOMRect, x: number, y: number) {
    if (
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom
    ) {
      // console.log(
      //   rect,
      //   x,
      //   y,
      //   x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      // );
    }
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  onMouseUp(event) {
    console.log('onMouseUp');

    this.sub.unsubscribe();
    let startPos: FieldPos = null;
    let endPos: FieldPos = null;

    // console.log(this.dragStart, this.posStart);

    if (this.dragStart && this.posStart) {
      [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
        const rect: DOMRect = t.nativeElement.getBoundingClientRect();

        if (this.inRectBoundries(rect, this.posStart.x, this.posStart.y)) {
          startPos = {
            row: Math.floor(i / BOARD_DIMENSIONS),
            column: i % BOARD_DIMENSIONS,
          };
        }
      });

      [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
        const rect: DOMRect = t.nativeElement.getBoundingClientRect();
        if (this.inRectBoundries(rect, event.x, event.y)) {
          endPos = {
            row: Math.floor(i / BOARD_DIMENSIONS),
            column: i % BOARD_DIMENSIONS,
          };
        }
      });

      // console.log(startPos, endPos);

      if (startPos && endPos) {
        if (startPos.row === endPos.row && startPos.column === endPos.column) {
          let field = Object.assign(
            {},
            this.fields[startPos.row][startPos.column]
          );

          this.toggleField(field);
        } else {
          if (this.fields[startPos.row][startPos.column]?.occupyingUnit) {
            /**
             * Particle can only move in straight lines like '+' (correct), not diagonal like 'x' (not correct).
             */
            const existingAndCorrect = this.accessibleNeighbors.find(
              (f: Field) =>
                f.pos.row === endPos?.row && f.pos.column === endPos?.column
            );

            /**
             * Without this condition we can move Particles any way we want.
             */
            if (existingAndCorrect) {
              this.store.dispatch(
                moveParticleFromTo({ pos: startPos, newPos: endPos })
              );
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
    console.log('onMouseDown', event);

    let startPos = null;

    [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
      const rect: DOMRect = t.nativeElement.getBoundingClientRect();

      if (this.inRectBoundries(rect, event.x, event.y)) {
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
              const fields = data.accessibleToMove.map((a) => a.field);
              this.accessibleNeighbors = fields;
              if (this.fields[startPos.row][startPos.column]?.occupyingUnit) {
                this.store.dispatch(
                  setFieldsHighlightTrue({ fieldsToHighLight: fields })
                );
              }
            });
        }
      }
    });
  }

  moveParticle(event) {
    const mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };

    this.moveTo = {
      startPoint: mousePosition,
      boundinBox: {
        top: mousePosition.y,
        left: mousePosition.x,
        width: 0,
        height: 0,
      },
    };
  }

  toggleField(field) {
    // 0 - empty, 1 - obsticle, 2 - particle
    switch (field.mode) {
      case 0:
        this.boardService.setFieldObsticle(field.pos);
        break;
      case 1:
        const unit: ParticleUnit = new ParticleUnit(
          'puniton-0',
          field.pos,
          'blue',
          'punitons'
        );
        this.boardService.addNewParticle(unit);

        break;
      case 2:
        this.boardService.deleteUnit(field.pos);
        break;
    }
  }

  addBroodOnContextmenu(event) {
    let startPos: FieldPos = null;

    [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
      const rect: DOMRect = t.nativeElement.getBoundingClientRect();

      if (this.inRectBoundries(rect, event.x, event.y)) {
        startPos = {
          row: Math.floor(i / BOARD_DIMENSIONS),
          column: i % BOARD_DIMENSIONS,
        };
      }
    });

    let rndId = `eviton-${getRandom(1000)}`;
    this.boardService.addNewBroodOnContextmenu(rndId, startPos, 'red');
  }
}
