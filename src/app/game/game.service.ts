import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  initFields,
  setFieldBlockedFalse,
  setFieldBlockedTrue,
  setFieldOccupyingUnitNull,
  setFieldsUnblocked,
  setOccupyingUnit,
} from '../board/board.actions';
import { BOARD_DIMENSIONS, FIELD_SIZE } from '../board/board.constants';
import { ParticleUnit } from '../shared/models';
import {
  AppState,
  Brood,
  BroodSpace,
  Field,
  FieldPos,
  Fields,
  Unit,
} from '../shared/types-interfaces';

import * as uuid from 'uuid';
import { selectAvailableFieldsTotal, selectBroodSpaces } from '../board';
import { Observable, Subscription } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class GameService {
  boardDimensions = BOARD_DIMENSIONS;
  fieldSize = FIELD_SIZE;
  fields: Fields = [];
  currentFieldTurnId: string;
  availableBoardFields$: Observable<Field[]> = this.store.select(
    selectAvailableFieldsTotal
  );

  broodSpaces$: Observable<any[]> = this.store.select(selectBroodSpaces);

  subscription: Subscription = new Subscription();
  fieldsPositions: FieldPos[][] = [];
  borderObsticlesUp = false;

  constructor(public store: Store<AppState>) {
    this.subscription.add(
      this.store
        .select(selectBroodSpaces)
        .subscribe((data) => console.log(data))
    );
  }

  initFieldsPositions(): FieldPos[][] {
    for (let i = 0; i < BOARD_DIMENSIONS; i++) {
      this.fieldsPositions[i] = [];
      for (let j = 0; j < BOARD_DIMENSIONS; j++) {
        this.fieldsPositions[i][j] = { row: i, column: j };
      }
    }

    return this.fieldsPositions;
  }

  initFieldsData(): Fields {
    for (let i = 0; i < this.boardDimensions; i++) {
      this.fields[i] = [];
      for (let j = 0; j < this.boardDimensions; j++) {
        this.fields[i][j] = new Field({ column: i, row: j }, false);
      }
    }

    // this.store.dispatch(initFields({ fields: this.fields }));
    return this.fields;
  }

  startGame() {
    this.currentFieldTurnId = this.fields[0][0]?.occupyingUnit?.id;
    console.log(this.currentFieldTurnId);
  }

  setSomeUnits(): void {
    // const brood: Brood = {
    //   id: 's',
    //   name: 'froggo-jumper',
    //   units: [],
    //   color: 'rgba(0, 0, 0, 0)',
    // };
    // let done = false;
    this.putUnitOnUnblockedField();
    // this.putUnitOnUnblockedField();
    // this.putUnitOnUnblockedField();
  }

  putUnitOnUnblockedField() {
    let success = false;
    let newUnit: Unit = null;
    let board: Field[] = [];

    this.store
      .select(selectAvailableFieldsTotal)
      .subscribe((data: Field[]) => {
        board = data;

        if (board.length) {
          while (!success) {
            const rndmlySelectedField =
              board[Math.floor(Math.random() * board.length)];

            if (!rndmlySelectedField.blocked) {
              const unit: Unit = {
                id: uuid.v4(),
                pos: rndmlySelectedField.pos,
                name: 'animalien',
                groupId: uuid.v4(),
              };

              newUnit = unit;
              success = true;
              this.store.dispatch(setOccupyingUnit({ unit: newUnit }));
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

  toggleBorders(): void {
    this.borderObsticlesUp = !this.borderObsticlesUp;

    for (let row = 0; row < BOARD_DIMENSIONS; row++) {
      for (let column = 0; column < BOARD_DIMENSIONS; column++) {
        if (
          row == 0 ||
          column == 0 ||
          row == BOARD_DIMENSIONS - 1 ||
          column == BOARD_DIMENSIONS - 1
        ) {
          const pos: FieldPos = { row, column };
          let actionTrue = setFieldBlockedTrue({ pos });
          let actionFalse = setFieldBlockedFalse({ pos });

          let actionResult = this.borderObsticlesUp ? actionTrue : actionFalse;

          this.store.dispatch(setFieldOccupyingUnitNull({ pos }));
          this.store.dispatch(actionResult);
        }
      }
    }
  }

  reloadFields() {
    this.borderObsticlesUp = false;
    this.store.dispatch(setFieldsUnblocked());

    this.toggleBorders();
    this.borderObsticlesUp = true;
    this.setSomeBlockades();
    this.setSomeUnits();
  }

  setSomeBlockades(): void {
    let totalBlockades = Math.floor((BOARD_DIMENSIONS * BOARD_DIMENSIONS) / 8);
    totalBlockades = 4;

    for (let i = 0; i < totalBlockades; i++) {
      const column = Math.floor(Math.random() * BOARD_DIMENSIONS);
      const row = Math.floor(Math.random() * BOARD_DIMENSIONS);

      this.store.dispatch(setFieldBlockedTrue({ pos: { row, column } }));
    }
  }
}
