import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as uuid from 'uuid';
import { selectEmptyFields, selectBroodSpaces, selectBoardFields } from '.';
import {
  AppState,
  BoardDynamicCSS,
  BoardDynamicCSS_structurings,
  BroodSpace,
  Field,
  FieldPos,
  FieldReference,
  Fields,
  Unit,
} from '../shared/types-interfaces';
import {
  loadFields,
  setFieldEmpty,
  setFieldObsticle,
  setFieldParticle,
} from './board.actions';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor(public store: Store<AppState>) {}

  fields$: Observable<Fields> = this.store.select(selectBoardFields);

  emptyBoardFields$: Observable<Field[]> = this.store.select(selectEmptyFields);

  broodSpaces$: Observable<BroodSpace[]> = this.store.select(selectBroodSpaces);

  getStylingsDetails(
    boardDimensions: number,
    fieldSize: number
  ): BoardDynamicCSS {
    return {
      sizings: this.getPxSizings(boardDimensions, fieldSize),
      structurings: this.getBoardLayoutStructurings(boardDimensions, fieldSize),
    };
  }

  private getBoardSize_CSSpx(
    boardDimensions: number,
    fieldSize: number
  ): string {
    return `${boardDimensions * fieldSize}px`;
  }

  private getFieldSize_CSSpx(fieldSize: number): string {
    return `${fieldSize}px`;
  }

  private getPxSizings(boardDimensions: number, fieldSize: number) {
    return {
      boardSize_px: this.getBoardSize_CSSpx(boardDimensions, fieldSize),
      fieldSize_px: this.getFieldSize_CSSpx(fieldSize),
    };
  }

  private getBoardLayoutStructurings(
    boardDimensions: number,
    fieldSize: number
  ): BoardDynamicCSS_structurings {
    return {
      display: 'grid',
      'grid-template-columns': `repeat(${boardDimensions}, ${this.getFieldSize_CSSpx(
        fieldSize
      )})`,
      'grid-template-rows': `repeat(${boardDimensions}, ${this.getFieldSize_CSSpx(
        fieldSize
      )})`,
      width: ` ${this.getBoardSize_CSSpx(boardDimensions, fieldSize)}`,
      height: ` ${this.getBoardSize_CSSpx(boardDimensions, fieldSize)}`,
    };
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

  setSomeUnits(amount: number, type: 'particle' | 'obsticle'): void {
    if (type === 'particle') {
      for (let i = 0; i < amount; i++) {
        this.putUnitOnEmptyField('particle');
      }
    }

    if (type === 'obsticle') {
      for (let i = 0; i < amount; i++) {
        this.putUnitOnEmptyField('obsticle');
      }
    }
  }

  addUnits(particles = 1, obsticles = 0) {
    this.setSomeUnits(particles, 'particle');
    this.setSomeUnits(obsticles, 'obsticle');
  }

  private putUnitOnEmptyField(type) {
    let success = false;
    let newUnit: Unit = null;
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
                const unit: Unit = {
                  pos: rndmlySelectedField.pos,
                  id: 'animalien-0',
                  groupId: 'animaliens',
                };

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
