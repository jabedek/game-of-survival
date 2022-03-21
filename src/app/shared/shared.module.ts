import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './components/button/button.component';
import { ToggleComponent } from './components/toggle/toggle.component';
import { MinMaxDirective } from './directives/cva-min-max.directive';
import { ButtonNeuromorphicComponent } from './components/button-neuromorphic/button-neuromorphic.component';

@NgModule({
  declarations: [ButtonComponent, ToggleComponent, MinMaxDirective, ButtonNeuromorphicComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [FormsModule, ReactiveFormsModule, ButtonComponent, ToggleComponent, MinMaxDirective, ButtonNeuromorphicComponent],
})
export class SharedModule {}
