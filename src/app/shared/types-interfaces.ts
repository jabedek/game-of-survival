import { NEIGHBORS_BEST_CHANCES_NOT_DIE } from '../board/board.constants';

// export interface ParticleUnit {
//   unit: Unit;
//   state: ParticleState;
//   makeTurn(): boolean;
//   setLongTermGoal(): boolean;
//   getState(): any;
// }

export interface ParticleUnit extends Unit {
  state: ParticleState;
  color: ParticleColor;
  makeTurn?(): boolean;
  setLongTermGoal?(): boolean;
  getState?(): any;
}

export interface ParticleUnitSimplified extends Unit {
  getNeighbors(): any;
}

export interface ParticleState {
  chancesToDieBase: number;
  chancesToDieThisTurn: number;
  chancesToReproduceThisTurn: number;
  neighborsThisTurn: number;
  neighborsBestChancesRepro: number;
  neighborsBestChancesNotDie: NEIGHBORS_BEST_CHANCES_NOT_DIE;
  availableSpotsThisTurn: number;
  gainedAbilities: any[];
  gainedProperties: any[];
  CSSstylesThisTurn: any[];
  penaltyTurnsToWait: number;
  entangledChildrenIds: string[];
}

export interface Unit {
  id: string; // name-like identifier, like 'proton-0'
  groupId: string; // name-like group identifier like 'protons'
  pos: FieldPos;
}

export class Unit implements Unit {
  constructor(id: string, groupId: string, pos: FieldPos) {
    this.id = id;
    this.groupId = groupId || null;
    this.pos = pos;
  }
}

export class ParticleUnit implements ParticleUnit {
  constructor(
    id: string,
    pos: FieldPos,
    color: ParticleColor,
    groupId?: string,
    state?: ParticleState
  ) {
    this.id = id;
    this.groupId = groupId || null;
    this.pos = pos;
    this.color = color;
    this.state = state;
  }
}

export interface Brood {
  id: string;
  units: ParticleUnit[];
  color: string;
  turnState: 'to do' | 'moving' | 'done';
  beginTurn(args?: { [key: string]: any | any[] }): void;
}
export interface NeighborField {
  field: Field;
  at: string;
}

export interface NeighborsRaport {
  all: NeighborField[];
  centerPos: FieldPos;
  particles: NeighborField[];
  obsticles: NeighborField[];
}

export type ParticleColor = 'red' | 'blue' | 'green' | 'black' | 'mixed';

export class Brood implements Brood {
  beginTurn = (args?: { [key: string]: any | any[] }) => {
    // console.log(args);
    let rndId = `${Math.floor(Math.random() * 1000)}`;
    const particle = new ParticleUnit(
      rndId,
      { row: 1, column: 1 },
      'blue',
      this.id
    );
    // console.log(particle);

    args.cb(particle);
  };

  TESTaddUnitToSelf() {}

  constructor(id: string, units: ParticleUnit[], color: string) {
    this.id = id;
    this.units = units || null;
    this.color = color;
    this.turnState = 'to do';
  }
}

export interface Field {
  pos: FieldPos;
  blocked: boolean;
  occupyingUnit?: null | Unit;
}

export interface Particle {
  name: string;
  broodName: string;
  CSSrgba: string;
  CSSsize: { height: string; width: string };
  // CSS:
}

export class Field implements Field {
  constructor(pos: FieldPos, blocked: boolean, occupyingUnit?: Unit) {
    this.pos = pos;
    this.blocked = !!occupyingUnit || blocked;
    this.occupyingUnit = occupyingUnit || null;
  }
}

export type Fields = Field[][];

export interface PatchProperty {
  [key: string]: any;
}
export type BasicInitialBroodFields = [Field, Field, Field, Field];

export interface ValidPotentialBroodSpace {
  startingPos: FieldPos;
  space: BasicInitialBroodFields;
}

export interface FieldPos {
  column: number;
  row: number;
}

export interface FieldPropertyUpdateDetails {
  pos: FieldPos;
  property: { [key: string]: any };
}
export interface AppState {
  board: BoardState;
  particleUnits: ParticleUnit[];
  // broods: BroodsState;
}

interface UIState {
  panelShowing: boolean;
  decorShowing: boolean;
}

// export interface BoardState {
//   fields: [] | Fields;
// }

export interface BoardState {
  ui: UIState;
  turn: TurnState;
  fields: [] | Fields;
  broodsList: Brood[];
  particlesList: ParticleUnit[];
  raport: ValidPotentialBroodSpace[];
}

export interface BroodsState {
  broodsList: Brood[];
  raport: ValidPotentialBroodSpace[];
}

export interface TurnState {
  index: number;
  phase: 'pending' | 'all done';
  allBroodsDone: boolean;
  update: TurnUpdate;
}

export interface BroodTurn {
  phase: 'pending' | 'done';
}

export interface TurnUpdate {
  unitsToAdd: ParticleUnit[];
  unitsToDel: FieldPos[];
}

/**
 * 0 - available to move
 * 1 - blocked by some kind of permanent obsticle
 * 2 - occupied by creature
 */
export type FieldMode = 0 | 1 | 2;

// export enum FieldMode {
//   EMPTY = 0,
//   OBSTICLE = 1,
//   PARTICLE = 2,
// }

export type FieldReference = string;
export interface BoardDynamicCSS {
  sizings: BoardDynamicCSS_sizings;
  structurings: BoardDynamicCSS_structurings;
}

export interface BoardDynamicCSS_sizings {
  boardSize_px: string;
  fieldSize_px: string;
}

export interface BoardDynamicCSS_structurings {
  display: string;
  'grid-template-columns': string;
  'grid-template-rows': string;
  width: string;
  height: string;
}
