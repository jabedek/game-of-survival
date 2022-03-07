import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from '@/src/app/core/components/board/board.component';
import { PanelComponent } from '@/src/app/core/components/panel/panel.component';
import { SharedModule } from '@/src/app/shared/shared.module';

@NgModule({
  declarations: [BoardComponent, PanelComponent],
  imports: [CommonModule, SharedModule],
  exports: [BoardComponent, PanelComponent],
})
export class CoreModule {}
