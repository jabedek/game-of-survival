import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardModule } from './board/board.module';
import { StoreModule } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { BoardRoutingModule } from './board/board-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BroodsModule } from './broods/broods.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    CommonModule,
    BrowserModule,
    BoardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BoardModule,
    BroodsModule,
    StoreModule.forRoot({}),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
