import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button-neuromorphic',
  templateUrl: './button-neuromorphic.component.html',
  styleUrls: ['./button-neuromorphic.component.scss'],
})
export class ButtonNeuromorphicComponent implements OnInit {
  @Input() label = '';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();
  constructor() {}

  ngOnInit(): void {}
}
