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
import { UIService } from 'src/app/ui/ui.service';
import { BoardService } from '../board.service';

import {
  BoardDynamicCSS,
  Field,
  FieldPos,
  Fields,
  Unit,
} from '../types-interfaces';

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldsComponent implements OnInit {
  @Input() boardDimensions: number = null;
  @Input() fieldSize: number = null;
  @Input() fields: Fields = [];
  CSS: BoardDynamicCSS = null;

  @Output() setParticleEvent: EventEmitter<Unit> = new EventEmitter();
  @Output() setObsticleEvent: EventEmitter<FieldPos> = new EventEmitter();
  @Output() setEmptyEvent: EventEmitter<FieldPos> = new EventEmitter();

  // ### Functional flags
  borderObsticlesUp = false;

  constructor(
    public store: Store<RootState>,
    public boardService: BoardService,
    private uiService: UIService
  ) {}

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
    this.CSS = this.uiService.getStylingsDetails(
      this.boardDimensions,
      this.fieldSize
    );
  }
}
