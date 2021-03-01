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

import { selectBoardFieldInfo, selectBuilderMode } from '../board.selectors';

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

  @Input() highlightAccess = false;

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

  builderMode$: Observable<boolean> = null;
  builderMode = false;

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
    this.CSS.size = this.fieldSize;
    this.selfDetails$ = this.store.select(selectBoardFieldInfo, this.pos);

    this.subscription.add(
      this.store.select(selectBuilderMode).subscribe((data) => {
        this.builderMode = data;
      })
    );

    // this.observeMouseMove();
  }
  ngAfterViewInit() {
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
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.highlightAccess) {
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscriptionNeighbors.unsubscribe();
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
}
