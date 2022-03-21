import { createSelector } from '@ngrx/store';
import { RootState } from '@/src/app/core/state/root-state.types';

import * as HELPERS from '@/src/app/shared/helpers/board.helpers';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import {
  BoardFields,
  BasicInitialGroupFields,
  NeighborsRaport,
  ValidPotentialGroupSpace,
  NeighborsAndGroups,
} from '@/src/app/shared/types/board/board.types';
import { Unit } from '@/src/app/shared/types/board/unit.types';
import { Group } from '@/src/app/shared/types/board/group.types';
import { BoardState } from './board.state';

export const selectBoard = (state: RootState) => state.board;

export const selectBoardFields = createSelector(selectBoard, (state: BoardState) => state.fields);

export const selectBuilderMode = createSelector(selectBoard, (state: BoardState) => state.builderMode);

export const selectUnitsList = createSelector(selectBoard, (state: BoardState) => state.unitsList);

export const selectGroupsList = createSelector(selectBoard, (state: BoardState) => state.groupsList);

export const selectUnitsAndGroups = createSelector(selectBoard, (state) => ({
  unitsList: state.unitsList,
  groupsList: state.groupsList,
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

export const selectValidGroupSpaces = createSelector(selectBoardFields, (fields: BoardFields) => {
  const settlements: BasicInitialGroupFields[] = [];
  const validGroupRoots: FieldPos[] = [];
  const raport: ValidPotentialGroupSpace[] = [];

  [...fields].forEach((fieldsCol) => {
    [...fieldsCol].forEach((field) => {
      const result = HELPERS.isValidGroupRoot([...fields], field.pos);
      if (result !== undefined) {
        validGroupRoots.push(field.pos);
        settlements.push(result);
        raport.push({ startingPos: field.pos, space: result });
      }
    });
  });

  return raport;
});

export const selectAvailableFieldsAndSpaces = createSelector(
  selectEmptyFields,
  selectValidGroupSpaces,
  (emptyFields: any, validGroupSpaces: any) => ({ emptyFields, validGroupSpaces })
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

export const selectAllUnitsNeighborsAndGroupsList = createSelector(
  selectBoardFields,
  selectUnitsList,
  selectGroupsList,
  (fields: BoardFields, units: Unit[], groups: Group[]): NeighborsAndGroups => ({
    fieldsNeighbors: units.map((p) => HELPERS.getFieldNeighbors([...fields], p.pos)),
    groupsList: groups,
  })
);

export const selectUnitsNeighbors = createSelector(selectBoardFields, (fields: BoardFields, props: Unit[]): NeighborsRaport[] =>
  props.map((p) => HELPERS.getFieldNeighbors([...fields], p.pos))
);

export const selectBoardSnapshot = createSelector(selectAvailableFieldsAndSpaces, selectUnitsAndGroups, (available, occupied) => ({
  available,
  occupied,
}));
