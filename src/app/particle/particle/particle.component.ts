import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { selectFieldNeighbors } from 'src/app/board';
import { FIELD_SIZE, NEIGHBORS_FOR_REPRO } from 'src/app/board/board.constants';
import { BroodsService } from 'src/app/board/broods.service';
import {
  AppState,
  Brood,
  FieldPos,
  NeighborsRaport,
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
  groupId: 'darkies',
  pos: { row: null, column: null },
  id: 'unit-123',
  color: 'red',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticleComponent implements OnInit, AfterViewInit, OnDestroy {
  CSSsize = FIELD_SIZE * 0.8;
  @Input() fieldPos: FieldPos;
  @Input() isBlue = true;
  @Input() isRed = true;
  @Input() isPurple = false;
  @Input() isColor: 'blue' | 'red' | 'purple' = 'blue';
  @Input() particleUnit: ParticleUnit;

  turnDone = false;
  subscriptionNeighbors: Subscription = new Subscription();
  neighbors$: Observable<NeighborsRaport>;
  broodInfo: Brood = null;

  neighbors: NeighborsRaport = null;

  constructor(
    public store: Store<AppState>,
    public broodService: BroodsService
  ) {
    // this.particleUnit = particleUnit;
  }

  private beginTurn() {
    this.neighbors$ = this.store.select(selectFieldNeighbors, this.fieldPos);

    this.subscriptionNeighbors.add(
      this.neighbors$.subscribe((data) => {
        // console.log(this.fieldPos, data);

        this.neighbors = data;
      })
    );
  }

  ngAfterViewInit() {
    this.makeUnitTurn();
  }

  makeUnitTurn() {
    setTimeout(() => {
      // console.log(this.particleUnit.unit.name, 'is doing turn');
    }, 0);

    setTimeout(() => {
      // this.particleUnit.makeTurn();
      // console.log('done');
    }, 2000);

    this.turnDone = true;
  }

  ngOnInit(): void {
    if (this.particleUnit.groupId && this.particleUnit.groupId.length > 0) {
      this.broodService.getBroodsOnBoard$().subscribe((data) => {
        this.broodInfo = data.find(
          (brood) => brood.id === this.particleUnit?.groupId
        );
      });
    }
    this.beginTurn();
  }

  ngOnDestroy() {
    this.subscriptionNeighbors.unsubscribe();
  }
}
