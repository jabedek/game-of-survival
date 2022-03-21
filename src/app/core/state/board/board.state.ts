import { BoardFields } from '@/src/app/shared/types/board/board.types';
import { Group } from '@/src/app/shared/types/board/group.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';

export interface BoardState {
  fields: BoardFields;
  unitsList: Unit[];
  groupsList: Group[];
  builderMode: boolean;
}
