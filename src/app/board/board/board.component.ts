import {
  AfterViewInit,
  ChangeDetectionStrategy,
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
import { BoardService } from '../board.service';
import { Field, FieldPos } from '../field/field.types';
import { Unit } from '../board.types';
import { BoardFields } from './board.types';
import { BoardDynamicCSS } from 'src/app/ui/ui.types';
import { fromEvent, Subject } from 'rxjs';
import {
  tap,
  share,
  switchMap,
  filter,
  takeUntil,
  auditTime,
  withLatestFrom,
  map,
} from 'rxjs/operators';
import { moveParticleFromTo } from '../board.actions';
import { BOARD_DIMENSIONS } from '../board.constants';
import { selectFieldNeighbors } from '../board.selectors';

const AUDIT_TIME = 16;

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldsComponent implements OnInit, OnDestroy, AfterViewInit {
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
  @ViewChildren('fieldsRefs') fieldsRefs;
  dragStart;
  moveTo;
  // ### Functional flags
  borderObsticlesUp = false;
  refs: ElementRef[] = null;
  posStart = null;
  constructor(
    public store: Store<RootState>,
    public boardService: BoardService,
    private uiService: UIService,
    private ngZone: NgZone,
    private host: ElementRef
  ) {}

  ngOnInit(): void {
    this.hostRect = (this.host
      .nativeElement as Element).getBoundingClientRect();

    this.initBoardWithStylings();
    this.observeMouseMove();
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
      console.log(
        rect,
        x,
        y,
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    }
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  onMouseUp(event) {
    let startPos = null;
    let endPos = null;

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

      console.log(startPos, endPos);

      if (startPos && endPos) {
        this.store.dispatch(
          moveParticleFromTo({ pos: startPos, newPos: endPos })
        );
      }

      this.dragStart = null;
      this.posStart = null;
    }
  }

  onMouseDown(event) {
    console.log('onMouseDown');

    let startPos = null;

    [...(this.fieldsTemplates as any).toArray()].forEach((t, i) => {
      const rect: DOMRect = t.nativeElement.getBoundingClientRect();

      if (this.inRectBoundries(rect, event.x, event.y)) {
        startPos = {
          row: Math.floor(i / BOARD_DIMENSIONS),
          column: i % BOARD_DIMENSIONS,
        };

        if (!!this.fields[startPos.row][startPos.column]?.occupyingUnit?.id) {
          this.dragStart = (event.target as Element).getBoundingClientRect();
          this.posStart = { x: event.x, y: event.y };
          this.store
            .select(selectFieldNeighbors, startPos)
            .subscribe((data) => {
              console.log(data);

              // data.accessible
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
}
