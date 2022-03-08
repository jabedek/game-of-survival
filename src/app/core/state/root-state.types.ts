import { GameState } from '@/src/app/shared/types/game.types';
import { UIState } from '@/src/app/shared/types/ui.types';
import { BoardFields } from '@/src/app/shared/types/board/board.types';
import { Brood } from '@/src/app/shared/types/board/brood.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';

export interface RootState {
  board: BoardState;
  game: GameState;
  ui: UIState;
}

export interface BoardState {
  fields: BoardFields;
  unitsList: Unit[];
  broodsList: Brood[];
  builderMode: boolean;
}
