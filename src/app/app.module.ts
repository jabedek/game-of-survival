import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

import { gameReducer as game } from '@/src/app/core/state/game/game.reducer';
import { uiReducer as ui } from '@/src/app/core/state/ui/ui.reducer';
import { boardReducer as board } from '@/src/app/core/state/board/board.reducer';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FeaturesModule } from './features/features.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    HttpClientModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRoutingModule,
    SharedModule,
    CoreModule,
    FeaturesModule,
    StoreModule.forRoot({ ui, board, game }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
