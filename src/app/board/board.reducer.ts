import { Action, createReducer, on } from '@ngrx/store';
import {
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
  broodsOnBoard: [],
  particlesOnBoard: [],
  raport: null,
};

const authReducer = createReducer(
  initialBoardState,
  on(appActions.removeBrood, (state, { id }) => {
    const broodToDel = [...state.broodsOnBoard].findIndex((b) => b.id === id);

    let broodsOnBoard = [...state.broodsOnBoard].map((b) => b);

    const unitsToDelete = broodsOnBoard[broodToDel].units;

    let units = [...state.particlesOnBoard].map((p) => p);

    for (let i = 0; i < unitsToDelete.length; i++) {
      units = units.filter((u) => u.id === unitsToDelete[i].id);
    }
    // console.log(broodToDel, units);

    return {
      ...state,
      broodsOnBoard: [...state.broodsOnBoard].filter((b) => b.id !== id),
    };
  }),

  on(appActions.addBrood, (state: BoardState, { brood }) => {
    let exactInitialSpace = false;
    let exactInitialBroodIndex = -1;
    let broodsOnBoard: Brood[] = [...state.broodsOnBoard].map((b) => b);
    console.log(broodsOnBoard);

    // broodsOnBoard.forEach((b, i) => {
    //   if (
    //     b.units[0].pos === brood.units[0].pos &&
    //     b.units[1].pos === brood.units[1].pos &&
    //     b.units[2].pos === brood.units[2].pos &&
    //     b.units[3].pos === brood.units[3].pos
    //   ) {
    //     exactInitialSpace = true;
    //     exactInitialBroodIndex = i;
    //   }
    // });

    // if (exactInitialSpace) {
    //   broodsOnBoard[exactInitialBroodIndex] = brood;
    // } else {
    // }
    broodsOnBoard = [...state.broodsOnBoard.map((b) => b), brood];
    broodsOnBoard = [...broodsOnBoard].filter((b) => b.units.length > 0);

    console.log(broodsOnBoard);
    // console.log(broodsOnBoard[0]?.units[0]?.pos, '=== ', brood?.units[0].pos);
    // console.log(exactInitialSpace);

    return {
      ...state,
      broodsOnBoard,
    };
  }),

  /**
   * Only updates info in a brood.
   * Doesn't update particle on a field on its own.
   */
  on(appActions.removeBroodMember, (state, { pos }) => {
    console.log('removeBroodMember');

    let particle: ParticleUnit = null;
    // let particlesOnBoard: ParticleUnit[] = [...state.particlesOnBoard].map(
    //   (p) => p
    // );

    // particlesOnBoard.forEach((p) => {
    //   if (p.pos !== pos) {
    //   } else {
    //     particle = { ...p };
    //   }
    // });

    // particlesOnBoard = particlesOnBoard.filter((p) => p.pos !== pos);

    let newBrood: Brood;
    let broodsOnBoard: Brood[] = [...state.broodsOnBoard].map((b) => b);
    if (particle) {
      broodsOnBoard = [
        ...[...state.broodsOnBoard].map((data) => {
          if (data?.id === particle.groupId) {
            // console.log(particle);
            newBrood = {
              ...data,
              units: [...data.units].filter((u) => u.id !== particle.id),
            };

            if (newBrood.units.length > 0) {
              return data;
            }
          } else return data;
        }),
      ];

      return state;
    }
    return state;
  }),

  on(appActions.addBroodMember, (state, { unit }) => {
    let broodsOnBoard = [...state.broodsOnBoard].map((b) => b);
    let broodToUpdate = null;
    broodsOnBoard.forEach((b) => {
      // console.log(b);
      console.log(unit.groupId, '===');
      console.log(b.id);

      if (b.id === unit.groupId) {
        // console.log(b, unit);
        // console.log(b.units);
        broodToUpdate = { ...b };
        // if(b.)

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
          // broodToUpdate.units.push(Object.assign({}, unit));
        }
      }
      console.log(broodToUpdate);

      return b;
    });

    return { ...state, broodsOnBoard };
  }),

  on(appActions.setBroodMemberOnPos, (state, { unit }) => {
    const broodsOnBoard = [...state.broodsOnBoard].map((b) => {
      b.units.forEach((u) => {
        if (u.pos === unit.pos) {
          u = unit;
        }
      });

      return b;
    });

    return { ...state, broodsOnBoard };
  }),

  on(appActions.clearBroods, (state) => {
    return {
      ...state,
      broodsOnBoard: [],
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

    // 1. Update particlesOnBoard by overwriting unit on position or adding new unit
    let overwrittenPos = false;
    let particlesOnBoard: ParticleUnit[] = [...state.particlesOnBoard].map(
      (p) => {
        if (p.pos === pos) {
          p = unit;
          overwrittenPos = true;
        }

        return p;
      }
    );
    if (!overwrittenPos) {
      particlesOnBoard.push(unit);
    }

    // 2. Update new particle field
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
      particlesOnBoard,
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
      // console.log(state, pos);

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

      let particlesOnBoard: any[] = [...state.particlesOnBoard].map((p) => p);
      // BROODS
      let broodsOnBoard: Brood[] = [...state.broodsOnBoard].map((p) => p);
      // console.log(broodsOnBoard);

      // Check if it was particle and if was in brood then delete it from there

      if (
        !!previousField.occupyingUnit &&
        previousField.occupyingUnit?.groupId
      ) {
        const { occupyingUnit } = previousField;

        particlesOnBoard = [
          ...state.particlesOnBoard.filter((p) => p.id !== occupyingUnit.id),
        ];

        // brzydki syntax ale ngrx nie przepuści bez skopiowania obiektu / tablicy
        let indexToUpdate = -1;
        let broodToUpdate: Brood = {
          ...[...state.broodsOnBoard].find((br: Brood, index) => {
            indexToUpdate = index;
            return br.id === occupyingUnit.groupId;
          }),
        };

        if (broodToUpdate && broodToUpdate.units) {
          broodToUpdate.units = broodToUpdate.units?.filter(
            (u) => u.pos !== occupyingUnit.pos
          );

          broodsOnBoard[indexToUpdate] = broodToUpdate;
        }
      }

      return {
        ...state,
        particlesOnBoard,
        broodsOnBoard,
        fields,
      };
    } else return state;
  })
);

export function reducer(state: BoardState | undefined, action: Action) {
  return authReducer(state, action);
}
