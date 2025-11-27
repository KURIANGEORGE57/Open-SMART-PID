import ProcessLineEdge from './ProcessLineEdge';
import SignalLineEdge from './SignalLineEdge';

// Edge type registry for React Flow
export const edgeTypes = {
  processLine: ProcessLineEdge,
  signalLine: SignalLineEdge,
};

export { ProcessLineEdge, SignalLineEdge };
