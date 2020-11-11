import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticleComponent } from './particle/particle.component';

@NgModule({
  declarations: [ParticleComponent],
  imports: [CommonModule],
  exports: [ParticleComponent],
})
export class ParticleModule {}
