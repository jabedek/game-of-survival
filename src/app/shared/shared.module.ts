import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './components/button/button.component';

@NgModule({
  declarations: [ButtonComponent],
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule],
  exports: [FormsModule, RouterModule, ReactiveFormsModule, ButtonComponent],
})
export class SharedModule {}
