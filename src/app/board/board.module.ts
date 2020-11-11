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

const components = [BoardComponent, FieldComponent];
@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    BrowserModule,
    BoardRoutingModule,
    ParticleModule,
    ObsticleModule,
    BrowserAnimationsModule,
    StoreModule.forFeature(
      fromBoardReducer.featureKey,
      fromBoardReducer.reducer
    ),
  ],
  exports: components,
})
export class BoardModule {}
