import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectBoardFields } from 'src/app/board';
import { FIELD_SIZE } from 'src/app/board/board.constants';
import { BoardService } from 'src/app/board/board.service';
import { AppState, FieldPos, Fields } from 'src/app/shared/types-interfaces';

@Component({
  selector: 'app-obsticle',
  templateUrl: './obsticle.component.html',
  styleUrls: ['./obsticle.component.scss'],
})
export class ObsticleComponent implements OnInit {
  CSSsize = FIELD_SIZE * 0.8;
  fields$: Observable<Fields> = this.store.select(selectBoardFields);

  @Input() fieldPos: FieldPos;
  @Input() row: number;
  @Input() column: number;
  constructor(public store: Store<AppState>, public service: BoardService) {}

  ngOnInit(): void {
    console.log(this.fieldPos);

    this.fields$.subscribe((data) => console.log(data));
  }
}
