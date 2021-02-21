import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import {
  AppState,
  Brood,
  Field,
  FieldMode,
  FieldPos,
  NeighborsRaport,
  ParticleUnit,
} from 'src/app/shared/types-interfaces';
import { selectBoardField, selectFieldNeighbors } from '..';

import { BoardService } from '../board.service';
import { FIELD_SIZE } from '../board.constants';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent
  implements OnInit, OnDestroy, OnChanges, AfterViewInit {
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
  occupyingUnit = null;
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
    public boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.neighbors$ = this.store.select(selectFieldNeighbors, this.pos);

    this.CSS.size = this.fieldSize;

    this.selfDetails$ = this.store.select(selectBoardField, this.pos);
    this.subscription.add(
      this.selfDetails$.subscribe((data: Field) => {
        this.selfDetails = data;

        if (data.blocked === true) {
          if (data.occupyingUnit?.pos) {
            this.occupyingUnit = data.occupyingUnit;

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
  ngAfterViewInit() {
    if (this.occupyingUnit) {
      console.log('ngAfterViewInit');
      this.subscriptionNeighbors.add(
        this.neighbors$.subscribe((data) => {
          console.log(data);
          this.neighbors = data;
        })
      );
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
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

    let rndId = `eriton-${Math.floor(Math.random() * 1000)}`;

    console.log('###', rndId);

    this.boardService.addNewBroodOnContextmenu(rndId, this.pos, 'red');
    this.cdr.markForCheck();
  }
}
