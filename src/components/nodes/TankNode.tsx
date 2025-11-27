import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Equipment } from '../../types/schema';

interface TankNodeData {
  equipment: Equipment;
  selected?: boolean;
}

/**
 * Tank Node
 *
 * Displays a storage tank symbol (ISA standard)
 * Shows an atmospheric storage tank with a flat or cone roof
 */
function TankNode({ data, selected }: NodeProps<TankNodeData>) {
  const { equipment } = data;
  const width = equipment.dimensions.width;
  const height = equipment.dimensions.height;

  return (
    <div className="relative" style={{ width, height }}>
      {/* SVG Symbol - Storage Tank */}
      <svg width={width} height={height} className="overflow-visible">
        {/* Tank body (rectangle) */}
        <rect
          x={width * 0.15}
          y={height * 0.15}
          width={width * 0.7}
          height={height * 0.7}
          fill="none"
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={selected ? 2.5 : 2}
        />

        {/* Tank roof (flat or cone) */}
        <path
          d={`M ${width * 0.15} ${height * 0.15} L ${width * 0.5} ${height * 0.05} L ${width * 0.85} ${height * 0.15}`}
          fill="none"
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={selected ? 2.5 : 2}
        />

        {/* Tank bottom (flat) */}
        <line
          x1={width * 0.15}
          y1={height * 0.85}
          x2={width * 0.85}
          y2={height * 0.85}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={selected ? 2.5 : 2}
        />

        {/* Liquid level indicator (dashed line) */}
        <line
          x1={width * 0.15}
          y1={height * 0.6}
          x2={width * 0.85}
          y2={height * 0.6}
          stroke={selected ? '#3b82f6' : '#6b7280'}
          strokeWidth={1}
          strokeDasharray="4,2"
        />

        {/* Inlet nozzle (top) */}
        <line
          x1={width * 0.3}
          y1={0}
          x2={width * 0.3}
          y2={height * 0.15}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={2}
        />

        {/* Outlet nozzle (bottom) */}
        <line
          x1={width * 0.5}
          y1={height * 0.85}
          x2={width * 0.5}
          y2={height}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={2}
        />

        {/* Vent nozzle (top right) */}
        <line
          x1={width * 0.7}
          y1={height * 0.05}
          x2={width * 0.85}
          y2={0}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={1.5}
        />

        {/* Drain nozzle (bottom right) */}
        <line
          x1={width * 0.85}
          y1={height * 0.85}
          x2={width}
          y2={height}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={1.5}
        />

        {/* Level measurement nozzle (side) */}
        <line
          x1={width * 0.85}
          y1={height * 0.6}
          x2={width}
          y2={height * 0.6}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={1.5}
        />
      </svg>

      {/* Tag Label */}
      {equipment.tag && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-xs font-mono font-semibold whitespace-nowrap"
          style={{ top: height + 4 }}
        >
          {equipment.tag}
        </div>
      )}

      {/* Connection Handles */}
      {/* Inlet (top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="inlet"
        style={{ left: '30%', background: '#10b981' }}
      />

      {/* Outlet (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="outlet"
        style={{ left: '50%', background: '#3b82f6' }}
      />

      {/* Vent (top right) */}
      <Handle
        type="source"
        position={Position.Top}
        id="vent"
        style={{ left: '85%', background: '#f59e0b' }}
      />

      {/* Drain (bottom right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="drain"
        style={{ top: '100%', background: '#ef4444' }}
      />

      {/* Level measurement (right side) */}
      <Handle
        type="source"
        position={Position.Right}
        id="level"
        style={{ top: '60%', background: '#8b5cf6' }}
      />
    </div>
  );
}

export default memo(TankNode);
