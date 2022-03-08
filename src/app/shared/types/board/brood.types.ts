import { getRandom } from '../../helpers/common.helpers';
import { Unit } from './unit.types';

// export interface Brood {
//   id: string;
//   units: Unit[];
//   color: string;
//   turnState: 'to do' | 'moving' | 'done';
//   beginTurn(args?: { [key: string]: any | any[] }): void;
// }

export class Brood {
  id: string;
  units: Unit[];
  color: string;
  turnState: 'to do' | 'moving' | 'done';

  beginTurn = (args?: { [key: string]: any | any[] }) => {
    let rndId = `${getRandom(1000)}`;
    const unit = new Unit(rndId, { row: 1, column: 1 }, 'blue', this.id);

    args.cb(unit);
  };

  constructor(id: string, units: Unit[], color: string) {
    this.id = id;
    this.units = units || undefined;
    this.color = color;
    this.turnState = 'to do';
  }
}
