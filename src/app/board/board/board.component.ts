import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { concatMap, map, mergeMap } from 'rxjs/operators';
import { BroodsService } from 'src/app/board/broods.service';
import { GameService } from 'src/app/game.service';
import {
  AppState,
  Brood,
  ValidPotentialBroodSpace,
  Field,
  FieldPos,
  Fields,
  ParticleUnit,
  ParticleUnitSimplified,
  Unit,
} from 'src/app/shared/types-interfaces';
import {
  selectBoardFields,
  selectBroodsOnBoard,
  selectValidBroodSpaces,
  selectEmptyFields,
  selectParticlesOnBoard,
} from '..';
import { removeBrood } from '../board.actions';
import {
  BOARD_DIMENSIONS,
  FIELD_SIZE,
  FIELD_DISPLAY_INFO,
} from '../board.constants';

import { BoardService } from '../board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  constructor(
    public store: Store<AppState>,
    public boardService: BoardService,
    public broodService: BroodsService,
    public gameService: GameService,
    public cdr: ChangeDetectorRef
  ) {}

  boardDimensions = BOARD_DIMENSIONS;

  fieldSize = FIELD_SIZE;

  panelShowing = false;

  FIELD_DISPLAY_INFO = FIELD_DISPLAY_INFO;

  borderObsticlesUp = false;
  validBroodSpaces$: Observable<ValidPotentialBroodSpace[]> = this.store.select(
    selectValidBroodSpaces
  );
  validBroodSpaces: ValidPotentialBroodSpace[] = null;
  broodsOnBoard: Observable<Brood[]> = this.store.select(selectBroodsOnBoard);
  particlesOnBoard$: Observable<ParticleUnit[]> = this.store.select(
    selectParticlesOnBoard
  );
  fields$: Observable<Fields> = this.store.select(selectBoardFields);
  emptyFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  emptyFieldsTotal = 0;

  broodSpacesTotal = 0;
  subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.particlesOnBoard$
        .pipe(
          mergeMap(() => {
            return this.store.select(selectBroodsOnBoard);
          })
        )
        .subscribe((data: Brood[]) => {
          if (data.length) {
            data.forEach((brood) => {
              if (!brood.units.length) {
                this.store.dispatch(removeBrood({ id: brood.id }));
              }
            });

            this.cdr.markForCheck();
          }
        })
    );

    this.subscription.add(
      this.store.select(selectBroodsOnBoard).subscribe((data) => {
        if (data.length) {
          data.forEach((brood) => {
            if (!brood.units.length) {
              this.store.dispatch(removeBrood({ id: brood.id }));
            }
          });

          this.cdr.markForCheck();
        }
      })
    );

    this.subscription.add(
      this.validBroodSpaces$.subscribe((data) => {
        this.validBroodSpaces = data;
      })
    );

    this.initBoard();
    // this.getAllValidBroodSpaces();

    this.toggleBordersDown();

    this.addNewBroodBSRRootRandomly();
  }

  showPanel() {
    this.panelShowing = !this.panelShowing;
  }

  addNewBroodBSRRoot() {
    this.broodService.addNewBroodBSRRoot(
      'uniton',
      this.validBroodSpaces[0],
      'red'
    );
  }

  addNewBroodBSRRootRandomly() {
    let randomBSR = Math.floor(Math.random() * this.validBroodSpaces.length);

    this.broodService.addNewBroodBSRRoot(
      'uniton',
      this.validBroodSpaces[randomBSR],
      'purple'
    );
  }

  ngAfterViewInit() {}
  ngOnChanges(changes: SimpleChanges) {}

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initBoard() {
    this.borderObsticlesUp = false;
    this.boardService.initEmptyFields(this.boardDimensions);
    this.broodService.clearBroods();
  }

  handleClick(type: string) {
    this[type]();
  }

  private checkThenDeleteEmptyBroods(data: Brood[]) {
    data.forEach((brood) => {
      if (!brood.units) {
        this.store.dispatch(removeBrood({ id: brood.id }));
      }
    });
  }

  // getEmptyFields() {

  //   this.boardService
  //     .getEmptyFields$()
  //     .subscribe((data) => {
  //       this.emptyFieldsTotal = data.length;
  //     })
  //     .unsubscribe();
  // }

  // getAllValidBroodSpaces() {
  //   this.broodService
  //     .getAllValidBroodSpaces$()
  //     .subscribe((data) => {
  //       this.broodSpacesTotal = data.length;
  //     })
  //     .unsubscribe();
  // }

  reloadBoard() {
    this.initBoard();
    this.toggleBordersDown();
  }

  toggleBordersUp() {
    this.borderObsticlesUp = false;
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
    this.borderObsticlesUp = true;
  }

  toggleBordersDown() {
    this.borderObsticlesUp = true;
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
    this.borderObsticlesUp = false;
  }

  toggleBorders(): void {
    this.boardService.toggleBorders(
      this.boardDimensions,
      this.borderObsticlesUp
    );
    this.borderObsticlesUp = !this.borderObsticlesUp;
  }

  // ### Composit actions

  // Reinit board fields, then: add borders (obsticles), then: add 2 particles, then: add 2 more obsticles
  scenario1() {
    this.initBoard();
    this.toggleBordersUp();
    this.addUnits(2, 2);
  }

  addUnits(particles: number, obsticles = 0) {
    this.boardService.addUnits(particles, obsticles);
  }
}
