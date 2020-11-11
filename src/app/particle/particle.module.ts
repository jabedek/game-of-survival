import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticleComponent } from './particle/particle.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [ParticleComponent],
  imports: [CommonModule, BrowserAnimationsModule],
  exports: [ParticleComponent],
})
export class ParticleModule {}
