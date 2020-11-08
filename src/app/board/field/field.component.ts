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
import { selectBoardField } from '..';
import { Unit } from '../board.constants';
// import {  } from '../board.actions';
import { Field } from '../board.models';

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

  @Input() displayPos = true;
  @Input() displayDetails = false;
  selfDetails$: Observable<Field>;

  @Output() toggleFieldBlockade: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setFieldUnblocked: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setFieldOccupyingUnit: EventEmitter<Unit> = new EventEmitter();

  subscription: Subscription = new Subscription();

  @ViewChild('details', { read: TemplateRef }) details: TemplateRef<any>;
  constructor(public store: Store<AppState>) {}

  ngOnInit(): void {
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

  toggleBlockade() {
    this.mode = 1;

    this.toggleFieldBlockade.emit(this.pos);
  }

  fieldUnblock() {
    this.mode = 0;
    this.setFieldUnblocked.emit(this.pos);
  }

  setOccupyingUnit(unitName: string) {
    this.mode = 2;

    const unit: Unit = {
      pos: this.pos,

      unitName,
      broodName: 'idk',
    };
    this.setFieldOccupyingUnit.emit(unit);
  }

  toggleSelf(): boolean {
    //Initial mode state:
    //blocked: false; !occupyingUnit.pos

    if (this.mode === 0) {
      this.toggleBlockade();
      //New mode state: 1.
      //blocked: true; !occupyingUnit.pos
      return true;
    }

    if (this.mode === 1) {
      this.setOccupyingUnit('mouse-jumper');
      //New mode state: 2.
      //blocked: true; !!occupyingUnit.pos
      return true;
    }

    if (this.mode === 2) {
      this.fieldUnblock();
      //New mode state: 3.
      //back to initial state - blocked: false; !occupyingUnit.pos
      return true;
    }
  }
}

// 0 no click: field is set to mode 0 = [not blocked by anything]

// 1st click: previous/input mode 0 = [not blocked by anything].
//Action: toggleBlockade and set mode to 1 = [blocked].

// 2st click: previous/input mode 1 = [blocked].
// Action: toggleBlockade and set mode to 2  = [blocked by unit].

// 3rd click: previous/input mode 2 = [blocked by unit].
// Action: toggleBlockade and set mode to 0 = [not blocked by anything]
