import { Component, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';

import { BoardRoutingModule } from './board-routing.module';
import { BoardComponent } from './board/board.component';
import { FieldComponent } from './field/field.component';
import * as fromBoardReducer from './board.reducer';
import { BrowserModule } from '@angular/platform-browser';
import { ParticleModule } from '../particle/particle.module';
import { ObsticleModule } from '../obsticle/obsticle.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BoardService } from './board.service';
import { BoardContainerComponent } from './board-container/board-container.component';

const components = [BoardComponent, FieldComponent, BoardContainerComponent];
@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    BrowserModule,
    BoardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ParticleModule,
    ObsticleModule,
    BrowserAnimationsModule,
    StoreModule.forFeature(
      fromBoardReducer.featureKey,
      fromBoardReducer.reducer
    ),
  ],
  exports: components,
  providers: [BoardService],
})
export class BoardModule {}
