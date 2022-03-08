import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RootState } from '@/src/app/core/state/root-state.types';
import { GameState, TurnState } from '@/src/app/shared/types/game.types';

export const featureKey = 'game';

export const selectGame = createFeatureSelector<RootState, GameState>(featureKey);

export const selectTurn = createSelector(selectGame, (state: GameState) => {
  return state.turn;
});

export const selectTurnPhase = createSelector(selectTurn, (state: TurnState) => state.phase);

export const selectTurnIndex = createSelector(selectTurn, (turn) => turn.index);
