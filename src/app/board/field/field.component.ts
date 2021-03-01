import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { fromEvent, Observable, Subject, Subscription } from 'rxjs';

import { selectBoardFieldInfo } from '../board.selectors';

import { BoardService } from '../board.service';
import { FIELD_SIZE } from '../board.constants';
import { getRandom } from 'src/app/shared/helpers';
import { Brood, ParticleUnit } from '../board.types';
import { RootState } from 'src/app/root-state';
import { FieldInfo, FieldMode, FieldPos } from './field.types';
import {
  auditTime,
  filter,
  map,
  share,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

const AUDIT_TIME = 16;
@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  CSSsize = FIELD_SIZE * 0.8;
  @Input() fieldPos: FieldPos;

  @Input() isColor: 'blue' | 'red' | 'green' = 'blue';
  @Input() particleUnit: ParticleUnit;
  turnDone = false;
  subscriptionNeighbors: Subscription = new Subscription();
  // neighbors$: Observable<NeighborsRaport>;
  broodInfo: Brood = null;

  // neighbors: NeighborsRaport = null;
  occupyingUnit = null;
  @Input() pos: FieldPos;
  @Input() fieldSize: number;
  @Input() groupId?: string;
  @Input() displayPos = true;
  @Input() displayDetails = true;

  firstToggled = false;
  selfDetails$: Observable<FieldInfo>;
  selfDetails: FieldInfo = null;

  private destroy = new Subject<void>();
  private CSS = {
    size: null,
  };
  private mode: FieldMode = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    public store: Store<RootState>,
    public cdr: ChangeDetectorRef,
    public boardService: BoardService,
    private host: ElementRef,

    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // this.neighbors$ = this.store.select(selectFieldNeighbors, this.pos);
    // console.log(this.host);

    this.CSS.size = this.fieldSize;

    this.selfDetails$ = this.store.select(selectBoardFieldInfo, this.pos);
    this.subscription.add(
      this.selfDetails$.subscribe((data: FieldInfo) => {
        this.selfDetails = data;
        if (data.fieldDetails.blocked === true) {
          if (data.fieldDetails.occupyingUnit?.pos) {
            this.occupyingUnit = data.fieldDetails.occupyingUnit;

            this.mode = 2;
          } else {
            this.occupyingUnit = false;
            this.mode = 1;
          }
        } else {
          this.occupyingUnit = false;
          this.mode = 0;
        }
      })
    );

    // this.observeMouseMove();
  }
  ngAfterViewInit() {
    // if (this.occupyingUnit) {
    //   this.subscriptionNeighbors.add(
    //     this.neighbors$.subscribe((data: FieldInfo) => {
    //       this.neighbors = data;
    //     })
    //   );
    // }
  }

  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscriptionNeighbors.unsubscribe();
    this.destroy.next();
    this.destroy.complete();
  }

  toggleSelf() {
    switch (this.mode) {
      case 0:
        this.mode = 1;
        this.boardService.setFieldObsticle(this.pos);
        break;
      case 1:
        const unit: ParticleUnit = new ParticleUnit(
          'puniton-0',
          this.pos,
          'blue',
          'punitons'
        );
        this.mode = 2;
        this.boardService.addNewParticle(unit);

        break;
      case 2:
        this.mode = 0;
        this.subscriptionNeighbors.unsubscribe();

        this.boardService.deleteUnit(this.pos);
        break;
    }
  }

  addBroodOnContextmenu(event) {
    event.preventDefault();

    let rndId = `eviton-${getRandom(1000)}`;

    this.boardService.addNewBroodOnContextmenu(rndId, this.pos, 'red');
    this.cdr.markForCheck();
  }

  /**
   * Observe mouse action (move, up, down)
   */
  private observeMouseMove() {
    this.ngZone.runOutsideAngular(() => {
      const mousemove$ = fromEvent<MouseEvent>(window, 'mousemove');

      const mouseup$ = fromEvent<MouseEvent>(window, 'mouseup').pipe(
        tap(() => this.onMouseUp()),
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

  onMouseUp() {
    console.log('onMouseUp');
  }
  onMouseDown(event) {
    console.log('onMouseDown');

    const el = event.target as Element;
    console.dir(el);
    const elBox = el.getBoundingClientRect();
    console.log(elBox);
  }

  moveParticle(event) {
    const rect = (event.target as Element).getBoundingClientRect();
    // console.log('moveParticle');
    // console.log(rect);

    console.log(rect.bottom - rect.top);
    const mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
    // cons

    const moveTo = {
      startPoint: mousePosition,
      boundinBox: {
        top: mousePosition.y,
        left: mousePosition.x,
        width: 0,
        height: 0,
      },
    };

    console.log(moveTo);
  }
}
