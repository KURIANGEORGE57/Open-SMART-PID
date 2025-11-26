import VesselNode from './VesselNode';
import PumpNode from './PumpNode';
import ValveNode from './ValveNode';
import InstrumentNode from './InstrumentNode';

// Node type registry for React Flow
export const nodeTypes = {
  vessel: VesselNode,
  pump: PumpNode,
  valve: ValveNode,
  instrument: InstrumentNode,
};

export { VesselNode, PumpNode, ValveNode, InstrumentNode };
