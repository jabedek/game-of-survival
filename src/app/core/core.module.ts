import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from '@/src/app/core/components/panel/panel.component';
import { SharedModule } from '@/src/app/shared/shared.module';
import { BoardModule } from '@/src/app/core/modules/board/board.module';

@NgModule({
  declarations: [PanelComponent],
  imports: [CommonModule, SharedModule, BoardModule],
  exports: [PanelComponent, BoardModule],
})
export class CoreModule {}
