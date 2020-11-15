import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
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
  Unit,
} from 'src/app/shared/types-interfaces';
import { selectBoardField, selectUnitNeighborFieldsData } from '..';
import { FIELD_SIZE } from '../board.constants';
import { NeighborField } from '../index';
import * as uuid from 'uuid';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() pos: FieldPos;
  @Input() fieldSize: FieldPos;
  // @Input() CSSsize: string;

  CSSsize; //= FIELD_SIZE;

  mode: FieldMode = 0;

  firstToggled = false;

  @Input() displayPos = true;
  @Input() displayDetails = false;
  selfDetails$: Observable<Field>;
  neighbors$: Observable<Field[]>;

  @Output() toggleFieldBlockade: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setFieldUnblocked: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setFieldOccupyingUnit: EventEmitter<Unit> = new EventEmitter();

  subscription: Subscription = new Subscription();
  subscriptionNeighbors: Subscription = new Subscription();

  @ViewChild('details', { read: TemplateRef }) details: TemplateRef<any>;
  constructor(public store: Store<AppState>) {}

  ngOnInit(): void {
    // console.log(this.pos);

    this.CSSsize = this.fieldSize;
    this.selfDetails$ = this.store.select(selectBoardField, this.pos);
    // this.neighbors$ = this.store.select(selectUnitNeighborFieldsData, this.pos);

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

        if (this.mode === 2) {
          // #### IT IS WORKING CODE BUT NOT FOR CONSTANS USE - MEMORY LEAKS
          // this.beginTurn();
        }
      })
    );
  }
  ngOnChanges(changes: SimpleChanges) {}
  ngAfterViewInit() {}

  toggleBlockade() {
    this.mode = 1;

    this.toggleFieldBlockade.emit(this.pos);
  }

  beginTurn() {
    this.subscriptionNeighbors.add(
      this.store
        .select(selectUnitNeighborFieldsData, this.pos)
        .subscribe((data: NeighborField[]) => {
          const neighborsData = this.getNeighborsData(data, this.pos);

          // console.log(
          //   `${this.pos.column}:${this.pos.row} here.\n`,
          //   `I have got ${neighborsData.neighborBlockades.length} blockades around me, including ${neighborsData.neighborUnits.length} other creatures.`,
          //   `I have got ${neighborsData.availableFields.length} available fields to move to.`
          // );
        })
    );
  }

  fieldUnblock() {
    this.subscriptionNeighbors.unsubscribe();
    this.mode = 0;
    this.setFieldUnblocked.emit(this.pos);
  }

  addOccupyingUnit(name: string, broodId?: string) {
    // this.mode = 2;

    // #### IT IS WORKING CODE BUT NOT FOR CONSTANS USE - MEMORY LEAKS
    // this.beginTurn();

    const unit: Unit = {
      id: uuid.v4(),
      pos: this.pos,
      name,
      broodId: broodId || 'dunnos',
    };

    this.setFieldOccupyingUnit.emit(unit);
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
                field?.occupyingUnit.broodId === fieldData.occupyingUnit.broodId
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

  toggleSelf(): boolean {
    // if (!this.firstToggled) {
    //   this.firstToggled = true;

    //   this.subscriptionNeighbors.add(
    //     this.subscribeNeighbors().subscribe((data: NeighborField[]) => {
    //       const neighborsData = this.getNeighborsData(data);
    //     })
    //   );
    // }

    if (this.mode === 0) {
      this.toggleBlockade();
      return true;
    }

    if (this.mode === 1) {
      this.addOccupyingUnit('mouse-jumper', 'pappals');
      return true;
    }

    if (this.mode === 2) {
      this.fieldUnblock();
      return false;
    }
  }
}
