import { Unit } from './types-interfaces';

export interface ParticleState {
  chancesToDieBase: number;
  chancesToDieThisTurn: number;
  chancesToReproduceThisTurn: number;
  neighborsThisTurn: number;
  neededNeighborsForReproduction: number;
  availableSpotsThisTurn: number;
  gainedAbilities: any[];
  gainedProperties: any[];
  CSSstylesThisTurn: any[];
  penaltyTurnsToWait: number;
  entangledChildrenIds: string[];
}

export class ParticleUnit {
  unit: Unit;
  state: ParticleState;
  makeTurn() {
    return true;
  }
  setLongTermGoal() {
    return true;
  }
}
