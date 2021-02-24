import { BoardState } from './board/types-interfaces';
import { GameState } from './game/types-interfaces';
import { UIState } from './ui/types-interfaces';

export interface RootState {
  board: BoardState;
  game: GameState;
  ui: UIState;
}
