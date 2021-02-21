import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectBoardSnapshot } from './board';
import { GameService } from './game.service';
import {
  AppState,
  Brood,
  Field,
  ParticleUnit,
  ValidPotentialBroodSpace,
} from './shared/types-interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  decorShowing = true;
  panelShowing = true;

  boardSnapshot$ = this.store.select(selectBoardSnapshot);

  particlesList: ParticleUnit[] = [];
  broodsList: Brood[] = [];
  emptyFields: Field[] = [];
  validBroodSpaces: ValidPotentialBroodSpace[] = null;

  constructor(public store: Store<AppState>, private game: GameService) {
    this.boardSnapshot$.subscribe((data) =>
      // console.log(data.available?.emptyFields.length)
      {
        console.log(data);

        {
          this.particlesList = data.occupied.particlesList;
          this.broodsList = data.occupied.broodsList;
          this.emptyFields = data.available.emptyFields;
          this.validBroodSpaces = data.available.validBroodSpaces;
        }
      }
    );
  }

  ngOnInit() {
    this.game.launchBroodTurns();
  }

  showDecor() {
    this.decorShowing = !this.decorShowing;
  }
}
