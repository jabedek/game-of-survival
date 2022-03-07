import { BoardState } from '@/src/app/shared/types/board.types';
import { GameState } from '@/src/app/shared/types/game.types';
import { UIState } from '@/src/app/shared/types/ui.types';

export interface RootState {
  board: BoardState;
  game: GameState;
  ui: UIState;
}
