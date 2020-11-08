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
// import {  } from '../board.actions';
import { Field } from '../board.models';

export interface FieldPos {
  x: number;
  y: number;
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

  @Input() displayPos = true;
  @Input() displayDetails = false;
  selfDetails$: Observable<Field>;

  @Output() toggleFieldBlockade: EventEmitter<FieldPos> = new EventEmitter();

  subscription: Subscription = new Subscription();

  @ViewChild('details', { read: TemplateRef }) details: TemplateRef<any>;
  constructor(public store: Store<AppState>) {}

  ngOnInit(): void {
    this.selfDetails$ = this.store.select(selectBoardField, this.pos);
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log('changes');
  }
  ngAfterViewInit() {
    this.selfDetails$.subscribe((data) => console.log(data));
  }

  toggleBlockade() {
    this.toggleFieldBlockade.emit(this.pos);

    // this.store.dispatch(updateField({ property: blocked, pos: this.pos }));
  }
}
