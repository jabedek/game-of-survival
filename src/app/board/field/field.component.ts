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
import { setFieldEmpty } from '../board.actions';

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
  neighbors$: Observable<NeighborsRaport>;

  @Output() setObsticleEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setEmptyEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setParticleEvent: EventEmitter<Unit> = new EventEmitter();

  subscription: Subscription = new Subscription();
  subscriptionNeighbors: Subscription = new Subscription();

  @ViewChild('details', { read: TemplateRef }) details: TemplateRef<any>;
  constructor(public store: Store<AppState>, public cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // console.log(this.pos);

    this.CSS.size = this.fieldSize;
    this.neighbors$ = this.store.select(selectFieldNeighbors, this.pos);

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
    this.subscriptionNeighbors.unsubscribe();
    this.subscription.unsubscribe();
  }
  toggleSelf(): boolean {
    console.log('clicked:', this.pos);

    // console.log('from:', this.mode, 'to:', this.mode + 1);

    if (this.mode === 0) {
      this.setObsticle();
      return true;
    }

    if (this.mode === 1) {
      this.setParticle('unit-id', 'unit-group-id');
      this.beginTurn();
      return true;
    }

    if (this.mode === 2) {
      this.setEmpty();
      return false;
    }
  }

  private beginTurn() {
    this.subscriptionNeighbors.add(
      this.neighbors$.subscribe((data) => {
        console.log(data);
      })
    );

    // this.fields$.subscribe((data) => {
    //   // stuff.getNgh2(data, this.pos);
    // })

    // this.store
    //   .select(selectFieldNeighbors, this.pos)
    //   .subscribe((data: NeighborField[]) => {
    //     console.log(data);

    //     // const neighborsData = this.getNeighborsData(data, this.pos);

    //     // console.info(neighborsData);
    //     // console.log(stuff.getNgh2());

    //     // console.log(
    //     //   `${this.pos.column}:${this.pos.row} here.\n`,
    //     //   `I have got ${neighborsData.neighborBlockades.length} blockades around me, including ${neighborsData.neighborUnits.length} other creatures.`,
    //     //   `I have got ${neighborsData.availableFields.length} available fields to move to.`
    //     // );
    //   })
  }

  private getNeighborsData(data: NeighborField[], pos: FieldPos) {
    let neighborObsticles = [];
    let neighborUnits = [];
    let availableFields = [];

    let neighborBroodMembers = [];
    let neighborAliens = [];

    this.selfDetails$.subscribe((fieldData) => {
      [...data].forEach((neighbor) => {
        const { field } = neighbor;

        if (neighbor.field !== null) {
          if (field.blocked === true) {
            if (field?.occupyingUnit) {
              neighborUnits.push(neighbor);
              if (
                fieldData.occupyingUnit &&
                field?.occupyingUnit.groupId === fieldData.occupyingUnit.groupId
              ) {
                // console.log('friend');
                neighborBroodMembers.push(neighbor);
              } else {
                // console.log('enemy');
                neighborAliens.push(neighbor);
              }
            } else {
              neighborObsticles.push(neighbor);
            }
          } else {
            availableFields.push(neighbor);
          }
        }
      });
    });

    let stringData =
      '[pos]: ' +
      pos.column +
      ':' +
      pos.row +
      '\n[available spots]: ' +
      availableFields.length +
      '\n[all blockades]: ' +
      (neighborAliens.length +
        neighborBroodMembers.length +
        neighborObsticles.length) +
      '\n - obsticles: ' +
      neighborObsticles.length +
      '\n - friendly units: ' +
      neighborBroodMembers.length +
      '\n - enemy units: ' +
      neighborAliens.length;
    console.log(stringData);
    return { neighborObsticles, neighborUnits, availableFields };
  }

  private setParticle(name: string, groupId?: string): void {
    const unit: Unit = {
      id: uuid.v4(),
      pos: this.pos,
      name,
      groupId: groupId || 'dunnos',
    };

    this.mode = 2;

    this.setParticleEvent.emit(unit);
  }

  private setObsticle() {
    console.log(this.pos);

    this.mode = 1;
    this.setObsticleEvent.emit(this.pos);
  }

  private setEmpty(): void {
    this.subscriptionNeighbors.unsubscribe();
    this.mode = 0;
    this.setEmptyEvent.emit(this.pos);
  }
}
