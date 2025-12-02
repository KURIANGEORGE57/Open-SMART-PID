import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import { useDiagramStore } from '../store/diagramStore';
import {
  Equipment,
  ProcessLine,
  createLine
} from '../types/schema';

/**
 * Canvas Component
 * 
 * Main diagram editing surface using React Flow.
 * Converts between our P&ID schema and React Flow's node/edge format.
 */
export default function Canvas() {
  const {
    diagram,
    selectedIds,
    select,
    clearSelection,
    updateEquipment,
    updateValve,
    updateInstrument,
    addLine,
    removeLine,
  } = useDiagramStore();

  // Convert P&ID schema to React Flow nodes
  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];
    
    // Equipment nodes
    diagram.equipment.forEach((eq) => {
      result.push({
        id: eq.id,
        type: getNodeType(eq),
        position: eq.position,
        data: { 
          equipment: eq,
          selected: selectedIds.includes(eq.id)
        },
        selected: selectedIds.includes(eq.id),
      });
    });
    
    // Valve nodes
    diagram.valves.forEach((valve) => {
      result.push({
        id: valve.id,
        type: 'valve',
        position: valve.position,
        data: { 
          valve,
          selected: selectedIds.includes(valve.id)
        },
        selected: selectedIds.includes(valve.id),
      });
    });
    
    // Instrument nodes
    diagram.instruments.forEach((inst) => {
      result.push({
        id: inst.id,
        type: 'instrument',
        position: inst.position,
        data: { 
          instrument: inst,
          selected: selectedIds.includes(inst.id)
        },
        selected: selectedIds.includes(inst.id),
      });
    });
    
    return result;
  }, [diagram.equipment, diagram.valves, diagram.instruments, selectedIds]);

  // Convert P&ID lines to React Flow edges
  const edges: Edge[] = useMemo(() => {
    return diagram.lines.map((line) => ({
      id: line.id,
      source: line.source.elementId,
      sourceHandle: line.source.nozzleId || line.source.connectionPoint,
      target: line.target.elementId,
      targetHandle: line.target.nozzleId || line.target.connectionPoint,
      type: 'smoothstep',
      style: { 
        stroke: getLineColor(line),
        strokeWidth: 2,
      },
      label: line.attributes.lineNumber,
      labelStyle: { 
        fontSize: 10, 
        fontFamily: 'monospace',
        fill: '#374151',
      },
      labelBgStyle: { fill: 'white' },
      selected: selectedIds.includes(line.id),
    }));
  }, [diagram.lines, selectedIds]);

  // Handle node position changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        const nodeId = change.id;
        const newPosition = change.position;
        
        // Find which collection the node belongs to and update
        const equipment = diagram.equipment.find((e) => e.id === nodeId);
        if (equipment) {
          updateEquipment(nodeId, { position: newPosition });
          return;
        }
        
        const valve = diagram.valves.find((v) => v.id === nodeId);
        if (valve) {
          updateValve(nodeId, { position: newPosition });
          return;
        }
        
        const instrument = diagram.instruments.find((i) => i.id === nodeId);
        if (instrument) {
          updateInstrument(nodeId, { position: newPosition });
          return;
        }
      }
    });
  }, [diagram, updateEquipment, updateValve, updateInstrument]);

  // Handle edge changes (deletion)
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    changes.forEach((change) => {
      if (change.type === 'remove') {
        removeLine(change.id);
      }
    });
  }, [removeLine]);

  // Handle new connections
  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    const newLine = createLine({
      source: {
        elementId: connection.source,
        nozzleId: connection.sourceHandle || undefined,
        connectionPoint: connection.sourceHandle || undefined,
      },
      target: {
        elementId: connection.target,
        nozzleId: connection.targetHandle || undefined,
        connectionPoint: connection.targetHandle || undefined,
      },
      lineType: 'process',
      attributes: {},
    });
    
    addLine(newLine);
  }, [addLine]);

  // Handle selection changes
  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
    const nodeIds = nodes.map((n) => n.id);
    const edgeIds = edges.map((e) => e.id);
    select([...nodeIds, ...edgeIds]);
  }, [select]);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[10, 10]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { strokeWidth: 2 },
        }}
        connectionLineStyle={{ strokeWidth: 2 }}
        className="bg-white"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#d1d5db"
        />
        <Controls 
          className="!bg-white !border-gray-300 !shadow-md"
        />
        <MiniMap 
          className="!bg-gray-100 !border-gray-300"
          nodeColor={(node) => {
            switch (node.type) {
              case 'vessel':
              case 'pump':
                return '#3b82f6';
              case 'valve':
                return '#10b981';
              case 'instrument':
                return '#f59e0b';
              default:
                return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Map equipment category to React Flow node type */
function getNodeType(equipment: Equipment): string {
  switch (equipment.category) {
    case 'vessel':
    case 'drum':
    case 'tank':
    case 'column':
    case 'reactor':
      return 'vessel';
    case 'pump':
    case 'compressor':
    case 'blower':
      return 'pump';
    case 'heat_exchanger':
      return 'vessel'; // TODO: Create dedicated HX node
    default:
      return 'vessel';
  }
}

/** Get line color based on line type */
function getLineColor(line: ProcessLine): string {
  switch (line.lineType) {
    case 'process':
      return '#1f2937';
    case 'utility':
      return '#059669';
    case 'signal':
      return '#d97706';
    case 'electrical':
      return '#dc2626';
    case 'pneumatic':
      return '#2563eb';
    case 'hydraulic':
      return '#7c3aed';
    default:
      return '#1f2937';
  }
}
