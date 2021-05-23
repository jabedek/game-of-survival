import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';

import * as fromBoardReducer from './store/board.reducer';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PanelComponent } from './components/panel/panel.component';
import { BoardComponent } from './components/board/board.component';
import { BoardRoutingModule } from './board-routing.module';
import { ShowPositionDirective } from './directives/show-position.directive';
import { BoxComponent } from './box/box.component';

const components = [
  PanelComponent,
  BoardComponent,
  ShowPositionDirective,
  BoxComponent,
];
@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    BrowserModule,
    BoardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    StoreModule.forFeature(
      fromBoardReducer.featureKey,
      fromBoardReducer.reducer
    ),
  ],
  exports: components,
  providers: [],
})
export class BoardModule {}
