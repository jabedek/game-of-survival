import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectEmptyFields,
  selectBoardFields,
  selectValidBroodSpaces,
} from './board.selectors';

import {
  addBroodToList,
  addParticleToList,
  deleteParticleFromList,
  clearParticlesList,
  clearBroodsList,
  loadBoardFields,
} from './board.actions';
import { BOARD_DIMENSIONS } from './board.constants';
import * as HELPERS from './board.helpers';
import {
  addMemberToBroodUnits,
  removeBroodMember,
  swapBroodMemberOnPos,
} from './brood.actions';
import {
  setFieldEmpty,
  setFieldObsticle,
  setFieldParticle,
} from './field/field.actions';
import { resetTurnCounter } from '../game/game.actions';
import { getRandom } from '../shared/helpers';
import { RootState } from '../root-state';
import {
  BoardDynamicCSS,
  Brood,
  Field,
  FieldPos,
  FieldReference,
  Fields,
  ParticleColor,
  ParticleUnit,
  ValidPotentialBroodSpace,
} from './types-interfaces';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor(public store: Store<RootState>) {}

  fields$: Observable<Fields> = this.store.select(selectBoardFields);
  emptyFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  emptyFieldsTotal = 0;

  emptyBoardFields$: Observable<Field[]> = this.store.select(selectEmptyFields);

  validBroodSpaces$: Observable<ValidPotentialBroodSpace[]> = this.store.select(
    selectValidBroodSpaces
  );

  getStylingsDetails(
    boardDimensions: number,
    fieldSize: number
  ): BoardDynamicCSS {
    return {
      sizings: HELPERS.getPxSizings(boardDimensions, fieldSize),
      structurings: HELPERS.getBoardLayoutStructurings(
        boardDimensions,
        fieldSize
      ),
    };
  }

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
    const redBrood: Brood = new Brood(
      'reds',
      [
        new ParticleUnit('reds-0', { row: 0, column: 0 }, 'red', 'reds'),
        new ParticleUnit('reds-0', { row: 0, column: 1 }, 'red', 'reds'),
      ],
      'red'
    );

    const blueBrood: Brood = new Brood(
      'blues',
      [
        new ParticleUnit(
          'blues-0',
          { row: BOARD_DIMENSIONS - 1, column: BOARD_DIMENSIONS - 1 - 1 },
          'blue',
          'blues'
        ),
        new ParticleUnit(
          'blues-0',
          { row: BOARD_DIMENSIONS - 1, column: BOARD_DIMENSIONS - 1 },
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

    console.log(redBrood, blueBrood, greenBrood);

    this.addBroodToList(redBrood);
    this.addBroodToList(blueBrood);
    this.addBroodToList(greenBrood);

    // this.boardService.
  }

  toggleBorders(boardDimensions: number, toggler): void {
    const borderObsticlesUp = !toggler;

    for (let row = 0; row < boardDimensions; row++) {
      for (let column = 0; column < boardDimensions; column++) {
        if (
          row == 0 ||
          column == 0 ||
          row == boardDimensions - 1 ||
          column == boardDimensions - 1
        ) {
          const pos: FieldPos = { row, column };
          let actionTrue = setFieldObsticle({ pos });
          let actionFalse = setFieldEmpty({ pos });

          borderObsticlesUp
            ? this.store.dispatch(actionTrue)
            : this.store.dispatch(actionFalse);
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
            const rndIndex = Math.floor(Math.random() * board.length);
            const rndmlySelectedField = board[rndIndex];

            if (!rndmlySelectedField.blocked) {
              if (type === 'particle') {
                success = true;
                this.addNewParticle(
                  new ParticleUnit(
                    `randomiton-${rndIndex}`,
                    rndmlySelectedField.pos,
                    'black',
                    'randomitons'
                  )
                );
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

  /**
   * Doesnt resolve Fields's relationships with other enitites in board state.
   */
  clearParticlesList() {
    this.store.dispatch(clearParticlesList());
  }

  private setFieldParticle(unit: ParticleUnit) {
    this.store.dispatch(setFieldParticle({ unit }));
  }

  updateParticlesOnBoard(action: 'add' | 'del', unit: ParticleUnit) {
    action === 'add'
      ? this.store.dispatch(addParticleToList({ unit }))
      : this.store.dispatch(deleteParticleFromList({ pos: unit.pos }));
  }

  /**
   *
   */
  addNewParticle = (unit: ParticleUnit) => {
    this.setFieldEmpty(unit.pos);
    this.setFieldParticle(unit);
    this.updateParticlesOnBoard('add', unit);

    if (!!unit.groupId && unit.groupId.length > 0) {
      this.setParticleBroodBelonging(unit, unit.groupId);
    }
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

    // 3. Update brood units
    this.swapBroodMemberOnPos(updatedUnit);
  }

  addNewBroodBSRRoot(
    id: string,
    potentialSpaces: ValidPotentialBroodSpace,
    color: ParticleColor
  ) {
    if (potentialSpaces) {
      const broodId = id;
      const fallbackUnits: ParticleUnit[] = potentialSpaces.space.map(
        (s, index) => {
          return new ParticleUnit(`${id}-${index}`, s.pos, color, broodId);
        }
      );

      let brood = new Brood(broodId, fallbackUnits, color);

      this.addBroodToList(brood);
    }
  }

  addNewBroodOnContextmenu(
    id: string,
    pos: FieldPos,
    color: ParticleColor = 'red'
  ) {
    const broodId = id;
    const dimensions = BOARD_DIMENSIONS;
    const fallbackUnits = [
      new ParticleUnit(
        `${id}-0`,
        {
          row: pos.row,
          column: pos.column,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `${id}-1`,
        {
          row: pos.row,
          column: pos.column + 1,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `${id}-2`,
        {
          row: pos.row + 1,
          column: pos.column,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `${id}-3`,
        {
          row: pos.row + 1,
          column: pos.column + 1,
        },
        color,
        broodId
      ),
    ];

    const units = fallbackUnits.filter((u) =>
      HELPERS.isInBoundries(dimensions, u.pos)
    );
    const brood = new Brood(broodId, units, color);

    this.addBroodToList(brood);
  }

  clearBroodsList() {
    this.store.dispatch(clearBroodsList());
  }

  getAllFields$() {
    return this.store.select(selectBoardFields);
  }

  getInitialBoard(boardDimensions): FieldReference[][] {
    return HELPERS.getInitialBoard(boardDimensions);
  }

  getInitialFields(boardDimensions): Fields {
    return HELPERS.getInitialFields(boardDimensions);
  }

  getEmptyFields$() {
    return this.emptyFields$;
  }
}
