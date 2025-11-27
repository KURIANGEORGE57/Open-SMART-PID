import VesselNode from './VesselNode';
import PumpNode from './PumpNode';
import ValveNode from './ValveNode';
import InstrumentNode from './InstrumentNode';
import HeatExchangerNode from './HeatExchangerNode';
import ColumnNode from './ColumnNode';
import TankNode from './TankNode';

// Node type registry for React Flow
export const nodeTypes = {
  vessel: VesselNode,
  pump: PumpNode,
  valve: ValveNode,
  instrument: InstrumentNode,
  heat_exchanger: HeatExchangerNode,
  column: ColumnNode,
  tank: TankNode,
};

export { VesselNode, PumpNode, ValveNode, InstrumentNode, HeatExchangerNode, ColumnNode, TankNode };
