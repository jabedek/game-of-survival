import { Component, OnInit } from '@angular/core';
import { SimulationService } from './simulation.service';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
})
export class SimulationComponent implements OnInit {
  // pauseToggle = false;
  // changePause(event: boolean): void {
  //   this.pauseToggle = event;
  //   this.simulationService.changePause(event);
  // }

  constructor(public simulationService: SimulationService) {}

  ngOnInit(): void {}

  // start(): void {
  //   this.simulationService.start();
  // }

  // stop(): void {
  //   this.simulationService.stop();
  // }

  // nextTurn(): void {
  //   this.simulationService.nextTurn();
  // }
}
