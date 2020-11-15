import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FIELD_SIZE, NEIGHBORS_FOR_REPRO } from 'src/app/board/board.constants';
import {
  FieldPos,
  ParticleState,
  ParticleUnit,
} from 'src/app/shared/types-interfaces';
import { CHANCES_TO_DIE_BASE } from '../../board/board.constants';

const initialParticleState: ParticleState = {
  chancesToDieBase: CHANCES_TO_DIE_BASE,
  chancesToDieThisTurn: CHANCES_TO_DIE_BASE,
  chancesToReproduceThisTurn: null,
  neighborsThisTurn: null,
  neighborsBestChancesRepro: NEIGHBORS_FOR_REPRO,
  neighborsBestChancesNotDie: null,
  availableSpotsThisTurn: null,
  gainedAbilities: [],
  gainedProperties: [],
  CSSstylesThisTurn: [],
  penaltyTurnsToWait: 0,
  entangledChildrenIds: [],
};

const particleUnit: ParticleUnit = {
  unit: {
    name: 'unit',
    broodId: 'darkies',
    pos: { column: null, row: null },
    id: '123',
  },
  state: initialParticleState,
  getState: () => {
    return particleUnit.state;
  },
  makeTurn: () => {
    console.log('git');

    return true;
  },
  setLongTermGoal: () => {
    return true;
  },
};

@Component({
  selector: 'app-particle',
  templateUrl: './particle.component.html',
  styleUrls: ['./particle.component.scss'],
})
export class ParticleComponent implements OnInit, AfterViewInit {
  CSSsize = FIELD_SIZE * 0.8;

  @Input() fieldPos: FieldPos;
  particleUnit: ParticleUnit;

  turnDone = false;

  constructor() {
    this.particleUnit = particleUnit;
  }

  ngAfterViewInit() {
    this.makeUnitTurn();
  }

  makeUnitTurn() {
    setTimeout(() => {
      console.log(this.particleUnit.unit.name, 'is doing turn');
    }, 0);

    setTimeout(() => {
      // this.particleUnit.makeTurn();
      console.log('done');
    }, 2000);

    this.turnDone = true;
  }

  ngOnInit(): void {}
}
