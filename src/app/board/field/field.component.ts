import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import {
  AppState,
  Field,
  FieldMode,
  FieldPos,
  Fields,
  ParticleUnit,
  Unit,
} from 'src/app/shared/types-interfaces';
import { selectBoardField, selectBoardFields, selectFieldNeighbors } from '..';
import { FIELD_SIZE } from '../board.constants';
import * as uuid from 'uuid';
import {
  removeUnitFromBrood,
  setFieldEmpty,
  setFieldObsticle,
  setFieldParticle,
} from '../board.actions';
import { BroodsService } from '../broods.service';
import { Event } from '@angular/router';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() pos: FieldPos;
  @Input() fieldSize: number;
  @Input() groupId?: string;

  CSS = {
    size: null,
  };

  mode: FieldMode = 0;
  fields$: Observable<Fields> = this.store.select(selectBoardFields);

  firstToggled = false;

  @Input() displayPos = true;
  @Input() displayDetails = false;
  selfDetails$: Observable<Field>;
  // neighbors$: Observable<NeighborsRaport>;

  @Output() setObsticleEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setEmptyEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setParticleEvent: EventEmitter<Unit> = new EventEmitter();

  subscription: Subscription = new Subscription();
  // subscriptionNeighbors: Subscription = new Subscription();

  @ViewChild('details', { read: TemplateRef }) details: TemplateRef<any>;
  constructor(
    public store: Store<AppState>,
    public cdr: ChangeDetectorRef,
    public broodsService: BroodsService
  ) {}

  ngOnInit(): void {
    // this.cdr.detach();
    // this.cdr.detectChanges();
    this.CSS.size = this.fieldSize;
    // this.neighbors$ = this.store.select(selectFieldNeighbors, this.pos);

    this.selfDetails$ = this.store.select(selectBoardField, this.pos);

    this.subscription.add(
      this.selfDetails$.subscribe((data: Field) => {
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
  ngOnChanges(changes: SimpleChanges) {}
  ngAfterViewInit() {}

  ngOnDestroy() {
    // this.subscriptionNeighbors.unsubscribe();
    this.subscription.unsubscribe();
  }
  toggleSelf(): boolean {
    if (this.mode === 0) {
      this.setObsticle();
      return true;
    }

    if (this.mode === 1) {
      this.setParticle('unit-id');
      return true;
    }

    if (this.mode === 2) {
      this.setEmpty();
      return false;
    }
  }

  addBrood(event) {
    event.preventDefault();
    this.broodsService.addNewBroodOnContextmenu('eritons', this.pos, 'red');
    this.cdr.markForCheck();
  }

  // private beginTurn() {
  //   this.subscriptionNeighbors.add(
  //     this.neighbors$.subscribe((data) => {
  //       console.log(data);
  //     })
  //   );
  // }

  private setParticle(id: string, groupId?: string): void {
    const unit: ParticleUnit = new ParticleUnit(
      id || 'puniton-0',
      this.pos,
      'blue',
      groupId || this.groupId || 'punitons'
    );

    this.mode = 2;

    this.store.dispatch(setFieldParticle({ unit }));
  }

  private setObsticle() {
    this.mode = 1;
    this.store.dispatch(setFieldObsticle({ pos: this.pos }));
  }

  private setEmpty(): void {
    this.mode = 0;
    this.store.dispatch(setFieldEmpty({ pos: this.pos }));
    this.store.dispatch(removeUnitFromBrood({ pos: this.pos }));
  }
}
