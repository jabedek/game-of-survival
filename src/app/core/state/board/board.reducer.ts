import { Action, createReducer, on } from '@ngrx/store';

import * as actions from '@/src/app/core/state/board/actions';
import { Field } from '@/src/app/shared/types/board/field.types';
import { BoardFields } from '@/src/app/shared/types/board/board.types';
import { Group } from '@/src/app/shared/types/board/group.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { BoardState } from './board.state';

export const initialBoardState: BoardState = {
  fields: [],
  unitsList: [],
  groupsList: [],
  builderMode: true,
};

export const boardReducer = createReducer(
  initialBoardState,

  // *** Units ***

  on(actions.boardActions.clearUnitsList, (state) => {
    return { ...state, unitsList: [] };
  }),

  on(actions.boardActions.addGroupToList, (state: BoardState, { group }) => {
    let groupsList: Group[] = [...state.groupsList].map((b) => b);
    groupsList = [...state.groupsList.map((b) => b), group];
    groupsList = [...groupsList].filter((b) => b.units.length > 0);

    return { ...state, groupsList };
  }),

  on(actions.boardActions.addUnitToList, (state, { unit }) => {
    // console.log(Array.from(new Set([...state.unitsList, unit])));

    const groupsList = [...state.groupsList].map((b) => {
      if (b.id === unit.groupId) {
        // b =
        let group = Object.assign({}, b);
        group.units = [...group.units, unit];
        b = group;
      }
      return b;
    });

    return { ...state, unitsList: Array.from(new Set([...state.unitsList, unit])), groupsList };
  }),

  on(actions.boardActions.deleteUnitFromList, (state, { pos }) => {
    const unitsList = [...state.unitsList].filter((p) => !(p.pos.row === pos.row && p.pos.column === pos.column));

    return { ...state, unitsList };
  }),

  on(actions.boardActions.clearGroupsList, (state) => {
    return { ...state, groupsList: [] };
  }),

  // *** BoardFields

  on(actions.boardActions.loadBoardFields, (state, { fields }) => {
    return { ...state, fields };
  }),

  on(actions.boardActions.setField, (state, { field }) => {
    const fields = [...state.fields].map((row) => {
      return row.map((f) => {
        if (f.pos.row === field.pos.row && f.pos.column === field.pos.column) {
          f = field;
        }

        return f;
      });
    });

    return { ...state, fields };
  }),

  on(actions.boardActions.toggleBuilderMode, (state) => {
    return { ...state, builderMode: !state.builderMode };
  }),

  on(actions.boardActions.moveUnitFromTo, (state, { pos, newPos }) => {
    const unit = { ...state.fields[pos.row][pos.column]?.occupyingUnit } as Unit;
    if (unit) {
      const field: Field = {
        ...state.fields[pos.row][pos.column],
        occupyingUnit: undefined,
        blocked: false,
        mode: 'empty',
      };

      const newField: Field = {
        ...state.fields[newPos.row][newPos.column],
        occupyingUnit: unit,
        blocked: true,
        mode: 'unit',
      };

      const fields = [...state.fields].map((row: Field[]) => {
        return row.map((cell: Field) => {
          if (cell.pos.row === pos.row && cell.pos.column === pos.column) return field;
          if (cell.pos.row === newPos.row && cell.pos.column === newPos.column) return newField;

          return cell;
        });
      });

      let groupsList = [...state.groupsList].map((b) => {
        let group: Group = Object.assign({}, b);

        const units = group.units.map((u) => {
          if (u.pos.row === pos.row && u.pos.column === pos.column) {
            // console.log('pos');

            const unit = {
              ...u,
              pos: { row: newPos.row, column: newPos.column },
            };
            u = unit;
          }
          return u;
        });

        //  group.units = group.units.filter(
        //    (u) => !(u.pos.row === pos.row && u.pos.column === pos.column)
        //  );

        group.units = units;
        // group.units = units;
        return group;
      });

      return { ...state, fields, groupsList };
    } else {
      return state;
    }
  }),

  on(actions.fieldActions.setFieldUnit, (state, { unit }) => {
    const { pos } = unit;

    const fields: BoardFields = [...state.fields].map((row: Field[]) =>
      row.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = {
            ...state.fields[pos.row][pos.column],
            blocked: true,
            occupyingUnit: unit,
            mode: 'unit',
          };
        }
        return field;
      })
    );

    return { ...state, fields };
  }),

  on(actions.fieldActions.setFieldsHighlightTrue, (state, { fieldsToHighLight }) => {
    let fields = [...state.fields].map((row: Field[]) => {
      return row.map((f) => f);
    });

    fieldsToHighLight.forEach((f) => {
      const { row, column } = f.pos;
      const field = {
        ...fields[row][column],
        highlightAccessibility: true,
      };
      // console.log(field);

      fields[row][column] = field;
    });
    // console.log(fieldsToHighLight);

    return { ...state, fields };
  }),

  on(actions.fieldActions.setAllFieldsHighlightFalse, (state) => {
    let fields = [...state.fields].map((row: Field[]) => {
      return row.map((f) => {
        return {
          ...f,
          highlightAccessibility: false,
        };
      });
    });

    return { ...state, fields };
  }),

  on(actions.fieldActions.setFieldObsticle, (state, { pos }) => {
    const fields: BoardFields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = {
            ...state.fields[pos.row][pos.column],
            blocked: true,
            mode: 'obsticle',
          };
        }
        return field;
      })
    );

    return { ...state, fields };
  }),

  on(actions.fieldActions.setFieldObject, (state, { pos }) => {
    const fields: BoardFields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = {
            ...state.fields[pos.row][pos.column],
            blocked: true,
            mode: 'other',
          };
        }
        return field;
      })
    );

    return { ...state, fields };
  }),

  /**
   * Sets field unblocked with occupying unit set toundefined, so it doesn't display any unit.
   */

  on(actions.fieldActions.setFieldEmpty, (state, { pos }) => {
    if (state.fields[pos.row] && state.fields[pos.row][pos.column]) {
      const previousField: Field = { ...state.fields[pos.row][pos.column] };

      let blocked: boolean;
      if (!!previousField?.occupyingUnit?.pos) {
        blocked = previousField.blocked;
      } else {
        blocked = !previousField.blocked;
      }

      const newField: Field = {
        ...previousField,
        blocked: false,
        occupyingUnit: undefined,
        mode: 'empty',
      };

      const fields: BoardFields = [...state.fields].map((data: Field[]) =>
        data.map((field: Field) => {
          if (field.pos.column === pos.column && field.pos.row === pos.row) {
            field = { ...newField };
          }
          return field;
        })
      );

      let groupsList: Group[] = [...state.groupsList].map((p) => p);

      /**
       * Check if it was unit and if was in group then delete it from there
       */
      if (!!previousField.occupyingUnit && previousField.occupyingUnit?.groupId) {
        const { occupyingUnit } = previousField;

        // brzydki syntax ale ngrx nie przepuści bez skopiowania obiektu / tablicy
        let indexToUpdate = -1;
        const groupToUpdate = {
          ...[...state.groupsList].find((br: Group, index) => {
            indexToUpdate = index;
            return br.id === occupyingUnit.groupId;
          }),
        } as Group;

        if (groupToUpdate && groupToUpdate.units) {
          groupToUpdate.units = groupToUpdate.units?.filter((u) => u.pos !== occupyingUnit.pos);

          groupsList[indexToUpdate] = groupToUpdate;
        }
      }

      return { ...state, groupsList, fields };
    } else return state;
  }),

  // *** Groups
  /**
   * Only updates info in a group.
   * Doesn't update unit on a field on its own.
   */

  on(actions.groupActions.removeGroupMember, (state, { pos }) => {
    let groupsList = [...state.groupsList].map((b) => {
      let group = Object.assign({}, b);

      group.units = group.units.filter((u) => !(u.pos.row === pos.row && u.pos.column === pos.column));

      return group;
    });

    groupsList = groupsList.filter((b) => b.units.length !== 0);

    return { ...state, groupsList };
  }),

  on(actions.groupActions.addMemberToGroupUnits, (state, { unit }) => {
    let groupsList = [...state.groupsList].map((b) => b);
    let groupToUpdate = undefined;
    groupsList.forEach((b) => {
      if (b.id === unit.groupId) {
        groupToUpdate = { ...b };

        let overwritten = false;
        groupToUpdate.units.forEach((u) => {
          if (u.pos === unit.pos) {
            u = unit;
            overwritten = true;
          }
        });

        if (!overwritten) {
          let newUnits = [...groupToUpdate.units].map((u) => u);
          newUnits.push({ ...unit });

          groupToUpdate.units = newUnits;
        }
      }
      return b;
    });

    return { ...state, groupsList };
  }),

  on(actions.groupActions.swapGroupMemberOnPos, (state, { unit }) => {
    // console.log(unit);

    const groupsList = [...state.groupsList].map((b) => {
      const group: Group = Object.assign({}, b);

      group.units.forEach((u) => {
        // console.log(u);

        if (u.pos.row === unit.pos.row && u.pos.column === unit.pos.column) {
          u = unit;
          // console.log(u);
        }
      });

      return b;
    });

    return { ...state, groupsList };
  })
);
