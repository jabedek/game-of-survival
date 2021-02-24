import { combineReducers } from '@ngrx/store';
import { reducer as boardReducer } from './board/board.reducer';
import { reducer as gameReducer } from './game/game.reducer';

export const rootReducer = combineReducers({
  board: boardReducer,
  game: gameReducer,
});
