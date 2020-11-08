import { Component, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';

import { BoardRoutingModule } from './board-routing.module';
import { BoardComponent } from './board/board.component';
import { FieldComponent } from './field/field.component';
import * as fromBoardReducer from './board.reducer';
import { BrowserModule } from '@angular/platform-browser';

const components = [BoardComponent, FieldComponent];
@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    BoardRoutingModule,
    StoreModule.forFeature(
      fromBoardReducer.featureKey,
      fromBoardReducer.reducer
    ),
  ],
  exports: components,
})
export class BoardModule {}
