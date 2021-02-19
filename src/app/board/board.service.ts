import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as uuid from 'uuid';
import {
  selectEmptyFields,
  selectBoardFields,
  selectValidBroodSpaces,
} from '.';
import {
  AppState,
  BoardDynamicCSS,
  BoardDynamicCSS_structurings,
  BroodSpace,
  ValidPotentialBroodSpace,
  Field,
  FieldPos,
  FieldReference,
  Fields,
  Unit,
  ParticleUnit,
} from '../shared/types-interfaces';
import {
  loadFields,
  setFieldEmpty,
  setFieldObsticle,
  setFieldParticle,
} from './board.actions';
import { getBoardLayoutStructurings, getPxSizings } from './board.helpers';

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
      sizings: getPxSizings(boardDimensions, fieldSize),
      structurings: getBoardLayoutStructurings(boardDimensions, fieldSize),
    };
  }

  getAllFields$() {
    return this.store.select(selectBoardFields);
  }

  getInitialBoard(boardDimensions): FieldReference[][] {
    let board: FieldReference[][] = [];
    for (let x = 0; x < boardDimensions; x++) {
      board[x] = [];
      for (let y = 0; y < boardDimensions; y++) {
        board[x][y] = `${x}:${y}`;
      }
    }

    return board;
  }

  getEmptyFields$() {
    return this.emptyFields$;
  }

  initFields(boardDimensions): Fields {
    let fields: Fields = [];

    for (let row = 0; row < boardDimensions; row++) {
      fields[row] = [];
      for (let column = 0; column < boardDimensions; column++) {
        fields[row][column] = new Field({ row, column }, false);
      }
    }

    return fields;
  }

  initEmptyFields(boardDimensions): Fields {
    const fields = this.initFields(boardDimensions);
    this.store.dispatch(loadFields({ fields }));
    return fields;
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

  setSomeUnits(amount: number, type: 'particle' | 'obsticle'): void {}

  addUnits(particles = 1, obsticles = 0) {
    if (particles > 0) {
      for (let i = 0; i < particles; i++) {
        this.putUnitOnEmptyField('particle');
      }
    }

    if (obsticles > 0) {
      for (let i = 0; i < obsticles; i++) {
        this.putUnitOnEmptyField('obsticle');
      }
    }
  }

  private putUnitOnEmptyField(type) {
    let success = false;
    let newUnit: ParticleUnit = null;
    let board: Field[] = [];

    this.store
      .select(selectEmptyFields)
      .subscribe((data: Field[]) => {
        board = data;

        if (board.length) {
          while (!success) {
            const rndmlySelectedField =
              board[Math.floor(Math.random() * board.length)];

            if (!rndmlySelectedField.blocked) {
              if (type === 'particle') {
                const unit: ParticleUnit = new ParticleUnit(
                  'animalien-0',
                  rndmlySelectedField.pos,
                  'black',
                  'animaliens'
                );

                newUnit = unit;
                success = true;
                this.store.dispatch(setFieldParticle({ unit: newUnit }));
              }
              if (type === 'obsticle') {
                success = true;

                this.store.dispatch(
                  setFieldObsticle({ pos: rndmlySelectedField.pos })
                );
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
}
