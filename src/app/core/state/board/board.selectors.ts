import { createSelector } from '@ngrx/store';
import { BoardState, RootState } from '@/src/app/core/state/root-state.types';

import * as HELPERS from '@/src/app/shared/helpers/board.helpers';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import {
  BoardFields,
  BasicInitialBroodFields,
  NeighborsRaport,
  ValidPotentialBroodSpace,
  NeighborsAndBroods,
} from '@/src/app/shared/types/board/board.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { Brood } from '@/src/app/shared/types/board/brood.types';

export const selectBoard = (state: RootState) => state.board;

export const selectBoardFields = createSelector(selectBoard, (state: BoardState) => state.fields);

export const selectBuilderMode = createSelector(selectBoard, (state: BoardState) => state.builderMode);

export const selectUnitsList = createSelector(selectBoard, (state: BoardState) => state.unitsList);

export const selectBroodsList = createSelector(selectBoard, (state: BoardState) => state.broodsList);

export const selectUnitsAndBroods = createSelector(selectBoard, (state) => ({
  unitsList: state.unitsList,
  broodsList: state.broodsList,
}));

export const selectEmptyFields = createSelector(selectBoardFields, (fields: BoardFields) => {
  const availableFields: Field[] = [];

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
  const settlements: BasicInitialBroodFields[] = [];
  const validBroodRoots: FieldPos[] = [];
  const raport: ValidPotentialBroodSpace[] = [];

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
  (emptyFields: any, validBroodSpaces: any) => ({ emptyFields, validBroodSpaces })
);

// export const selectBoardField = createSelector(selectBoard, (state: BoardState, props) => state?.fields[props.row][props.column]);

export const selectFieldNeighbors = createSelector(
  selectBoardFields,
  (fields: BoardFields, props: FieldPos): NeighborsRaport => HELPERS.getFieldNeighbors([...fields], props)
);

export const selectBoardFieldInfo = createSelector(selectBoard, selectFieldNeighbors, (state: BoardState, neighbors: NeighborsRaport, props) => ({
  fieldDetails: state?.fields[props.row][props.column],
  neighbors,
}));

export const selectAllUnitsNeighbors = createSelector(selectBoardFields, selectUnitsList, (fields: BoardFields, units: Unit[]): NeighborsRaport[] =>
  units.map((p) => HELPERS.getFieldNeighbors([...fields], p.pos))
);

export const selectAllUnitsNeighborsAndBroodsList = createSelector(
  selectBoardFields,
  selectUnitsList,
  selectBroodsList,
  (fields: BoardFields, units: Unit[], broods: Brood[]): NeighborsAndBroods => ({
    fieldsNeighbors: units.map((p) => HELPERS.getFieldNeighbors([...fields], p.pos)),
    broodsList: broods,
  })
);

export const selectUnitsNeighbors = createSelector(selectBoardFields, (fields: BoardFields, props: Unit[]): NeighborsRaport[] =>
  props.map((p) => HELPERS.getFieldNeighbors([...fields], p.pos))
);

export const selectBoardSnapshot = createSelector(selectAvailableFieldsAndSpaces, selectUnitsAndBroods, (available, occupied) => ({
  available,
  occupied,
}));
