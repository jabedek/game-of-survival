import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { resetTurnCounter } from '@/src/app/core/state/game/game.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { RootState } from '@/src/app/core/state/root-state';
import * as HELPERS from '@/src/app/shared/helpers/board.helpers';

import { Field, FieldPos, FieldReference } from '@/src/app/shared/types/field.types';
import { BoardFields, Brood, ParticleColor, ParticleUnit, ValidPotentialBroodSpace } from '@/src/app/shared/types/board.types';
import { selectBoardFields, selectEmptyFields, selectValidBroodSpaces } from '@/src/app/core/state/board/board.selectors';
import {
  addBroodToList,
  addParticleToList,
  clearBroodsList,
  clearParticlesList,
  deleteParticleFromList,
  loadBoardFields,
  moveParticleFromTo,
} from '@/src/app/core/state/board/actions/board.actions';
import { BOARD_DIMENSIONS } from '@/src/app/shared/constants/board.constants';
import { setFieldBox, setFieldEmpty, setFieldObsticle, setFieldParticle } from '@/src/app/core/state/board/actions/field.actions';
import { addMemberToBroodUnits, removeBroodMember, swapBroodMemberOnPos } from '@/src/app/core/state/board/actions/brood.actions';
import { CoreModule } from '../../core.module';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor(public store: Store<RootState>) {}

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

    this.clearParticlesList();
    this.clearBroodsList();
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

    this.addBroodToList(redBrood);
    this.addBroodToList(blueBrood);
    this.addBroodToList(greenBrood);

    // this.boardService.
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
          const pos: FieldPos = { row, column };
          let actionTrue = setFieldObsticle({ pos });
          let actionFalse = setFieldEmpty({ pos });

          borderObsticlesUp ? this.store.dispatch(actionTrue) : this.store.dispatch(actionFalse);
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

      this.store.dispatch(setFieldObsticle({ pos: { row, column } }));
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

  private putUnitOnEmptyFieldRandomly(type) {
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
                this.setFieldObsticle(rndmlySelectedField.pos);
              }
            } else {
              success = false;
            }
          }
        } else {
          console.log('no available fields');
          throw new Error('No available fields.');
        }
      })
      .unsubscribe();
  }

  /**
   * Doesnt resolve Fields's relationships with other enitites in board state.
   */
  private setFieldEmpty(pos: FieldPos) {
    this.store.dispatch(setFieldEmpty({ pos }));
  }
  /**
   * Doesnt resolve Fields's relationships with other enitites in board state.
   */
  setFieldObsticle(pos: FieldPos) {
    this.store.dispatch(setFieldObsticle({ pos }));
  }

  setFieldBox(pos: FieldPos) {
    this.store.dispatch(setFieldBox({ pos }));
  }

  /**
   * Doesnt resolve Fields's relationships with other enitites in board state.
   */
  clearParticlesList() {
    this.store.dispatch(clearParticlesList());
  }

  private setFieldParticle(unit: ParticleUnit) {
    // console.log(unit);

    this.store.dispatch(setFieldParticle({ unit }));
  }

  updateParticlesOnBoard(action: 'add' | 'del', unit: ParticleUnit) {
    action === 'add' ? this.store.dispatch(addParticleToList({ unit })) : this.store.dispatch(deleteParticleFromList({ pos: unit.pos }));
  }

  /**
   *
   */
  addNewParticle = (unit: ParticleUnit) => {
    this.setFieldEmpty(unit.pos);
    this.setFieldParticle(unit);

    // if (!!unit.groupId && unit.groupId.length > 0) {
    //   this.setParticleBroodBelonging(unit, unit.groupId);
    // }
    // console.log(unit);
    this.updateParticlesOnBoard('add', unit);
  };

  /**
   * Deletes a particle both from field (also UI) and from brood (if set any).
   */
  deleteUnit(pos: FieldPos) {
    this.removeBroodMember(pos);
    this.updateParticlesOnBoard('del', {
      pos,
      groupId: null,
      color: null,
      id: null,
      state: null,
      type: null,
    });
    this.setFieldEmpty(pos);
  }

  /**
   * Adds a brood to state and board (UI).
   * Doesn't check given units' positions validity.
   * Before that, it deletes any existing particles on new brood units' positions.
   */
  addBroodToList(brood: Brood) {
    brood.units.forEach((unit) => {
      this.deleteUnit(unit.pos);
      this.setFieldParticle(unit);
      this.setParticleBroodBelonging(unit, unit.groupId);
      this.addMemberToBroodUnits(unit);
      this.updateParticlesOnBoard('add', unit);
    });

    this.store.dispatch(addBroodToList({ brood }));
  }

  moveParticle(pos: FieldPos, newPos: FieldPos) {
    this.store.dispatch(moveParticleFromTo({ pos, newPos }));
  }

  /**
   * Adds existing particle as next member to a brood.
   * Doesn't update particle's belonging.
   */

  private addMemberToBroodUnits(unit: ParticleUnit) {
    this.store.dispatch(addMemberToBroodUnits({ unit }));
  }

  /**
   * Removes member from a brood.
   * Doesn't update particle's belonging.
   */
  private removeBroodMember(pos: FieldPos) {
    this.store.dispatch(removeBroodMember({ pos }));
  }

  /**
   * Overwrites brood member on member field position.
   * Doesn't update particle's belonging.
   */
  private swapBroodMemberOnPos(unit: ParticleUnit) {
    this.store.dispatch(swapBroodMemberOnPos({ unit }));
  }

  /**
   * Sets an existing particle's belonging to different brood and adds it to the brood units.
   */
  setParticleBroodBelonging(unit: ParticleUnit, groupId: string) {
    // 1. If unit already had set brood, remove it from that brood
    this.removeBroodMember(unit.pos);

    // 2. Update particle's internal groupId
    const updatedUnit = { ...unit, groupId };
    // console.log(updatedUnit);

    // 3. Update brood units
    this.swapBroodMemberOnPos(updatedUnit);
  }

  addNewBroodBSRRoot(id: string, potentialSpaces: ValidPotentialBroodSpace, color: ParticleColor) {
    if (potentialSpaces) {
      const broodId = id;
      const fallbackUnits: ParticleUnit[] = potentialSpaces.space.map((s, index) => {
        return new ParticleUnit(`${id}-${index}`, s.pos, color, broodId);
      });

      let brood = new Brood(broodId, fallbackUnits, color);

      this.addBroodToList(brood);
    }
  }

  addNewBroodOnContextmenu(id: string, pos: FieldPos, color: ParticleColor = 'red') {
    // const broodId = id;
    // const dimensions = BOARD_DIMENSIONS;
    // const fallbackUnits = [
    //   new ParticleUnit(
    //     `${id}-0`,
    //     {
    //       row: pos.row,
    //       column: pos.column,
    //     },
    //     color,
    //     broodId
    //   ),
    //   new ParticleUnit(
    //     `${id}-1`,
    //     {
    //       row: pos.row,
    //       column: pos.column + 1,
    //     },
    //     color,
    //     broodId
    //   ),
    //   new ParticleUnit(
    //     `${id}-2`,
    //     {
    //       row: pos.row + 1,
    //       column: pos.column,
    //     },
    //     color,
    //     broodId
    //   ),
    //   new ParticleUnit(
    //     `${id}-3`,
    //     {
    //       row: pos.row + 1,
    //       column: pos.column + 1,
    //     },
    //     color,
    //     broodId
    //   ),
    // ];

    // const units = fallbackUnits.filter((u) =>
    //   HELPERS.isFieldInBoardBoundries(dimensions, u.pos)
    // );
    // const brood = new Brood(broodId, units, color);
    const brood = HELPERS.getPreparedBroodBase(pos, id, color);
    this.addBroodToList(brood);
  }

  clearBroodsList() {
    this.store.dispatch(clearBroodsList());
  }

  getAllFields$() {
    return this.store.select(selectBoardFields);
  }

  getInitialFields(boardDimensions): BoardFields {
    return HELPERS.getInitialFields(boardDimensions);
  }

  getEmptyFields$() {
    return this.emptyFields$;
  }
}
