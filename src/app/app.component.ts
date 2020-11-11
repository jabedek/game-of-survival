import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { initFields } from './board/board.actions';
import { BOARD_DIMENSIONS, BOARD_DIMENSIONS_X } from './board/board.constants';
import { AppState, Field, Fields } from './shared/types-interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'game-of-survival';

  constructor(public store: Store<AppState>) {
    this.initFieldsData();
  }

  private initFieldsData() {
    let fields: Fields = [];

    for (let column = 0; column < BOARD_DIMENSIONS; column++) {
      fields[column] = [];

      for (let row = 0; row < BOARD_DIMENSIONS; row++) {
        fields[column][row] = new Field({ column, row }, false);
      }
    }

    this.store.dispatch(initFields({ fields }));
  }
}
