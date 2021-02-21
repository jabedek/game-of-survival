import { Action, createReducer, on } from '@ngrx/store';
import {
  AppState,
  BoardState,
  Brood,
  Field,
  Fields,
  ParticleUnit,
} from '../shared/types-interfaces';

import * as appActions from './board.actions';

export const featureKey = 'board';

export const initialBoardState: BoardState = {
  fields: [],
  broodsList: [],
  particlesList: [],
  raport: null,
  ui: { decorShowing: true, panelShowing: true },
};

const authReducer = createReducer(
  initialBoardState,
  on(appActions.removeBroodFromList, (state, { id }) => {
    const broodToDel = [...state.broodsList].findIndex((b) => b.id === id);

    let broodsList = [...state.broodsList].map((b) => b);

    const unitsToDelete = broodsList[broodToDel].units;

    // let units = [...state.particlesList].map((p) => p);

    // for (let i = 0; i < unitsToDelete.length; i++) {
    //   units = units.filter((u) => u.id === unitsToDelete[i].id);
    // }
    // console.log(broodToDel, units);

    return {
      ...state,
      broodsList: [...state.broodsList].filter((b) => b.id !== id),
    };
  }),

  on(appActions.addBroodToList, (state: BoardState, { brood }) => {
    let broodsList: Brood[] = [...state.broodsList].map((b) => b);
    broodsList = [...state.broodsList.map((b) => b), brood];
    broodsList = [...broodsList].filter((b) => b.units.length > 0);

    return {
      ...state,
      broodsList,
    };
  }),

  /**
   * Only updates info in a brood.
   * Doesn't update particle on a field on its own.
   */
  on(appActions.removeBroodMember, (state, { pos }) => {
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

  on(appActions.addMemberToBroodUnits, (state, { unit }) => {
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

  on(appActions.swapBroodMemberOnPos, (state, { unit }) => {
    const broodsList = [...state.broodsList].map((b) => {
      b.units.forEach((u) => {
        if (u.pos === unit.pos) {
          u = unit;
        }
      });

      return b;
    });

    return { ...state, broodsList };
  }),

  on(appActions.toggleUIPanelShowing, (state: BoardState) => {
    let ui = { ...state.ui };
    ui.panelShowing = !ui.panelShowing;
    return {
      ...state,
      ui,
    };
  }),
  on(appActions.toggleUIDecorShowing, (state: BoardState) => {
    let ui = { ...state.ui };
    ui.decorShowing = !ui.decorShowing;
    return {
      ...state,
      ui,
    };
  }),
  on(appActions.clearParticles, (state) => {
    return {
      ...state,
      particlesList: [],
    };
  }),

  on(appActions.addParticleToList, (state, { unit }) => {
    return {
      ...state,
      particlesList: Array.from(new Set([...state.particlesList, unit])),
    };
  }),

  on(appActions.deleteParticleFromList, (state, { pos }) => {
    const particlesList = [...state.particlesList].filter(
      (p) => !(p.pos.row === pos.row && p.pos.column === pos.column)
    );

    return {
      ...state,
      particlesList,
    };
  }),

  on(appActions.clearBroods, (state) => {
    return {
      ...state,
      broodsList: [],
    };
  }),

  on(appActions.loadFields, (state, { fields }) => {
    return {
      ...state,
      fields,
    };
  }),

  on(appActions.setFieldParticle, (state, { unit }) => {
    const { pos } = unit;

    const fields: Fields = [...state.fields].map((row: Field[]) =>
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

  on(appActions.setFieldObsticle, (state, { pos }) => {
    const fields: Fields = [...state.fields].map((data: Field[]) =>
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
  on(appActions.setFieldEmpty, (state, { pos }) => {
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

      const fields: Fields = [...state.fields].map((data: Field[]) =>
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
  })
);

export function reducer(state: BoardState | undefined, action: Action) {
  return authReducer(state, action);
}
