import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { BoardRoutingModule } from './board-routing.module';
import { BoardComponent } from './board/board.component';
import { FieldComponent } from './field/field.component';
import * as fromBoardReducer from './board.reducer';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldsComponent } from './fields/fields.component';
import { GameModule } from '../game/game.module';

const components = [BoardComponent, FieldComponent, FieldsComponent];
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
