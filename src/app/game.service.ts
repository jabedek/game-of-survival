import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BoardService } from './board/board.service';
import { BroodsService } from './board/broods.service';
import { AppState, Brood, Field, Fields } from './shared/types-interfaces';

import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  broodsList$: Observable<Brood[]> = this.broodsService.getBroodsOnBoard$();
  emptyFields$: Observable<Field[]> = this.boardService.getEmptyFields$();
  allFields$: Observable<Fields> = this.boardService.getAllFields$();

  constructor(
    public store: Store<AppState>,
    public boardService: BoardService,
    public broodsService: BroodsService
  ) {}

  launchBroodTurns() {
    Promise.all([
      this.broodsList$.toPromise(),
      this.emptyFields$.toPromise(),
      this.allFields$.toPromise(),
    ]).then((value) => {
      // console.log(value);
    });
  }
}
