import { Component, Input, OnInit } from '@angular/core';
import { Brood } from 'src/app/shared/types-interfaces';

@Component({
  selector: 'app-brood',
  templateUrl: './brood.component.html',
  styleUrls: ['./brood.component.scss'],
})
export class BroodComponent implements OnInit {
  @Input() brood: Brood = null;
  constructor() {}

  ngOnInit(): void {}
}
