import { Action, createReducer, on } from '@ngrx/store';

import * as boardActions from './board.actions';
import * as broodActions from './brood.actions';
import * as fieldActions from './field/field.actions';
import { Field } from './field/field.types';
import { BoardFields } from './board/board.types';
import { BoardState, Brood } from './board.types';

export const featureKey = 'board';

export const initialBoardState: BoardState = {
  fields: [],
  particlesList: [],
  broodsList: [],
  builderMode: true,
};

const authReducer = createReducer(
  initialBoardState,

  // *** Particles ***
  on(boardActions.clearParticlesList, (state) => {
    return {
      ...state,
      particlesList: [],
    };
  }),
  on(boardActions.addBroodToList, (state: BoardState, { brood }) => {
    let broodsList: Brood[] = [...state.broodsList].map((b) => b);
    broodsList = [...state.broodsList.map((b) => b), brood];
    broodsList = [...broodsList].filter((b) => b.units.length > 0);

    return {
      ...state,
      broodsList,
    };
  }),

  on(boardActions.addParticleToList, (state, { unit }) => {
    return {
      ...state,
      particlesList: Array.from(new Set([...state.particlesList, unit])),
    };
  }),

  on(boardActions.deleteParticleFromList, (state, { pos }) => {
    const particlesList = [...state.particlesList].filter(
      (p) => !(p.pos.row === pos.row && p.pos.column === pos.column)
    );

    return {
      ...state,
      particlesList,
    };
  }),

  on(boardActions.clearBroodsList, (state) => {
    return {
      ...state,
      broodsList: [],
    };
  }),

  // *** BoardFields
  on(boardActions.loadBoardFields, (state, { fields }) => {
    return {
      ...state,
      fields,
    };
  }),
  on(boardActions.setField, (state, { field }) => {
    console.log('setField', field);

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
  on(boardActions.toggleBuilderMode, (state) => {
    return {
      ...state,
      builderMode: !state.builderMode,
    };
  }),

  on(boardActions.moveParticleFromTo, (state, { pos, newPos }) => {
    const unit = { ...state.fields[pos.row][pos.column]?.occupyingUnit };

    const field = {
      ...state.fields[pos.row][pos.column],
      occupyingUnit: null,
      blocked: false,
    };

    const newField = {
      ...state.fields[newPos.row][newPos.column],
      occupyingUnit: unit,
      blocked: true,
    };
    console.log(field, newField);

    const fields = [...state.fields].map((row: Field[]) => {
      return row.map((cell: Field) => {
        if (cell.pos.row === pos.row && cell.pos.column === pos.column)
          return field;
        if (cell.pos.row === newPos.row && cell.pos.column === newPos.column)
          return newField;

        return cell;
      });
    });

    return {
      ...state,
      fields,
    };
  }),

  on(fieldActions.setFieldParticle, (state, { unit }) => {
    const { pos } = unit;

    const fields: BoardFields = [...state.fields].map((row: Field[]) =>
      row.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = {
            ...state.fields[pos.row][pos.column],
            blocked: true,
            occupyingUnit: unit,
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

  on(fieldActions.setFieldsHighlightTrue, (state, { fieldsToHighLight }) => {
    let fields = [...state.fields].map((row: Field[]) => {
      return row.map((f) => f);
    });

    fieldsToHighLight.forEach((f) => {
      const { row, column } = f.pos;
      const field = {
        ...fields[row][column],
        highlightAccess: true,
      };
      console.log(field);

      fields[row][column] = field;
    });
    console.log(fieldsToHighLight);

    return {
      ...state,
      fields,
    };
  }),
  on(fieldActions.setAllFieldsHighlightFalse, (state) => {
    let fields = [...state.fields].map((row: Field[]) => {
      return row.map((f) => {
        return {
          ...f,
          highlightAccess: false,
        };
      });
    });

    // fields.forEach((row: Field[]) => {
    //   return row.forEach((f) => {
    //     const field = {
    //       ...f,
    //       highlightAccess: false,
    //     };

    //     f = field;
    //   });
    // });

    return {
      ...state,
      fields,
    };
  }),

  on(fieldActions.setFieldObsticle, (state, { pos }) => {
    const fields: BoardFields = [...state.fields].map((data: Field[]) =>
      data.map((field: Field) => {
        if (field.pos.column === pos.column && field.pos.row === pos.row) {
          field = {
            ...state.fields[pos.row][pos.column],
            blocked: true,
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
   * Sets field unblocked with occupying unit set to null, so it doesn't display any unit.
   */
  on(fieldActions.setFieldEmpty, (state, { pos }) => {
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
        occupyingUnit: null,
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

      // Check if it was particle and if was in brood then delete it from there
      if (
        !!previousField.occupyingUnit &&
        previousField.occupyingUnit?.groupId
      ) {
        const { occupyingUnit } = previousField;

        // brzydki syntax ale ngrx nie przepuści bez skopiowania obiektu / tablicy
        let indexToUpdate = -1;
        let broodToUpdate: Brood = {
          ...[...state.broodsList].find((br: Brood, index) => {
            indexToUpdate = index;
            return br.id === occupyingUnit.groupId;
          }),
        };

        if (broodToUpdate && broodToUpdate.units) {
          broodToUpdate.units = broodToUpdate.units?.filter(
            (u) => u.pos !== occupyingUnit.pos
          );

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
   * Doesn't update particle on a field on its own.
   */
  on(broodActions.removeBroodMember, (state, { pos }) => {
    let broodsList = [...state.broodsList].map((b) => {
      let brood = Object.assign({}, b);

      brood.units = brood.units.filter(
        (u) => !(u.pos.row === pos.row && u.pos.column === pos.column)
      );

      return brood;
    });

    broodsList = broodsList.filter((b) => b.units.length !== 0);

    return { ...state, broodsList };
  }),

  on(broodActions.addMemberToBroodUnits, (state, { unit }) => {
    let broodsList = [...state.broodsList].map((b) => b);
    let broodToUpdate = null;
    broodsList.forEach((b) => {
      if (b.id === unit.groupId) {
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

  on(broodActions.swapBroodMemberOnPos, (state, { unit }) => {
    const broodsList = [...state.broodsList].map((b) => {
      b.units.forEach((u) => {
        if (u.pos === unit.pos) {
          u = unit;
        }
      });

      return b;
    });

    return { ...state, broodsList };
  })
);

export function reducer(state: BoardState | undefined, action: Action) {
  return authReducer(state, action);
}
