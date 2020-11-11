import { Component, OnInit } from '@angular/core';
import { FIELD_SIZE } from 'src/app/board/board.constants';

@Component({
  selector: 'app-particle',
  templateUrl: './particle.component.html',
  styleUrls: ['./particle.component.scss'],
})
export class ParticleComponent implements OnInit {
  CSSsize = FIELD_SIZE * 0.8;

  constructor() {}

  ngOnInit(): void {}
}
