import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObsticleComponent } from './obsticle/obsticle.component';

@NgModule({
  declarations: [ObsticleComponent],
  imports: [CommonModule],
  exports: [ObsticleComponent],
})
export class ObsticleModule {}
