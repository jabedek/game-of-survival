import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import * as fromUIReducer from './ui.reducer';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(fromUIReducer.featureKey, fromUIReducer.reducer),
  ],
})
export class UIModule {}
