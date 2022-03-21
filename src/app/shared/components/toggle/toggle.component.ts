import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
})
export class ToggleComponent {
  @Input() label = '';
  @Input() value = false;
  @Input() disabled = false;

  @Output() toggled: EventEmitter<boolean> = new EventEmitter();

  handleChange(): void {
    this.value = !this.value;
    this.toggled.emit(this.value);
  }
}
