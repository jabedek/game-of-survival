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
import { RootState } from 'src/app/root-state';

import { BoardService } from '../board.service';
import {
  BoardDynamicCSS,
  Field,
  FieldPos,
  Fields,
  Unit,
} from '../types-interfaces';

@Component({
  selector: 'app-board-container',
  templateUrl: './board-container.component.html',
  styleUrls: ['./board-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardContainerComponent implements OnInit {
  @Input() boardDimensions: number = null;
  @Input() fieldSize: number = null;
  @Input() fields: Fields = [];
  CSS: BoardDynamicCSS = null;

  @Output() setParticleEvent: EventEmitter<Unit> = new EventEmitter();
  @Output() setObsticleEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setEmptyEvent: EventEmitter<FieldPos> = new EventEmitter();

  // ### Functional flags
  borderObsticlesUp = false;

  constructor(public service: BoardService, public store: Store<RootState>) {}

  ngOnInit(): void {
    this.initBoardWithStylings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.boardDimensions || changes?.fieldSize) {
      this.initBoardWithStylings();
    }
  }

  trackByFn(_, item: Field) {
    return `${item.pos.row}${item.pos.column}`;
  }

  private initBoardWithStylings() {
    this.CSS = this.service.getStylingsDetails(
      this.boardDimensions,
      this.fieldSize
    );
  }
}
