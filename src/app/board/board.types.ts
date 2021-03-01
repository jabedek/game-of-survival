import { getRandom } from '../shared/helpers';
import { Field, FieldPos } from './field/field.types';
import { BoardFields } from './board/board.types';

// *** Feature state parts
export interface BoardState {
  fields: BoardFields;
  particlesList: ParticleUnit[];
  broodsList: Brood[];
}

// *** Units, Particles
export interface Unit {
  id: string; // name-like identifier, like 'proton-0' or simply '0'
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

export interface ParticleUnit extends Unit {
  state: ParticleState;
  color: ParticleColor;
  makeTurn?(): boolean;
  setLongTermGoal?(): boolean;
  getState?(): any;
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

export interface Particle {
  name: string;
  broodName: string;
  CSSrgba: string;
  CSSsize: { height: string; width: string };
}

export type ParticleColor = 'red' | 'blue' | 'green' | 'black' | 'mixed';

export interface ParticleState {
  // chancesToDieBase: number;
  // chancesToDieThisTurn: number;
  // chancesToReproduceThisTurn: number;
  // neighborsThisTurn: number;
  // neighborsBestChancesRepro: number;
  // neighborsBestChancesNotDie: NEIGHBORS_BEST_CHANCES_NOT_DIE;
  // availableSpotsThisTurn: number;
  // gainedAbilities: any[];
  // gainedProperties: any[];
  // CSSstylesThisTurn: any[];
  // penaltyTurnsToWait: number;
  // entangledChildrenIds: string[];
}

// *** Broods

export interface Brood {
  id: string;
  units: ParticleUnit[];
  color: string;
  turnState: 'to do' | 'moving' | 'done';
  beginTurn(args?: { [key: string]: any | any[] }): void;
}

export class Brood implements Brood {
  beginTurn = (args?: { [key: string]: any | any[] }) => {
    let rndId = `${getRandom(1000)}`;
    const particle = new ParticleUnit(
      rndId,
      { row: 1, column: 1 },
      'blue',
      this.id
    );

    args.cb(particle);
  };

  constructor(id: string, units: ParticleUnit[], color: string) {
    this.id = id;
    this.units = units || null;
    this.color = color;
    this.turnState = 'to do';
  }
}

export type BasicInitialBroodFields = [Field, Field, Field, Field];

// *** BoardFields/Particles' Neigbhors, Broods' Root Spaces
export interface NeighborField {
  field: Field;
  at: string;
}

export interface NeighborsRaport {
  all: NeighborField[];
  centerField: Field;
  particles: NeighborField[];
  obsticles: NeighborField[];
  accessible: NeighborField[];
}

export interface ValidPotentialBroodSpace {
  startingPos: FieldPos;
  space: BasicInitialBroodFields;
}
