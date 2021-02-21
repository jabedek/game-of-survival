import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import {
  AppState,
  Brood,
  Field,
  FieldMode,
  FieldPos,
  Fields,
  NeighborsRaport,
  ParticleUnit,
  Unit,
} from 'src/app/shared/types-interfaces';
import { selectBoardField, selectBoardFields } from '..';

import { setFieldParticle } from '../board.actions';
import { BroodsService } from '../broods.service';
import { BoardService } from '../board.service';
import { BOARD_DIMENSIONS, FIELD_SIZE } from '../board.constants';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent implements OnInit, OnDestroy {
  // From Particle:

  CSSsize = FIELD_SIZE * 0.8;
  @Input() fieldPos: FieldPos;

  @Input() isColor: 'blue' | 'red' | 'green' = 'blue';
  @Input() particleUnit: ParticleUnit;
  turnDone = false;
  subscriptionNeighbors: Subscription = new Subscription();
  neighbors$: Observable<NeighborsRaport>;
  broodInfo: Brood = null;

  neighbors: NeighborsRaport = null;

  ////
  @Input() pos: FieldPos;
  @Input() fieldSize: number;
  @Input() groupId?: string;
  @Input() displayPos = true;
  @Input() displayDetails = false;

  firstToggled = false;
  selfDetails$: Observable<Field>;
  selfDetails: Field = null;

  private CSS = {
    size: null,
  };
  private mode: FieldMode = 0;
  private subscription: Subscription = new Subscription();

  constructor(
    public store: Store<AppState>,
    public cdr: ChangeDetectorRef,
    public broodsService: BroodsService,
    public boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.CSS.size = this.fieldSize;

    this.selfDetails$ = this.store.select(selectBoardField, this.pos);
    this.subscription.add(
      this.selfDetails$.subscribe((data: Field) => {
        this.selfDetails = data;

        if (data.blocked === true) {
          if (data.occupyingUnit?.pos) {
            this.mode = 2;
          } else {
            this.mode = 1;
          }
        } else {
          this.mode = 0;
        }
      })
    );
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
        this.boardService.deleteUnit(this.pos);
        break;
    }
  }

  addBroodOnContextmenu(event) {
    event.preventDefault();

    let rndId = `eriton-${Math.floor(Math.random() * 1000)}`;

    console.log('###', rndId);

    this.broodsService.addNewBroodOnContextmenu(rndId, this.pos, 'red');
    this.cdr.markForCheck();
  }
}
