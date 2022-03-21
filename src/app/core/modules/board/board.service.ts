import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';

import { resetTurnCounter } from '@/src/app/core/state/game/game.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import { RootState } from '@/src/app/core/state/root-state.types';
import * as HELPERS from '@/src/app/shared/helpers/board.helpers';

import { Field, FieldMode, FieldPos } from '@/src/app/shared/types/board/field.types';
import { BoardFields, ValidPotentialGroupSpace } from '@/src/app/shared/types/board/board.types';
import { selectBoardFields, selectEmptyFields, selectValidGroupSpaces } from '@/src/app/core/state/board/board.selectors';
import { addGroupToList, loadBoardFields } from '@/src/app/core/state/board/actions/board.actions';
import {} from '@/src/app/shared/constants/board.constants';
import { BoardModule } from './board.module';
import { FieldService } from './services/field.service';
import { UnitsService } from './services/units.service';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { UnitColor } from '@/src/app/shared/types/board/unit-base.types';
import { Group } from '@/src/app/shared/types/board/group.types';
import { selectBoardDimensions } from '../../state/ui/ui.selectors';
import { takeUntil, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BoardService implements OnDestroy {
  selectBoardDimensions$ = this.store.select(selectBoardDimensions);
  fields$: Observable<BoardFields> = this.store.select(selectBoardFields).pipe(tap((fields) => (this.fields = fields)));
  fields: BoardFields = [];
  emptyFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  emptyBoardFields$: Observable<Field[]> = this.store.select(selectEmptyFields);
  validGroupSpaces$: Observable<ValidPotentialGroupSpace[]> = this.store.select(selectValidGroupSpaces);
  destroy$: Subject<void> = new Subject();

  boardDimensions = 0;
  emptyFieldsTotal = 0;

  constructor(public store: Store<RootState>, private fieldService: FieldService, private unitsService: UnitsService) {
    this.fields$.pipe(takeUntil(this.destroy$)).subscribe();

    this.selectBoardDimensions$.pipe(takeUntil(this.destroy$)).subscribe((d) => {
      this.boardDimensions = d;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reloadBoard(): void {
    this.store.dispatch(
      loadBoardFields({
        fields: this.getInitialFields(this.boardDimensions),
      })
    );

    this.unitsService.clearUnitsList();
    this.unitsService.clearGroupsList();
    this.store.dispatch(resetTurnCounter());
  }

  toggleField(field: Field): void {
    // console.log(field.mode);
    console.log(HELPERS.getFieldNeighbors(this.fields, field.pos));

    const prevMode = field.mode;

    switch (prevMode) {
      case 'empty':
        this.fieldService.setFieldObsticle(field.pos);
        break;

      case 'obsticle':
        const unit: Unit = new Unit(`solo${getRandom(1000)}`, field.pos, 'blue', undefined);
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
   * Doesn't update overwritten units or group states in store.
   */
  toggleBorders(boardDimensions: number, toggler: boolean): void {
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

  addUnitsRandomly(units = 1, obsticles = 0): void {
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

  moveUnit(pos: FieldPos, newPos: FieldPos): void {
    this.fieldService.moveUnit(pos, newPos);
  }

  /**
   * Adds a group to state and board (UI).
   * Doesn't check given units' positions validity.
   * Before that, it deletes any existing units on new group units' positions.
   */
  addGroupOntoBoard(group: Group): void {
    group.units.forEach((unit) => {
      this.deleteUnit(unit.pos);
      this.fieldService.setFieldUnit(unit);
      if (unit.groupId) {
        this.unitsService.setUnitGroupBelonging(unit, unit.groupId);
      }
      this.unitsService.addMemberToGroupUnits(unit);
      this.unitsService.updateUnitsList('add', unit);
    });

    this.store.dispatch(addGroupToList({ group }));
  }

  addNewGroupOnContextmenu(id: string, pos: FieldPos, color: UnitColor = 'red'): void {
    const group = HELPERS.getPreparedGroupBase(this.boardDimensions, pos, id, color);
    this.addGroupOntoBoard(group);
  }

  getAllFields$(): Observable<BoardFields> {
    return this.store.select(selectBoardFields);
  }

  private getInitialFields(boardDimensions: number): BoardFields {
    return HELPERS.getInitialFields(boardDimensions);
  }

  getEmptyFields$(): Observable<Field[]> {
    return this.emptyFields$;
  }

  putUnitOnEmptyFieldRandomly(type: FieldMode): void {
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

  addNewUnit(unit: Unit): void {
    this.fieldService.setFieldEmpty(unit.pos);
    this.fieldService.setFieldUnit(unit);
    this.unitsService.updateUnitsList('add', unit);
  }

  deleteUnit(pos: FieldPos): void {
    this.unitsService.removeGroupMember(pos);
    this.unitsService.updateUnitsList('del', {
      pos,
    });
    this.fieldService.setFieldEmpty(pos);
  }
}
