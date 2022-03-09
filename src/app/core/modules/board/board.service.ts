import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { resetTurnCounter } from '@/src/app/core/state/game/game.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { RootState } from '@/src/app/core/state/root-state.types';
import * as HELPERS from '@/src/app/shared/helpers/board.helpers';

import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { BoardFields, ValidPotentialBroodSpace } from '@/src/app/shared/types/board/board.types';
import { selectBoardFields, selectEmptyFields, selectValidBroodSpaces } from '@/src/app/core/state/board/board.selectors';
import { addBroodToList, loadBoardFields } from '@/src/app/core/state/board/actions/board.actions';
import { BOARD_DIMENSIONS } from '@/src/app/shared/constants/board.constants';
import { BoardModule } from './board.module';
import { FieldService } from './services/field.service';
import { UnitsService } from './services/units.service';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { UnitColor } from '@/src/app/shared/types/board/unit-base.types';
import { Brood } from '@/src/app/shared/types/board/brood.types';
import { selectBoardDimensions } from '../../state/ui/ui.selectors';

@Injectable({
  providedIn: 'root',
})
export class BoardService implements OnDestroy {
  subscription: Subscription = new Subscription();
  selectBoardDimensions$ = this.store.select(selectBoardDimensions);

  boardDimensions: number | undefined;
  constructor(public store: Store<RootState>, private fieldService: FieldService, private unitsService: UnitsService) {
    this.subscription.add(
      this.selectBoardDimensions$.subscribe((d) => {
        this.boardDimensions = d;
      })
    );
  }

  fields$: Observable<BoardFields> = this.store.select(selectBoardFields);
  emptyFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  emptyFieldsTotal = 0;
  emptyBoardFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  validBroodSpaces$: Observable<ValidPotentialBroodSpace[]> = this.store.select(selectValidBroodSpaces);

  ngOnDestroy(): void {
    this.subscription.unsubscribe;
  }

  reloadBoard() {
    this.store.dispatch(
      loadBoardFields({
        fields: this.getInitialFields(this.boardDimensions),
      })
    );

    this.unitsService.clearUnitsList();
    this.unitsService.clearBroodsList();
    this.store.dispatch(resetTurnCounter());
  }

  scenario2() {
    this.reloadBoard();

    const boardOffset = 2;

    const redBrood: Brood = new Brood(
      'reds',
      [
        new Unit('reds-0', { row: 0 + boardOffset, column: 0 + boardOffset }, 'red', 'reds'),
        new Unit('reds-0', { row: 0 + boardOffset, column: 1 + boardOffset }, 'red', 'reds'),
      ],
      'red'
    );

    const blueBrood: Brood = new Brood(
      'blues',
      [
        new Unit(
          'blues-0',
          {
            row: BOARD_DIMENSIONS - 1 - boardOffset,
            column: BOARD_DIMENSIONS - 2 - boardOffset,
          },
          'blue',
          'blues'
        ),
        new Unit(
          'blues-0',
          {
            row: BOARD_DIMENSIONS - 1 - boardOffset,
            column: BOARD_DIMENSIONS - 1 - boardOffset,
          },
          'blue',
          'blues'
        ),
      ],
      'blue'
    );

    const greenBrood: Brood = new Brood(
      'greens',
      [
        new Unit(
          'greens-0',
          {
            row: Math.round(BOARD_DIMENSIONS / 2) - 1,
            column: Math.round(BOARD_DIMENSIONS / 2) - 1,
          },
          'green',
          'greens'
        ),
        new Unit(
          'greens-0',
          {
            row: Math.round(BOARD_DIMENSIONS / 2) - 1,
            column: Math.round(BOARD_DIMENSIONS / 2),
          },
          'green',
          'greens'
        ),
      ],
      'green'
    );

    this.addBrood(redBrood);
    this.addBrood(blueBrood);
    this.addBrood(greenBrood);
  }

  toggleField(field: Field) {
    switch (field.mode) {
      case 'empty':
        this.fieldService.setFieldObsticle(field.pos);
        break;
      case 'obsticle':
        const unit: Unit = new Unit(`solo${getRandom(1000)}`, field.pos, 'blue');
        this.addNewUnit(unit);
        break;
      case 'unit':
        this.fieldService.setFieldObject(field.pos);
        break;
      case 'other':
      default:
        this.deleteUnit(field.pos);
        break;
    }
  }

  /**
   * Only used in creating/preparing stage.
   * Doesn't update overwritten units or brood states in store.
   */
  toggleBorders(boardDimensions: number, toggler): void {
    const borderObsticlesUp = !toggler;

    for (let row = 0; row < boardDimensions; row++) {
      for (let column = 0; column < boardDimensions; column++) {
        if (row === 0 || column === 0 || row === boardDimensions - 1 || column === boardDimensions - 1) {
          borderObsticlesUp ? this.fieldService.setFieldObsticle({ row, column }) : this.fieldService.setFieldEmpty({ row, column });
        }
      }
    }
  }

  setRandomBlockades(boardDimensions: number): void {
    let totalBlockades = Math.floor((boardDimensions * boardDimensions) / 8);
    totalBlockades = 4;

    for (let i = 0; i < totalBlockades; i++) {
      const column = getRandom(boardDimensions);
      const row = getRandom(boardDimensions);

      this.fieldService.setFieldObsticle({ row, column });
    }
  }

  addUnitsRandomly(units = 1, obsticles = 0) {
    if (units > 0) {
      for (let i = 0; i < units; i++) {
        this.putUnitOnEmptyFieldRandomly('unit');
      }
    }

    if (obsticles > 0) {
      for (let i = 0; i < obsticles; i++) {
        this.putUnitOnEmptyFieldRandomly('obsticle');
      }
    }
  }

  moveUnit(pos: FieldPos, newPos: FieldPos) {
    this.fieldService.moveUnit(pos, newPos);
  }

  /**
   * Adds a brood to state and board (UI).
   * Doesn't check given units' positions validity.
   * Before that, it deletes any existing units on new brood units' positions.
   */
  addBrood(brood: Brood) {
    brood.units.forEach((unit) => {
      this.deleteUnit(unit.pos);
      this.fieldService.setFieldUnit(unit);
      this.unitsService.setUnitBroodBelonging(unit, unit.broodId);
      this.unitsService.addMemberToBroodUnits(unit);
      this.unitsService.updateUnitsList('add', unit);
    });

    this.store.dispatch(addBroodToList({ brood }));
  }

  addNewBroodOnContextmenu(id: string, pos: FieldPos, color: UnitColor = 'red') {
    const brood = HELPERS.getPreparedBroodBase(this.boardDimensions, pos, id, color);
    this.addBrood(brood);
  }

  getAllFields$() {
    return this.store.select(selectBoardFields);
  }

  private getInitialFields(boardDimensions): BoardFields {
    return HELPERS.getInitialFields(boardDimensions);
  }

  getEmptyFields$() {
    return this.emptyFields$;
  }

  putUnitOnEmptyFieldRandomly(type) {
    let success = false;
    let board: Field[] = [];

    this.store
      .select(selectEmptyFields)
      .subscribe((data: Field[]) => {
        board = data;

        if (board.length) {
          while (!success) {
            const rndIndex = getRandom(board.length);
            const rndmlySelectedField = board[rndIndex];

            if (!rndmlySelectedField.blocked) {
              if (type === 'unit') {
                success = true;
                this.addNewUnit(new Unit(`randomitons${rndIndex}`, rndmlySelectedField.pos, 'black', 'randomitons'));
              }

              if (type === 'obsticle') {
                success = true;
                this.fieldService.setFieldObsticle(rndmlySelectedField.pos);
              }
            } else {
              success = false;
            }
          }
        } else {
          console.warn('no available fields');
          throw new Error('No available fields.');
        }
      })
      .unsubscribe();
  }

  addNewUnit = (unit: Unit) => {
    this.fieldService.setFieldEmpty(unit.pos);
    this.fieldService.setFieldUnit(unit);
    this.unitsService.updateUnitsList('add', unit);
  };

  deleteUnit(pos: FieldPos) {
    this.unitsService.removeBroodMember(pos);
    this.unitsService.updateUnitsList('del', {
      pos,
      broodId: undefined,
      color: undefined,
      id: undefined,
      state: undefined,
      type: undefined,
    });
    this.fieldService.setFieldEmpty(pos);
  }
}
