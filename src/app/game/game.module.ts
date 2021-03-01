import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';

import * as fromGameReducer from './game.reducer';
import { BoardModule } from '../board/board.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BrowserModule,
    BoardModule,
    StoreModule.forFeature(fromGameReducer.featureKey, fromGameReducer.reducer),
  ],
  exports: [],
})
export class GameModule {}
