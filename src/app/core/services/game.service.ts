import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BoardService } from '@/src/app/core/modules/board/board.service';

import * as HELPERS from '@/src/app/shared/helpers/board.helpers';
import * as CONSTS from '@/src/app/shared/constants/board.constants';

import { Observable, of, Subscription } from 'rxjs';
import {
  selectAllUnitsNeighborsAndGroupsList,
  selectAvailableFieldsAndSpaces,
  selectBoard,
  selectBoardFields,
  selectBoardSnapshot,
  selectUnitsAndGroups,
  selectUnitsNeighbors,
} from '@/src/app/core/state/board/board.selectors';
import { countTurn, loadChangesAfterTurn, setError, setTurnPhase } from '@/src/app/core/state/game/game.actions';
import { getRandom } from '@/src/app/shared/helpers/common.helpers';

import { RootState } from '@/src/app/core/state/root-state.types';
import { GameTurnPhase, TurnUpdate } from '@/src/app/shared/types/game.types';
import { Field } from '@/src/app/shared/types/board/field.types';
import { BoardFields, NeighborsAndGroups, NeighborsRaport, ValidPotentialGroupSpace } from '@/src/app/shared/types/board/board.types';
import { CoreModule } from '../core.module';
import { UnitsService } from '../modules/board/services/units.service';
import { UnitBase, UnitType, UnitColor } from '../../shared/types/board/unit-base.types';
import { Unit } from '../../shared/types/board/unit.types';
import { Group } from '../../shared/types/board/group.types';
import { first } from 'rxjs/operators';
import { areTwoPositionsEqual } from '../../shared/helpers/board.helpers';
import { SimulationService } from '../../features/simulation/simulation.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  // Observables
  fields$: Observable<BoardFields> = this.store.select(selectBoardFields);
  unitsAndGroups$ = this.store.select(selectUnitsAndGroups);
  availableFieldsAndSpaces$ = this.store.select(selectAvailableFieldsAndSpaces);
  boardSnapshot$ = this.store.select(selectBoardSnapshot);
  boardState$ = this.store.select(selectBoard);
  // Observable data
  // unitsList: Unit[] = [];
  // groupsList: Group[] = [];
  // emptyFields: Field[] = [];
  // validGroupSpaces: ValidPotentialGroupSpace[] =undefined;

  // Subscriptions
  subscription: Subscription = new Subscription();

  groupId = '';

  constructor(public store: Store<RootState>, public boardService: BoardService) {
    this.testingFreezes();
  }

  addNewUnitToGroup = (unit: Unit) => {
    this.addNewUnit(unit);
  };

  addNewUnit = (unit: Unit) => {};

  nextTurn(groups: Group[]): void {
    groups.forEach((group) => this.nextTurnSingle(group));
  }

  nextTurnSingle(group: Group): void {
    this.store.dispatch(setTurnPhase({ phase: GameTurnPhase.PENDING }));
    this.store
      .select(selectUnitsNeighbors, group.units)
      .pipe(first())
      .subscribe((data) => {
        group.beginTurn({
          neighbors: data,
          cb: this.addNewUnitToGroup,
        });
      });
    // .unsubscribe();
  }

  computeResults(): void {
    this.fields$.pipe(first()).subscribe((data: BoardFields) => {
      if (data) {
        this.store
          .select(selectAllUnitsNeighborsAndGroupsList, data)
          .pipe(first())
          .subscribe((data2: NeighborsAndGroups) => {
            // Get all units' neighbors then update board
            const update: TurnUpdate = this.gatherUpdateInfo(data2.groupsList, data2.fieldsNeighbors);
            this.updateBoard(update);
          });
      }
    });

    // 3. update board
  }

  gatherUpdateInfo(groupsList: Group[], neighbors: NeighborsRaport[]) {
    let unitsToAdd: Unit[] = [];
    let unitsToDel: Unit[] = [];

    // 2. prepare Update and filter units based on their neighbors amount
    neighbors.forEach((n: NeighborsRaport) => {
      const centerField = n.centerField;
      const unitType = centerField?.occupyingUnit?.type;
      console.log(n);

      if (!unitType || unitType !== 'void') {
        switch (n.units.length) {
          // SECTION: REPRO
          case 0: {
            if (this.willSpawn(groupsList, n, 1, true)) {
              unitsToAdd = this.updateUnitsToAdd(n, unitsToAdd);
              // console.log('case 0',centerField.pos, unitsToAdd);
            }
            break;
          }
          case 1: {
            if (this.willSpawn(groupsList, n, 10)) {
              unitsToAdd = this.updateUnitsToAdd(n, unitsToAdd);
              // console.log('case 1',centerField.pos, unitsToAdd);
            }
            break;
          }
          case 2: {
            if (this.willSpawn(groupsList, n, -2)) {
              unitsToAdd = this.updateUnitsToAdd(n, unitsToAdd);
              // console.log('case 2',centerField.pos, unitsToAdd);
            }
            break;
          }
          // SECTION: DYING
          case 3:
          case 4: {
            const unit = centerField?.occupyingUnit;
            if (unit) {
              unitsToDel.push(unit);
            }
            break;
          }
          default: {
            const unit = centerField?.occupyingUnit;
            if (unit) {
              unitsToDel.push(unit);
            }
            break;
          }
        }
      }

      let updatedN = { ...n };

      if (updatedN.accessible.length > 0) {
        updatedN.accessible = updatedN.accessible.filter((f) => {
          return !unitsToAdd.find((u: UnitBase) => u.pos === f.field?.pos);
        });
      }

      /**
       * Void units appear randomly and can't multiply or die due to neighbors presence.
       * In general the more units are on board the more often voids will spawn.
       */
      const voidSpawn = getRandom(1600) === 1;

      if (voidSpawn) {
        const voidUnit = this.getNewMember(n, undefined, true);
        if (voidUnit) {
          unitsToAdd.push(voidUnit);
        }
      }
    });

    return { unitsToAdd, unitsToDel: unitsToDel.map((u) => u.pos) };
  }

  testingFreezes() {
    const boardFields: BoardFields = [];
    const dimensions = 9;
    const groupNames: UnitColor[] = ['red', 'blue', 'green'];

    for (let row = 0; row < dimensions; row++) {
      const rowFields: Field[] = [];
      for (let column = 0; column < dimensions; column++) {
        const blocked = !!getRandom(2);
        const pos = {
          row,
          column,
        };
        const groupName = row / column === 0 ? groupNames[1] : row / column < 0 ? groupNames[0] : groupNames[2];
        const occupyingUnit: Unit = {
          id: `${groupName}${getRandom(1000)}`,
          groupId: groupName,
          pos,
          color: groupName,
          type: 'regular' as UnitType,
          state: undefined,
        };

        let neighbors: NeighborsRaport | undefined;

        const field: Field = {
          pos,
          blocked,
          mode: blocked ? 'unit' : 'empty',
          occupyingUnit: blocked ? occupyingUnit : undefined,
          highlightAccessibility: false,
          // neighbors: undefined,
        };

        rowFields.push(field);
      }
      boardFields.push(rowFields);
    }

    const neighborsRaports: NeighborsRaport[] = [];

    for (let row = 0; row < dimensions; row++) {
      for (let column = 0; column < dimensions; column++) {
        const field = boardFields[row][column];
        // field.neighbors = field.blocked ? HELPERS.getFieldNeighbors(boardFields, field.pos) : undefined;
        // if (field.neighbors) {
        //   neighborsRaports.push(field.neighbors);
        // }
      }
    }

    console.log(boardFields);

    let unitsToAdd: Unit[] = [];
    let unitsToDel: Unit[] = [];
  }

  private updateUnitsToAdd(neighborsRaport: NeighborsRaport, unitsToAdd: Unit[]): Unit[] {
    let added = false;
    // let unit: Unit | undefined;

    let counter = 0;
    while (!added) {
      const unit: Unit | undefined = this.getNewMember(neighborsRaport, neighborsRaport.centerField?.occupyingUnit?.groupId);
      if (unit && unit.pos) {
        // console.log('WHILE !added unit && unit.pos');
        counter++;
        // const posAlreadyTaken: Unit | undefined = unitsToAdd.find((u) => areTwoPositionsEqual(u.pos, unit.pos));

        if (counter > 25) {
          console.log(counter);

          console.log(JSON.stringify(neighborsRaport, null, '\t'));
          console.log(JSON.stringify(unitsToAdd, null, '\t'));
          console.log(JSON.stringify(unit, null, '\t'));
          this.store.dispatch(setError({ isError: true }));
          throw Error('COUNTER > 15');
        }
        const posAlreadyTaken: Unit | undefined = unitsToAdd.find((u) => u.pos.row === unit.pos.row && u.pos.column === unit.pos.column);

        if (!posAlreadyTaken) {
          // console.log('WHILE !added !posAlreadyTaken');

          unitsToAdd.push(unit);
          added = true;
        }
      }
    }
    // console.log('WHILE !added FINISHED');

    return unitsToAdd;
  }

  private getNewMember(n: NeighborsRaport, forcedGroupId?: string, voidUnit?: boolean): Unit | undefined {
    const field = n.centerField;

    let groupId = forcedGroupId || field?.occupyingUnit?.groupId;
    groupId = voidUnit ? undefined : groupId;

    const id = voidUnit ? 'voider' : `${groupId}-${getRandom(100)}` || 'randomer';

    let color = (field?.occupyingUnit as Unit)?.color || 'blue';
    color = voidUnit ? 'black' : color;

    const type: UnitType = voidUnit ? 'void' : 'regular';

    if (n.accessible.length > 0) {
      const pos = n.accessible[getRandom(n.accessible.length)].field?.pos;

      if (pos) {
        return new Unit(id, pos, color, groupId, undefined, type);
      }
    }

    return undefined;
  }

  private willSpawn(groupsList: Group[], n: NeighborsRaport, bonus = 0, noNeighbors?: boolean): boolean {
    const centerField = n.centerField;

    if (centerField) {
      const group = groupsList.find((b) => b.units.find((u) => areTwoPositionsEqual(u.pos, centerField.pos)));

      const groupStrength = group?.units?.length || 0;
      const rnd = getRandom(CONSTS.RANDOM_ADDITIONAL_LIMIT, true);
      const base = noNeighbors ? 0 : CONSTS.BASE_CHANCES_TO_PARTICLE_MULTIPLY_WITH_NEIGHBORS;
      const probability = Math.round(base + rnd + groupStrength);

      let probArray: boolean[] = Array(100);
      for (let i = 0; i < probArray.length; i++) {
        probArray[i] = !!(i < probability + bonus); // ? true : false;
      }

      return probArray[getRandom(100)];
    } else {
      return false;
    }
  }

  updateBoard(update: TurnUpdate): void {
    if (update) {
      update.unitsToDel.forEach((u) => {
        this.boardService.deleteUnit(u);
      });

      update.unitsToAdd.forEach((u) => {
        this.boardService.addNewUnit(u);
      });
    }

    this.store.dispatch(countTurn());
    this.store.dispatch(loadChangesAfterTurn({ update }));
    this.store.dispatch(setTurnPhase({ phase: GameTurnPhase.ALL_DONE }));
  }
}
