import { Injectable } from '@angular/core';
import { BoardDynamicCSS } from '../board/types-interfaces';
import * as HELPERS from './../board/board.helpers';

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
