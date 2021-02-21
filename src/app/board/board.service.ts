import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectEmptyFields,
  selectBoardFields,
  selectValidBroodSpaces,
} from '.';
import {
  AppState,
  BoardDynamicCSS,
  ValidPotentialBroodSpace,
  Field,
  FieldPos,
  FieldReference,
  Fields,
  ParticleUnit,
  Brood,
  ParticleColor,
} from '../shared/types-interfaces';
import {
  addBroodToList,
  addMemberToBroodUnits,
  removeBroodMember,
  loadFields,
  setFieldEmpty,
  setFieldObsticle,
  setFieldParticle,
  swapBroodMemberOnPos,
  addParticleToList,
  deleteParticleFromList,
  clearParticles,
  clearBroods,
} from './board.actions';
import { BOARD_DIMENSIONS } from './board.constants';
import * as HELPERS from './board.helpers';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor(public store: Store<AppState>) {}

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

  toggleBorders2(boardDimensions: number, toggler) {
    const borderObsticlesUp = !toggler;

    let newFields: Fields = [];

    this.fields$.subscribe((fieldsData) => {
      newFields = fieldsData.map((data: Field[], row) =>
        data.map((field: Field, column) => {
          if (
            row == 0 ||
            column == 0 ||
            row == boardDimensions - 1 ||
            column == boardDimensions - 1
          ) {
            if (borderObsticlesUp) {
              field = {
                ...field,
                occupyingUnit: null,
                blocked: true,
              };
            } else {
              field = {
                ...field,
                occupyingUnit: null,
                blocked: false,
              };
            }
          }

          return field;
        })
      );
    });

    this.store.dispatch(loadFields({ fields: newFields }));
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
      const column = Math.floor(Math.random() * boardDimensions);
      const row = Math.floor(Math.random() * boardDimensions);

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
    let newUnit: ParticleUnit = null;
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
        }
      })
      .unsubscribe();
  }

  // # FIELD

  private setFieldEmpty(pos: FieldPos) {
    this.store.dispatch(setFieldEmpty({ pos }));
  }

  setFieldObsticle(pos: FieldPos) {
    this.store.dispatch(setFieldObsticle({ pos }));
  }

  // # PARTICLE (& FIELD)
  private setFieldParticle(unit: ParticleUnit) {
    this.store.dispatch(setFieldParticle({ unit }));
  }

  updateParticlesOnBoard(action: 'add' | 'del', unit: ParticleUnit) {
    action === 'add'
      ? this.store.dispatch(addParticleToList({ unit }))
      : this.store.dispatch(deleteParticleFromList({ pos: unit.pos }));
  }

  clearParticles() {
    this.store.dispatch(clearParticles());
  }

  /**
   *
   */
  addNewParticle(unit: ParticleUnit) {
    this.setFieldEmpty(unit.pos);
    this.setFieldParticle(unit);
    this.updateParticlesOnBoard('add', unit);

    if (!!unit.groupId && unit.groupId.length > 0) {
      this.setParticleBroodBelonging(unit, unit.groupId);
    }
  }

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
    // console.log('addBroodToList');

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
          return new ParticleUnit(`${index}`, s.pos, color, broodId);
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
        `0`,
        {
          row: pos.row,
          column: pos.column,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `1`,
        {
          row: pos.row,
          column: pos.column + 1,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `2`,
        {
          row: pos.row + 1,
          column: pos.column,
        },
        color,
        broodId
      ),
      new ParticleUnit(
        `3`,
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

  clearBroods() {
    this.store.dispatch(clearBroods());
  }
}
