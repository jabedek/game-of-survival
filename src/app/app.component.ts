import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { initFields } from './board/board.actions';
import {
  BOARD_DIMENSIONS,
  BOARD_DIMENSIONS_X,
  FIELD_SIZE,
} from './board/board.constants';
import { GameService } from './game/game.service';
import { ParticleUnit } from './shared/models';
import { AppState, Field, Fields } from './shared/types-interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  boardDimensions: number;
  fieldSize: number;

  broodSpaces$: Observable<any[]> = null;

  particleUnits: ParticleUnit[] = null;

  constructor(public store: Store<AppState>, public game: GameService) {
    this.initBoard();
    this.broodSpaces$ = this.game.broodSpaces$;
    this.startGame();
  }

  initBoard() {
    this.boardDimensions = this.game.boardDimensions;
    this.fieldSize = this.game.fieldSize;
    const fields = this.game.initFieldsData();
    this.store.dispatch(initFields({ fields }));
  }

  startGame() {
    if (this.game.fields) {
      this.game.startGame();
    }
  }
}
