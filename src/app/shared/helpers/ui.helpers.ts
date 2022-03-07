import { BoardDynamicCSS_structurings } from '@/src/app/shared/types/ui.types';

export function getBoardSize_CSSpx(
  boardDimensions: number,
  fieldSize: number
): string {
  return `${boardDimensions * fieldSize}px`;
}

export function getFieldSize_CSSpx(fieldSize: number): string {
  return `${fieldSize}px`;
}

export function getPxSizings(boardDimensions: number, fieldSize: number) {
  return {
    boardSize_px: getBoardSize_CSSpx(boardDimensions, fieldSize),
    fieldSize_px: getFieldSize_CSSpx(fieldSize),
  };
}

export function getBoardLayoutStructurings(
  boardDimensions: number,
  fieldSize: number
): BoardDynamicCSS_structurings {
  return {
    display: 'grid',
    'grid-template-columns': `repeat(${boardDimensions}, ${getFieldSize_CSSpx(
      fieldSize
    )})`,
    'grid-template-rows': `repeat(${boardDimensions}, ${getFieldSize_CSSpx(
      fieldSize
    )})`,
    width: ` ${getBoardSize_CSSpx(boardDimensions, fieldSize)}`,
    height: ` ${getBoardSize_CSSpx(boardDimensions, fieldSize)}`,
  };
}
