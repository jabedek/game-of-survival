import { createSelector, props } from '@ngrx/store';
import { AppState, BoardState } from '../shared/AppState';

export const selectBoard = (state: AppState) => state.board;

export const selectBoardFields = createSelector(
  selectBoard,
  (state: BoardState) => state.fields
);

export const selectBoardField = createSelector(
  selectBoard,
  (state: BoardState, props) => {
    const fieldDetails = state.fields[props.x][props.y];
    // console.log(props);
    return fieldDetails;
  }
);
