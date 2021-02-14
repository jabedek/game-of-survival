import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  AppState,
  BoardDynamicCSS,
  FieldReference,
  Fields,
  Unit,
  FieldPos,
} from 'src/app/shared/types-interfaces';
import { setFieldObsticle, setFieldParticle } from '../board.actions';
import { BOARD_DIMENSIONS, FIELD_SIZE } from '../board.constants';
import { BoardService } from '../board.service';

@Component({
  selector: 'app-board-container',
  templateUrl: './board-container.component.html',
  styleUrls: ['./board-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardContainerComponent implements OnInit {
  // ### Fields related to dynamic stylings and sizings
  @Input() boardDimensions: number = null;
  @Input() fieldSize: number = null;
  @Input() fields: Fields = [];
  CSS: BoardDynamicCSS = null;

  @Output() setParticleEvent: EventEmitter<Unit> = new EventEmitter();
  @Output() setObsticleEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setEmptyEvent: EventEmitter<FieldPos> = new EventEmitter();

  // ### Board-Fields structure management
  fieldDimensions: Fields = [];

  // ### Functional flags
  borderObsticlesUp = false;

  constructor(public service: BoardService, public store: Store<AppState>) {}

  ngOnInit(): void {
    this.initBoardWithStylings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.boardDimensions || changes?.fieldSize) {
      this.initBoardWithStylings();
    }
  }

  private initBoardWithStylings() {
    this.CSS = this.service.getStylingsDetails(
      this.boardDimensions,
      this.fieldSize
    );
  }
}
