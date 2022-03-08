import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationComponent } from './simulation.component';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [SimulationComponent],
  imports: [CommonModule, CoreModule, SharedModule],
  exports: [SimulationComponent],
})
export class SimulationModule {}
