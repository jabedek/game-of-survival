import { Action, createReducer, on } from '@ngrx/store';

import * as actions from '@/src/app/core/state/board/actions';
import { Field } from '@/src/app/shared/types/board/field.types';
import { BoardFields } from '@/src/app/shared/types/board/board.types';
import { BoardState } from '../root-state.types';
import { Brood } from '@/src/app/shared/types/board/brood.types';

export const initialBoardState: BoardState = {
  fields: [],
  unitsList: [],
  broodsList: [],
  builderMode: true,
};

export const boardReducer = createReducer(
  initialBoardState,

  // *** Units ***
  on(actions.boardActions.clearUnitsList, (state) => {
    return {
      ...state,
      unitsList: [],
    };
  }),
  on(actions.boardActions.addBroodToList, (state: BoardState, { brood }) => {
    let broodsList: Brood[] = [...state.broodsList].map((b) => b);
    broodsList = [...state.broodsList.map((b) => b), brood];
    broodsList = [...broodsList].filter((b) => b.units.length > 0);

    return {
      ...state,
      broodsList,
    };
  }),

  on(actions.boardActions.addUnitToList, (state, { unit }) => {
    // console.log(Array.from(new Set([...state.unitsList, unit])));

    const broodsList = [...state.broodsList].map((b) => {
      if (b.id === unit.broodId) {
        // b =
        let brood = Object.assign({}, b);
        brood.units = [...brood.units, unit];
        b = brood;
      }
      return b;
    });

    return {
      ...state,
      unitsList: Array.from(new Set([...state.unitsList, unit])),
      broodsList,
    };
  }),

  on(actions.boardActions.deleteUnitFromList, (state, { pos }) => {
    const unitsList = [...state.unitsList].filter((p) => !(p.pos.row === pos.row && p.pos.column === pos.column));

    return {
      ...state,
      unitsList,
    };
  }),

  on(actions.boardActions.clearBroodsList, (state) => {
    return {
      ...state,
      broodsList: [],
    };
  }),

  // *** BoardFields
  on(actions.boardActions.loadBoardFields, (state, { fields }) => {
    return {
      ...state,
      fields,
    };
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

    return {
      ...state,
      fields,
    };
  }),
  on(actions.boardActions.toggleBuilderMode, (state) => {
    return {
      ...state,
      builderMode: !state.builderMode,
    };
  }),

  on(actions.boardActions.moveUnitFromTo, (state, { pos, newPos }) => {
    const unit = { ...state.fields[pos.row][pos.column]?.occupyingUnit };

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

    let broodsList = [...state.broodsList].map((b) => {
      let brood: Brood = Object.assign({}, b);

      const units = brood.units.map((u) => {
        if (u.pos.row === pos.row && u.pos.column === pos.column) {
          // console.log('pos');

          const unit = {
            ...u,
            pos: { row: newPos.row, column: newPos.column },
          };
          u = unit;
          // console.log(u);
        }
        return u;
      });

      //  brood.units = brood.units.filter(
      //    (u) => !(u.pos.row === pos.row && u.pos.column === pos.column)
      //  );
      // console.log(units);
      brood.units = units;
      // brood.units = units;
      return brood;
    });

    // console.log(broodsList);

    return {
      ...state,
      fields,
      broodsList,
    };
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

    return {
      ...state,

      fields,
    };
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

    return {
      ...state,
      fields,
    };
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

    return {
      ...state,
      fields,
    };
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

    return {
      ...state,
      fields,
    };
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

    return {
      ...state,
      fields,
    };
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

      let broodsList: Brood[] = [...state.broodsList].map((p) => p);

      /**
       * Check if it was unit and if was in brood then delete it from there
       */
      if (!!previousField.occupyingUnit && previousField.occupyingUnit?.broodId) {
        const { occupyingUnit } = previousField;

        // brzydki syntax ale ngrx nie przepuści bez skopiowania obiektu / tablicy
        let indexToUpdate = -1;
        let broodToUpdate: Brood = {
          ...[...state.broodsList].find((br: Brood, index) => {
            indexToUpdate = index;
            return br.id === occupyingUnit.broodId;
          }),
        };

        if (broodToUpdate && broodToUpdate.units) {
          broodToUpdate.units = broodToUpdate.units?.filter((u) => u.pos !== occupyingUnit.pos);

          broodsList[indexToUpdate] = broodToUpdate;
        }
      }

      return {
        ...state,
        broodsList,
        fields,
      };
    } else return state;
  }),

  // *** Broods
  /**
   * Only updates info in a brood.
   * Doesn't update unit on a field on its own.
   */
  on(actions.broodActions.removeBroodMember, (state, { pos }) => {
    let broodsList = [...state.broodsList].map((b) => {
      let brood = Object.assign({}, b);

      brood.units = brood.units.filter((u) => !(u.pos.row === pos.row && u.pos.column === pos.column));

      // console.log(brood);
      return brood;
    });

    // console.log("brood:",brood);
    // console.log(broodsList);

    broodsList = broodsList.filter((b) => b.units.length !== 0);
    // console.log(broodsList);
    //
    return { ...state, broodsList };
  }),

  on(actions.broodActions.addMemberToBroodUnits, (state, { unit }) => {
    let broodsList = [...state.broodsList].map((b) => b);
    let broodToUpdate = undefined;
    broodsList.forEach((b) => {
      if (b.id === unit.broodId) {
        broodToUpdate = { ...b };

        let overwritten = false;
        broodToUpdate.units.forEach((u) => {
          if (u.pos === unit.pos) {
            u = unit;
            overwritten = true;
          }
        });

        if (!overwritten) {
          let newUnits = [...broodToUpdate.units].map((u) => u);
          newUnits.push({ ...unit });

          broodToUpdate.units = newUnits;
        }
      }
      return b;
    });

    return { ...state, broodsList };
  }),

  on(actions.broodActions.swapBroodMemberOnPos, (state, { unit }) => {
    // console.log(unit);

    const broodsList = [...state.broodsList].map((b) => {
      const brood: Brood = Object.assign({}, b);

      brood.units.forEach((u) => {
        // console.log(u);

        if (u.pos.row === unit.pos.row && u.pos.column === unit.pos.column) {
          u = unit;
          // console.log(u);
        }
      });

      return b;
    });

    return { ...state, broodsList };
  })
);
