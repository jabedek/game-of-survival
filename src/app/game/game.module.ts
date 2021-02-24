import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';

import * as fromGameReducer from './game.reducer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BrowserModule,
    StoreModule.forFeature(fromGameReducer.featureKey, fromGameReducer.reducer),
  ],
})
export class GameModule {}
