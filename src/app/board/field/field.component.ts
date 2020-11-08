import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { AppState } from 'src/app/shared/AppState';
import { selectBoardField, selectUnitNeighborFieldsData } from '..';
import { Unit } from '../board.constants';
// import {  } from '../board.actions';
import { Field } from '../board.models';
import { NeighborField } from '../index';

export interface FieldPos {
  x: number | string;
  y: number | string;
}

export interface FieldPropertyUpdateDetails {
  pos: FieldPos;
  property: { [key: string]: any };
}

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() CSSsize: string;
  @Input() pos: FieldPos;

  mode: 0 | 1 | 2 = 0;

  // 0 - available to move
  // 1 - blocked by some kind of permanent obsticle
  // 2 - occupied by creature

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
          this.beginTurn();
        }
      })
    );
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log('changes');
  }
  ngAfterViewInit() {}

  toggleBlockade() {
    this.mode = 1;

    this.toggleFieldBlockade.emit(this.pos);
  }

  beginTurn() {
    const switchedPos = { x: this.pos.y, y: this.pos.x };
    this.subscriptionNeighbors.add(
      this.store
        .select(selectUnitNeighborFieldsData, switchedPos)
        .subscribe((data: NeighborField[]) => {
          const neighborsData = this.getNeighborsData(data, this.pos);

          // console.log(
          //   `${this.pos.x}:${this.pos.y} here.\n`,
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

  addOccupyingUnit(unitName: string, broodName?: string) {
    // this.mode = 2;
    this.beginTurn();

    const unit: Unit = {
      pos: this.pos,
      unitName,
      broodName: broodName || 'dunnos',
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
                field?.occupyingUnit.broodName ===
                  fieldData.occupyingUnit.broodName
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
      pos.x +
      ':' +
      pos.y +
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
