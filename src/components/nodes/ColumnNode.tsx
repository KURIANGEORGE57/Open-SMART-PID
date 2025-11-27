import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Equipment } from '../../types/schema';

interface ColumnNodeData {
  equipment: Equipment;
  selected?: boolean;
}

/**
 * Column Node
 *
 * Displays a distillation column symbol (ISA standard)
 * Vertical column with internal trays/packing representation
 */
function ColumnNode({ data, selected }: NodeProps<ColumnNodeData>) {
  const { equipment } = data;
  const width = equipment.dimensions.width;
  const height = equipment.dimensions.height;

  // Number of trays to display
  const numTrays = 8;
  const traySpacing = (height * 0.8) / (numTrays + 1);

  return (
    <div className="relative" style={{ width, height }}>
      {/* SVG Symbol - Distillation Column */}
      <svg width={width} height={height} className="overflow-visible">
        {/* Column shell */}
        <rect
          x={width * 0.25}
          y={height * 0.1}
          width={width * 0.5}
          height={height * 0.8}
          fill="none"
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={selected ? 2.5 : 2}
          rx={2}
        />

        {/* Internal trays (horizontal lines) */}
        {Array.from({ length: numTrays }).map((_, i) => {
          const y = height * 0.1 + traySpacing * (i + 1);
          return (
            <line
              key={i}
              x1={width * 0.25}
              y1={y}
              x2={width * 0.75}
              y2={y}
              stroke={selected ? '#3b82f6' : '#6b7280'}
              strokeWidth={0.5}
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Top vapor outlet */}
        <line
          x1={width * 0.5}
          y1={0}
          x2={width * 0.5}
          y2={height * 0.1}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={2}
        />

        {/* Bottom liquid outlet */}
        <line
          x1={width * 0.5}
          y1={height * 0.9}
          x2={width * 0.5}
          y2={height}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={2}
        />

        {/* Feed inlet (middle left) */}
        <line
          x1={0}
          y1={height * 0.5}
          x2={width * 0.25}
          y2={height * 0.5}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={2}
        />

        {/* Reflux (top left) */}
        <line
          x1={0}
          y1={height * 0.2}
          x2={width * 0.25}
          y2={height * 0.2}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={1.5}
        />

        {/* Side draw (middle right) */}
        <line
          x1={width * 0.75}
          y1={height * 0.6}
          x2={width}
          y2={height * 0.6}
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={1.5}
        />

        {/* Reboiler return (bottom left) */}
        <line
          x1={0}
          y1={height * 0.85}
          x2={width * 0.25}
          y2={height * 0.85}
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
      {/* Top vapor */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-vapor"
        style={{ left: '50%', background: '#ef4444' }}
      />

      {/* Bottom liquid */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-liquid"
        style={{ left: '50%', background: '#3b82f6' }}
      />

      {/* Feed */}
      <Handle
        type="target"
        position={Position.Left}
        id="feed"
        style={{ top: '50%', background: '#10b981' }}
      />

      {/* Reflux */}
      <Handle
        type="target"
        position={Position.Left}
        id="reflux"
        style={{ top: '20%', background: '#3b82f6' }}
      />

      {/* Side draw */}
      <Handle
        type="source"
        position={Position.Right}
        id="side-draw"
        style={{ top: '60%', background: '#f59e0b' }}
      />

      {/* Reboiler return */}
      <Handle
        type="target"
        position={Position.Left}
        id="reboiler-return"
        style={{ top: '85%', background: '#ef4444' }}
      />
    </div>
  );
}

export default memo(ColumnNode);
