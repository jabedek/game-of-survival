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
  Unit,
} from 'src/app/shared/types-interfaces';
import {
  NeighborsRaport,
  selectBoardField,
  selectBoardFields,
  selectFieldNeighbors,
} from '..';
import { FIELD_SIZE } from '../board.constants';
import { NeighborField } from '../index';
import * as uuid from 'uuid';
import {
  setFieldEmpty,
  setFieldObsticle,
  setFieldParticle,
} from '../board.actions';

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
  constructor(public store: Store<AppState>, public cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
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
  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
  }
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
      this.setParticle('unit-id', 'unit-group-id');
      return true;
    }

    if (this.mode === 2) {
      this.setEmpty();
      return false;
    }
  }

  // private beginTurn() {
  //   this.subscriptionNeighbors.add(
  //     this.neighbors$.subscribe((data) => {
  //       console.log(data);
  //     })
  //   );
  // }

  private setParticle(id: string, groupId?: string): void {
    const unit: Unit = {
      id: id || 'uniton-0',
      groupId: groupId || 'unitons',
      pos: this.pos,
    };

    this.mode = 2;

    this.store.dispatch(setFieldParticle({ unit }));
  }

  private setObsticle() {
    this.mode = 1;
    this.store.dispatch(setFieldObsticle({ pos: this.pos }));
  }

  private setEmpty(): void {
    // this.subscriptionNeighbors.unsubscribe();
    this.mode = 0;
    this.store.dispatch(setFieldEmpty({ pos: this.pos }));
  }
}
