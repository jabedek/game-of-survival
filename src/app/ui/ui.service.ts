import { Injectable } from '@angular/core';
import * as HELPERS from './../board/board/board.helpers';
import { BoardDynamicCSS } from './ui.types';

@Injectable({
  providedIn: 'root',
})
export class UIService {
  constructor() {}

  getStylingsDetails(
    boardDimensions: number,
    fieldSize: number
  ): BoardDynamicCSS {
    return {
      sizings: HELPERS.getPxSizings(boardDimensions, fieldSize),
      structurings: HELPERS.getBoardLayoutStructurings(
        boardDimensions,
        fieldSize
      ),
    };
  }
}
