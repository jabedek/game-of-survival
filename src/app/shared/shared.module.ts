import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './components/button/button.component';
import { ToggleComponent } from './components/toggle/toggle.component';

@NgModule({
  declarations: [ButtonComponent, ToggleComponent],
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  exports: [FormsModule, RouterModule, ReactiveFormsModule, ButtonComponent, ToggleComponent],
})
export class SharedModule {}
