import { createSelector } from '@ngrx/store';
import { BoardState, RootState } from '@/src/app/core/state/root-state.types';

import * as HELPERS from '@/src/app/shared/helpers/board.helpers';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { BoardFields, BasicInitialBroodFields, NeighborsRaport, ValidPotentialBroodSpace } from '@/src/app/shared/types/board/board.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { Brood } from '@/src/app/shared/types/board/brood.types';

export const selectBoard = (state: RootState) => state.board;

export const selectBoardFields = createSelector(selectBoard, (state: BoardState) => state.fields);

export const selectBuilderMode = createSelector(selectBoard, (state: BoardState) => state.builderMode);

export const selectUnitsList = createSelector(selectBoard, (state: BoardState) => {
  return state.unitsList;
});

export const selectBroodsList = createSelector(selectBoard, (state: BoardState) => {
  return state.broodsList;
});

export const selectUnitsAndBroods = createSelector(selectBoard, (state) => {
  return {
    unitsList: state.unitsList,
    broodsList: state.broodsList,
  };
});

export const selectEmptyFields = createSelector(selectBoardFields, (fields: BoardFields) => {
  let availableFields: Field[] = [];

  fields.forEach((fieldCol: Field[]) => {
    return fieldCol.forEach((field) => {
      if (!field.blocked && !field.occupyingUnit) {
        availableFields.push(field);
      }
    });
  });

  return availableFields;
});

export const selectValidBroodSpaces = createSelector(selectBoardFields, (fields: BoardFields) => {
  let settlements: BasicInitialBroodFields[] = [];
  let validBroodRoots: FieldPos[] = [];
  let raport: ValidPotentialBroodSpace[] = [];

  [...fields].forEach((fieldsCol) => {
    [...fieldsCol].forEach((field) => {
      const result = HELPERS.isValidBroodRoot([...fields], field.pos);
      if (result !== undefined) {
        validBroodRoots.push(field.pos);
        settlements.push(result);
        raport.push({ startingPos: field.pos, space: result });
      }
    });
  });

  return raport;
});

export const selectAvailableFieldsAndSpaces = createSelector(
  selectEmptyFields,
  selectValidBroodSpaces,
  (emptyFields: any, validBroodSpaces: any) => {
    return { emptyFields, validBroodSpaces };
  }
);

export const selectBoardField = createSelector(selectBoard, (state: BoardState, props) => {
  const fieldDetails = state?.fields[props.row][props.column];
  return fieldDetails;
});

export const selectFieldNeighbors = createSelector(selectBoardFields, (fields: BoardFields, props: FieldPos) => {
  const neighbors: NeighborsRaport = HELPERS.getFieldNeighbors([...fields], props);

  return neighbors;
});

export const selectBoardFieldInfo = createSelector(
  selectBoard,
  selectFieldNeighbors,
  (state: BoardState, neighbors: NeighborsRaport, props) => {
    const fieldDetails = state?.fields[props.row][props.column];
    return { fieldDetails, neighbors };
  }
);

export const selectAllUnitsNeighbors = createSelector(selectBoardFields, selectUnitsList, (fields: BoardFields, units: Unit[]) => {
  const fieldsNeighbors: NeighborsRaport[] = units.map((p) => {
    return HELPERS.getFieldNeighbors([...fields], p.pos);
  });

  return fieldsNeighbors;
});

export const selectAllUnitsNeighborsAndBroodsList = createSelector(
  selectBoardFields,
  selectUnitsList,
  selectBroodsList,
  (fields: BoardFields, units: Unit[], broods: Brood[]) => {
    const fieldsNeighbors: NeighborsRaport[] = units.map((p) => {
      return HELPERS.getFieldNeighbors([...fields], p.pos);
    });

    return { fieldsNeighbors, broodsList: broods };
  }
);

export const selectUnitsNeighbors = createSelector(selectBoardFields, (fields: BoardFields, props: Unit[]) => {
  const fieldsNeighbors: NeighborsRaport[] = props.map((p) => {
    return HELPERS.getFieldNeighbors([...fields], p.pos);
  });

  return fieldsNeighbors;
});

export const selectBoardSnapshot = createSelector(selectAvailableFieldsAndSpaces, selectUnitsAndBroods, (available, occupied) => {
  return { available, occupied };
});
