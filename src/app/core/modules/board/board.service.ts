import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { resetTurnCounter } from '@/src/app/core/state/game/game.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { RootState } from '@/src/app/core/state/root-state';
import * as HELPERS from '@/src/app/shared/helpers/board.helpers';

import { Field, FieldPos } from '@/src/app/shared/types/field.types';
import { BoardFields, Brood, ParticleColor, ParticleUnit, ValidPotentialBroodSpace } from '@/src/app/shared/types/board.types';
import { selectBoardFields, selectEmptyFields, selectValidBroodSpaces } from '@/src/app/core/state/board/board.selectors';
import { addBroodToList, loadBoardFields } from '@/src/app/core/state/board/actions/board.actions';
import { BOARD_DIMENSIONS } from '@/src/app/shared/constants/board.constants';
import { BoardModule } from './board.module';
import { FieldService } from './services/field.service';
import { ParticlesService } from './services/particles.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor(public store: Store<RootState>, private fieldService: FieldService, private particlesService: ParticlesService) {}

  fields$: Observable<BoardFields> = this.store.select(selectBoardFields);
  emptyFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  emptyFieldsTotal = 0;
  emptyBoardFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  validBroodSpaces$: Observable<ValidPotentialBroodSpace[]> = this.store.select(selectValidBroodSpaces);

  reloadBoard() {
    this.store.dispatch(
      loadBoardFields({
        fields: this.getInitialFields(BOARD_DIMENSIONS),
      })
    );

    this.particlesService.clearParticlesList();
    this.particlesService.clearBroodsList();
    this.store.dispatch(resetTurnCounter());
  }

  scenario2() {
    this.reloadBoard();

    const boardOffset = 2;

    const redBrood: Brood = new Brood(
      'reds',
      [
        new ParticleUnit('reds-0', { row: 0 + boardOffset, column: 0 + boardOffset }, 'red', 'reds'),
        new ParticleUnit('reds-0', { row: 0 + boardOffset, column: 1 + boardOffset }, 'red', 'reds'),
      ],
      'red'
    );

    const blueBrood: Brood = new Brood(
      'blues',
      [
        new ParticleUnit(
          'blues-0',
          {
            row: BOARD_DIMENSIONS - 1 - boardOffset,
            column: BOARD_DIMENSIONS - 2 - boardOffset,
          },
          'blue',
          'blues'
        ),
        new ParticleUnit(
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
        new ParticleUnit(
          'greens-0',
          {
            row: Math.round(BOARD_DIMENSIONS / 2) - 1,
            column: Math.round(BOARD_DIMENSIONS / 2) - 1,
          },
          'green',
          'greens'
        ),
        new ParticleUnit(
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
        const unit: ParticleUnit = new ParticleUnit(`solo${getRandom(1000)}`, field.pos, 'blue');
        this.addNewParticle(unit);
        break;
      case 'particle':
        this.fieldService.setFieldBox(field.pos);
        break;
      case 'other':
      default:
        this.deleteParticle(field.pos);
        break;
    }
  }

  /**
   * Only used in creating/preparing stage.
   * Doesn't update overwritten particles or brood states in store.
   */
  toggleBorders(boardDimensions: number, toggler): void {
    const borderObsticlesUp = !toggler;

    for (let row = 0; row < boardDimensions; row++) {
      for (let column = 0; column < boardDimensions; column++) {
        if (row == 0 || column == 0 || row == boardDimensions - 1 || column == boardDimensions - 1) {
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

  addUnitsRandomly(particles = 1, obsticles = 0) {
    if (particles > 0) {
      for (let i = 0; i < particles; i++) {
        this.putUnitOnEmptyFieldRandomly('particle');
      }
    }

    if (obsticles > 0) {
      for (let i = 0; i < obsticles; i++) {
        this.putUnitOnEmptyFieldRandomly('obsticle');
      }
    }
  }

  moveParticle(pos: FieldPos, newPos: FieldPos) {
    this.fieldService.moveParticle(pos, newPos);
  }

  /**
   * Adds a brood to state and board (UI).
   * Doesn't check given units' positions validity.
   * Before that, it deletes any existing particles on new brood units' positions.
   */
  addBrood(brood: Brood) {
    brood.units.forEach((unit) => {
      this.deleteParticle(unit.pos);
      this.fieldService.setFieldParticle(unit);
      this.particlesService.setParticleBroodBelonging(unit, unit.groupId);
      this.particlesService.addMemberToBroodUnits(unit);
      this.particlesService.updateParticlesList('add', unit);
    });

    this.store.dispatch(addBroodToList({ brood }));
  }

  addNewBroodOnContextmenu(id: string, pos: FieldPos, color: ParticleColor = 'red') {
    const brood = HELPERS.getPreparedBroodBase(pos, id, color);
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
              if (type === 'particle') {
                success = true;
                this.addNewParticle(new ParticleUnit(`randomitons${rndIndex}`, rndmlySelectedField.pos, 'black', 'randomitons'));
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

  addNewParticle = (unit: ParticleUnit) => {
    this.fieldService.setFieldEmpty(unit.pos);
    this.fieldService.setFieldParticle(unit);
    this.particlesService.updateParticlesList('add', unit);
  };

  deleteParticle(pos: FieldPos) {
    this.particlesService.removeBroodMember(pos);
    this.particlesService.updateParticlesList('del', {
      pos,
      groupId: null,
      color: null,
      id: null,
      state: null,
      type: null,
    });
    this.fieldService.setFieldEmpty(pos);
  }
}
