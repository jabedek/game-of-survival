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
    console.log('changes');
  }
  ngAfterViewInit() {}

  toggleBlockade() {
    this.mode = 1;

    this.toggleFieldBlockade.emit(this.pos);
  }

  beginTurn() {
    this.subscriptionNeighbors.add(
      this.subscribeNeighbors().subscribe((data: NeighborField[]) => {
        const neighborsData = this.getNeighborsData(data);
        // console.log(neighborsData);

        console.log(
          `${this.pos.x}:${this.pos.y} here.\n`,
          `I have got ${neighborsData.availableFields.length} available fields to move to.`,
          `I have got ${neighborsData.neighborBlockades.length} blockades around me, including ${neighborsData.neighborUnits.length} other creatures.`
        );
      })
    );
  }

  fieldUnblock() {
    this.mode = 0;
    this.subscriptionNeighbors.unsubscribe();
    this.setFieldUnblocked.emit(this.pos);
  }

  setOccupyingUnit(unitName: string) {
    this.mode = 2;
    this.beginTurn();

    const unit: Unit = {
      pos: this.pos,
      unitName,
      broodName: 'idk',
    };
    // console.log(unit);

    this.setFieldOccupyingUnit.emit(unit);
  }

  subscribeNeighbors() {
    const switchedPos = { x: this.pos.y, y: this.pos.x };

    return this.store.select(selectUnitNeighborFieldsData, switchedPos);
  }

  private getNeighborsData(data: NeighborField[]) {
    let neighborBlockades = [];
    let neighborUnits = [];
    let availableFields = [];

    [...data].forEach((neighbor) => {
      if (neighbor.field !== null) {
        if (neighbor.field.blocked === true) {
          neighborBlockades.push(neighbor);

          if (neighbor.field.occupyingUnit) {
            neighborUnits.push(neighbor);
          }
        } else {
          availableFields.push(neighbor);
        }
      }
    });

    let stringData =
      '[all blockades]: ' +
      neighborBlockades.length +
      ' [units]: ' +
      neighborUnits.length +
      ' [available spots]: ' +
      availableFields.length;

    // console.log(stringData);
    return { neighborBlockades, neighborUnits, availableFields };
  }

  toggleSelf(): boolean {
    // console.log('x:', this.pos.y, 'y:', this.pos.x);

    if (!this.firstToggled) {
      this.firstToggled = true;
      // this.subscribeNeighbors();

      this.subscriptionNeighbors.add(
        this.subscribeNeighbors().subscribe((data: NeighborField[]) => {
          const neighborsData = this.getNeighborsData(data);
          // console.log(neighborsData);
        })
      );
    }

    if (this.mode === 0) {
      this.toggleBlockade();

      return true;
    }

    if (this.mode === 1) {
      this.setOccupyingUnit('mouse-jumper');

      return true;
    }

    if (this.mode === 2) {
      // this.subscriptionNeighbors.unsubscribe();
      // this.subscription.unsubscribe();
      this.fieldUnblock();

      return true;
    }
  }
}
