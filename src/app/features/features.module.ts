import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationModule } from './simulation/simulation.module';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SimulationModule],
  exports: [SimulationModule],
})
export class FeaturesModule {}
