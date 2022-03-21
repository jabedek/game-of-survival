import { getRandom } from '../../helpers/common.helpers';
import { GroupTurnPhase } from '../game.types';
import { GroupId } from './unit-base.types';
import { Unit } from './unit.types';

export class Group {
  id: GroupId;
  units: Unit[];
  color: string;
  turnState: GroupTurnPhase;

  beginTurn = (args?: { [key: string]: any | any[] }) => {
    let rndId = `${getRandom(1000)}`;
    const unit = new Unit(rndId, { row: 1, column: 1 }, 'blue', this.id);

    args?.cb(unit);
  };

  constructor(id: GroupId, units: Unit[], color: string) {
    this.id = id;
    this.units = units || undefined;
    this.color = color;
    this.turnState = GroupTurnPhase.TO_DO;
  }
}
