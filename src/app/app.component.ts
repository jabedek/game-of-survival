import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { initFields } from './board/board.actions';
import {
  BOARD_DIMENSIONS,
  BOARD_DIMENSIONS_X,
  FIELD_SIZE,
} from './board/board.constants';
import { AppState, Field, Fields } from './shared/types-interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'game-of-survival';

  boardDimensions = BOARD_DIMENSIONS;
  fieldSize = FIELD_SIZE;

  constructor(public store: Store<AppState>) {
    this.initFieldsData();
  }

  private initFieldsData() {
    let fields: Fields = [];

    for (let row = 0; row < this.boardDimensions; row++) {
      fields[row] = [];

      for (let column = 0; column < this.boardDimensions; column++) {
        fields[row][column] = new Field({ column: row, row: column }, false);
      }
    }

    console.log(fields);

    this.store.dispatch(initFields({ fields }));
  }
}
