import { Component, OnInit } from '@angular/core';
import { FIELD_SIZE } from 'src/app/board/board.constants';

@Component({
  selector: 'app-obsticle',
  templateUrl: './obsticle.component.html',
  styleUrls: ['./obsticle.component.scss'],
})
export class ObsticleComponent implements OnInit {
  CSSsize = FIELD_SIZE * 0.8;
  constructor() {}

  ngOnInit(): void {}
}
