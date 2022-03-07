import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

import { gameReducer as game } from '@/src/app/core/state/game/game.reducer';
import { uiReducer as ui } from '@/src/app/core/state/ui/ui.reducer';
import { boardReducer as board } from '@/src/app/core/state/board/board.reducer';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    // CommonModule,
    // BrowserModule,
    // BoardRoutingModule,
    // FormsModule,
    // ReactiveFormsModule,
    SharedModule,
    CoreModule,
    // BoardModule,
    // GameModule,
    // UIModule,
    StoreModule.forRoot({ ui, board, game }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
