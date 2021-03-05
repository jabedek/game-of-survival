import { createSelector } from '@ngrx/store';
import { RootState } from '../../root-state';

import * as HELPERS from '../shared/board.helpers';
import { Field, FieldPos } from '../types/field.types';
import {
  BoardFields,
  BasicInitialBroodFields,
  BoardState,
  Brood,
  NeighborsRaport,
  ParticleUnit,
  ValidPotentialBroodSpace,
} from '../types/board.types';

export const selectBoard = (state: RootState) => state.board;

export const selectBoardFields = createSelector(
  selectBoard,
  (state: BoardState) => state.fields
);
export const selectBuilderMode = createSelector(
  selectBoard,
  (state: BoardState) => state.builderMode
);

export const selectParticlesList = createSelector(
  selectBoard,
  (state: BoardState) => {
    return state.particlesList;
  }
);

export const selectBroodsList = createSelector(
  selectBoard,
  (state: BoardState) => {
    return state.broodsList;
  }
);

export const selectParticlesAndBroods = createSelector(selectBoard, (state) => {
  return {
    particlesList: state.particlesList,
    broodsList: state.broodsList,
  };
});

export const selectEmptyFields = createSelector(
  selectBoardFields,
  (fields: BoardFields) => {
    let availableFields: Field[] = [];

    fields.forEach((fieldCol: Field[]) => {
      return fieldCol.forEach((field) => {
        if (!field.blocked && !field.occupyingUnit) {
          availableFields.push(field);
        }
      });
    });

    return availableFields;
  }
);

export const selectValidBroodSpaces = createSelector(
  selectBoardFields,
  (fields: BoardFields) => {
    let settlements: BasicInitialBroodFields[] = [];
    let validBroodRoots: FieldPos[] = [];
    let raport: ValidPotentialBroodSpace[] = [];

    [...fields].forEach((fieldsCol) => {
      [...fieldsCol].forEach((field) => {
        const result = HELPERS.isValidBroodRoot([...fields], field.pos);
        if (result !== null) {
          validBroodRoots.push(field.pos);
          settlements.push(result);
          raport.push({ startingPos: field.pos, space: result });
        }
      });
    });

    return raport;
  }
);

export const selectAvailableFieldsAndSpaces = createSelector(
  selectEmptyFields,
  selectValidBroodSpaces,
  (emptyFields: any, validBroodSpaces: any) => {
    return { emptyFields, validBroodSpaces };
  }
);

export const selectBoardField = createSelector(
  selectBoard,
  (state: BoardState, props) => {
    const fieldDetails = state?.fields[props.row][props.column];
    return fieldDetails;
  }
);

export const selectFieldNeighbors = createSelector(
  selectBoardFields,
  (fields: BoardFields, props: FieldPos) => {
    const neighbors: NeighborsRaport = HELPERS.getNeighbors([...fields], props);

    return neighbors;
  }
);

export const selectBoardFieldInfo = createSelector(
  selectBoard,
  selectFieldNeighbors,
  (state: BoardState, neighbors: NeighborsRaport, props) => {
    const fieldDetails = state?.fields[props.row][props.column];
    return { fieldDetails, neighbors };
  }
);

export const selectAllUnitsNeighbors = createSelector(
  selectBoardFields,
  selectParticlesList,
  (fields: BoardFields, particles: ParticleUnit[]) => {
    const fieldsNeighbors: NeighborsRaport[] = particles.map((p) => {
      return HELPERS.getNeighbors([...fields], p.pos);
    });

    return fieldsNeighbors;
  }
);
export const selectAllUnitsNeighborsAndBroodsList = createSelector(
  selectBoardFields,
  selectParticlesList,
  selectBroodsList,
  (fields: BoardFields, particles: ParticleUnit[], broods: Brood[]) => {
    const fieldsNeighbors: NeighborsRaport[] = particles.map((p) => {
      return HELPERS.getNeighbors([...fields], p.pos);
    });

    return { fieldsNeighbors, broodsList: broods };
  }
);

export const selectUnitsNeighbors = createSelector(
  selectBoardFields,
  (fields: BoardFields, props: ParticleUnit[]) => {
    const fieldsNeighbors: NeighborsRaport[] = props.map((p) => {
      return HELPERS.getNeighbors([...fields], p.pos);
    });

    return fieldsNeighbors;
  }
);

export const selectBoardSnapshot = createSelector(
  selectAvailableFieldsAndSpaces,
  selectParticlesAndBroods,
  (available, occupied) => {
    return { available, occupied };
  }
);
