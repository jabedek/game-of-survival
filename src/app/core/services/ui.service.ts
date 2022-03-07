import { Injectable } from '@angular/core';
import * as HELPERS from '../../shared/helpers/ui.helpers';
import { BoardDynamicCSS } from '../../shared/types/ui.types';
import { CoreModule } from '../core.module';

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
