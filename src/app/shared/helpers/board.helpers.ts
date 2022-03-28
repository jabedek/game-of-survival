import { getRandom } from '@/src/app/shared/helpers/common.helpers';
import {
  BasicInitialGroupFields,
  BoardFields,
  NeighborDirections,
  NeighborField,
  NeighborFieldAccessible,
  NeighborsRaport,
} from '@/src/app/shared/types/board/board.types';
import { Field, FieldPos } from '@/src/app/shared/types/board/field.types';
import { Unit } from '../types/board/unit.types';
import { UnitColor } from '../types/board/unit-base.types';
import { Group } from '../types/board/group.types';
import { RELATIVE_POSITIONS } from '../constants/board.constants';
import { Pos } from '../types/common.types';

export function getInitialFields(boardDimensions: number): BoardFields {
  let fields: BoardFields = [];

  for (let row = 0; row < boardDimensions; row++) {
    fields[row] = [];
    for (let column = 0; column < boardDimensions; column++) {
      const field: Field = {
        pos: { row, column },
        blocked: false,
        mode: 'empty',
        occupyingUnit: undefined,
        highlightAccessibility: false,
        // neighbors: undefined,
      };

      fields[row][column] = field;
    }
  }

  return fields;
}

export function getPreparedGroupBase(dimensions: number, pos: FieldPos, id?: string, color?: UnitColor) {
  const groupId = id || `reds-${getRandom(1000)}`;
  const groupColor = color || 'red';

  const units = [
    new Unit(
      `${id}-0`,
      {
        row: pos.row,
        column: pos.column,
      },
      groupColor,
      groupId
    ),
    new Unit(
      `${id}-1`,
      {
        row: pos.row,
        column: pos.column + 1,
      },
      groupColor,
      groupId
    ),
    new Unit(
      `${id}-2`,
      {
        row: pos.row + 1,
        column: pos.column,
      },
      groupColor,
      groupId
    ),
    new Unit(
      `${id}-3`,
      {
        row: pos.row + 1,
        column: pos.column + 1,
      },
      groupColor,
      groupId
    ),
  ];

  const groupUnits = units.filter((u) => isFieldInBoardBoundries(dimensions, u.pos));

  return new Group(groupId, groupUnits, groupColor);
}

export function isValidGroupRoot(fields: BoardFields, props: FieldPos): undefined | BasicInitialGroupFields {
  const column: number = +props.column;
  const row: number = +props.row;

  let available0: undefined | Field = undefined;
  let available1: undefined | Field = undefined;
  let available2: undefined | Field = undefined;
  let available3: undefined | Field = undefined;

  let posA: number;
  let posB: number;

  // 0. root - north-west
  posB = column;
  posA = row;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available0 = undefined;
  } else {
    available0 = fields[posA][posB].blocked ? undefined : fields[posA][posB];
  }

  // 1. north-east
  posB = column + 1;
  posA = row;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available1 = undefined;
  } else {
    available1 = fields[posA][posB].blocked ? undefined : fields[posA][posB];
  }

  // 2. south-west
  posB = column;
  posA = row + 1;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available2 = undefined;
  } else {
    available2 = fields[posA][posB].blocked ? undefined : fields[posA][posB];
  }

  // 3. south-east
  posB = column + 1;
  posA = row + 1;

  if (posA < 0 || posB < 0 || posA >= fields.length || posB >= fields.length) {
    available3 = undefined;
  } else {
    available3 = fields[posA][posB].blocked ? undefined : fields[posA][posB];
  }

  let groupFields: any[] = [undefined, undefined, undefined, undefined];
  groupFields[0] = available0;
  groupFields[1] = available1;
  groupFields[2] = available2;
  groupFields[3] = available3;

  if (available0 !== undefined && available1 !== undefined && available2 !== undefined && available3 !== undefined) {
    return groupFields as BasicInitialGroupFields;
  } else return undefined;
}

export const isClickInRectBoundries = (rect: DOMRect, pos: Pos) =>
  pos.x >= rect.left - 1 && pos.x <= rect.right - 1 && pos.y >= rect.top - 1 && pos.y <= rect.bottom - 1;

export const isFieldInBoardBoundries = (boardDimensions: number, pos: FieldPos) =>
  pos.row >= 0 && pos.column >= 0 && pos.row < boardDimensions && pos.column < boardDimensions;

export function getFieldNeighbors(fields: BoardFields, pos: FieldPos): NeighborsRaport {
  if (isFieldInBoardBoundries(fields.length, pos)) {
    const rootCol: number = pos.column;
    const rootRow: number = pos.row;

    const all: NeighborField[] = [];

    RELATIVE_POSITIONS.forEach(({ at, relRow, relCol }) => {
      const row = rootRow + relRow;
      const column = rootCol + relCol;
      const isInBoardBoundries = isFieldInBoardBoundries(fields.length, { row, column });
      all.push({
        field: isInBoardBoundries ? fields[row][column] : undefined,
        at,
      });
    });

    const units = all.filter((neighbour) => !!neighbour?.field?.occupyingUnit);
    const obsticles = all.filter((neighbour) => !!neighbour?.field?.blocked && !neighbour?.field?.occupyingUnit);
    const accessible = all.filter((n) => n.field !== undefined && n.field.blocked === false) as NeighborFieldAccessible[];
    const accessibleToMove = accessible.filter(
      (n) => !![NeighborDirections.N, NeighborDirections.S, NeighborDirections.W, NeighborDirections.E].includes(n.at)
    );

    return {
      all,
      units,
      obsticles,
      accessible,
      accessibleToMove,
      centerField: fields[rootRow][rootCol],
    };
  } else {
    return {
      all: [],
      units: [],
      obsticles: [],
      accessible: [],
      accessibleToMove: [],
      centerField: undefined,
    };
  }
}

export const areTwoPositionsEqual = (posA: FieldPos, posB: FieldPos): boolean => posA.column === posB.column && posA.row === posB.row;
