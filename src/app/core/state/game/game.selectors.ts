import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RootState } from '@/src/app/core/state/root-state.types';
import { GameState, TurnState } from './game.state';

export const featureKey = 'game';

export const selectGame = createFeatureSelector<RootState, GameState>(featureKey);

export const selectTurn = createSelector(selectGame, (state: GameState) => state.turn);

export const selectTurnPhase = createSelector(selectTurn, (state: TurnState) => state.phase);

export const selectTurnIndex = createSelector(selectTurn, (turn) => turn.index);

export const selectError = createSelector(selectGame, (state: GameState) => state.error);
