import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BoardComponent } from './components/board/board.component';
import { PanelComponent } from './components/panel/panel.component';

@NgModule({
  declarations: [BoardComponent, PanelComponent],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,

    BoardComponent,
    PanelComponent,
  ],
})
export class SharedModule {}
