import { Component, OnInit } from '@angular/core';
import { GameService } from './game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  decorShowing = true;
  constructor(private game: GameService) {}

  ngOnInit() {
    this.game.launchBroodTurns();
  }

  showDecor() {
    this.decorShowing = !this.decorShowing;
  }
}
