import { Fields } from '../board/board.models';

export interface AppState {
  board: BoardState;
}

export interface BoardState {
  fields: [] | Fields;
}
