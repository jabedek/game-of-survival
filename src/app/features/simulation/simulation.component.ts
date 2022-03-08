import { Component, OnInit } from '@angular/core';
import { SimulationService } from './simulation.service';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
})
export class SimulationComponent implements OnInit {
  pauseToggle = false;
  changePause(event: boolean) {
    this.pauseToggle = event;
    this.simulationService.changePause(event);
  }

  constructor(private simulationService: SimulationService) {}

  ngOnInit(): void {}

  start() {
    this.simulationService.start();
  }

  stop() {
    this.simulationService.stop();
  }

  nextTurn() {
    this.simulationService.nextTurn();
  }
}
