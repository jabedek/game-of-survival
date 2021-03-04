import { BoardState } from './board/board/board.types';
import { GameState } from './game/game.types';
import { UIState } from './ui/ui.types';

export interface RootState {
  board: BoardState;
  game: GameState;
  ui: UIState;
}
