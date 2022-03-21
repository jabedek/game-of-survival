import { BoardState } from './board/board.state';
import { GameState } from './game/game.state';
import { UIState } from './ui/ui.state';

export interface RootState {
  board: BoardState;
  game: GameState;
  ui: UIState;
}
