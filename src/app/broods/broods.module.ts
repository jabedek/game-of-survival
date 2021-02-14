import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BroodComponent } from './brood/brood.component';
import { StoreModule } from '@ngrx/store';
import * as fromBroodsReducer from './broods.reducer';
import { BrowserModule } from '@angular/platform-browser';
import { BoardRoutingModule } from '../board/board-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BroodsService } from './broods.service';

@NgModule({
  declarations: [BroodComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BoardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    StoreModule.forFeature(
      fromBroodsReducer.featureKey,
      fromBroodsReducer.reducer
    ),
  ],
  providers: [BroodsService],
})
export class BroodsModule {}
