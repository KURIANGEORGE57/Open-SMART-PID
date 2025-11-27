import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Equipment } from '../../types/schema';

interface HeatExchangerNodeData {
  equipment: Equipment;
  selected?: boolean;
}

/**
 * Heat Exchanger Node
 *
 * Displays a shell & tube heat exchanger symbol (ISA standard)
 * The symbol shows a circle (shell) with internal tubes represented by horizontal lines
 */
function HeatExchangerNode({ data, selected }: NodeProps<HeatExchangerNodeData>) {
  const { equipment } = data;
  const width = equipment.dimensions.width;
  const height = equipment.dimensions.height;

  return (
    <div className="relative" style={{ width, height }}>
      {/* SVG Symbol - Shell & Tube Heat Exchanger */}
      <svg width={width} height={height} className="overflow-visible">
        {/* Shell (outer circle) */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={Math.min(width, height) / 2 - 4}
          fill="none"
          stroke={selected ? '#3b82f6' : '#1f2937'}
          strokeWidth={selected ? 2.5 : 2}
        />

        {/* Tubes (horizontal lines inside) */}
        {[0.3, 0.5, 0.7].map((ratio, i) => (
          <line
            key={i}
            x1={width * 0.2}
            y1={height * ratio}
            x2={width * 0.8}
            y2={height * ratio}
            stroke={selected ? '#3b82f6' : '#1f2937'}
            strokeWidth={selected ? 1.5 : 1}
          />
        ))}

        {/* Nozzles - Shell side */}
        <g>
          {/* Shell inlet (left top) */}
          <path
            d={`M ${width * 0.1} ${height * 0.2} L ${width * 0.25} ${height * 0.25}`}
            stroke={selected ? '#3b82f6' : '#1f2937'}
            strokeWidth={1.5}
            fill="none"
          />
          {/* Shell outlet (left bottom) */}
          <path
            d={`M ${width * 0.1} ${height * 0.8} L ${width * 0.25} ${height * 0.75}`}
            stroke={selected ? '#3b82f6' : '#1f2937'}
            strokeWidth={1.5}
            fill="none"
          />
        </g>

        {/* Nozzles - Tube side */}
        <g>
          {/* Tube inlet (right top) */}
          <path
            d={`M ${width * 0.9} ${height * 0.2} L ${width * 0.75} ${height * 0.25}`}
            stroke={selected ? '#3b82f6' : '#1f2937'}
            strokeWidth={1.5}
            fill="none"
          />
          {/* Tube outlet (right bottom) */}
          <path
            d={`M ${width * 0.9} ${height * 0.8} L ${width * 0.75} ${height * 0.75}`}
            stroke={selected ? '#3b82f6' : '#1f2937'}
            strokeWidth={1.5}
            fill="none"
          />
        </g>
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
      {/* Shell side */}
      <Handle
        type="source"
        position={Position.Left}
        id="shell-inlet"
        style={{ top: '20%', background: '#3b82f6' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="shell-outlet"
        style={{ top: '80%', background: '#3b82f6' }}
      />

      {/* Tube side */}
      <Handle
        type="source"
        position={Position.Right}
        id="tube-inlet"
        style={{ top: '20%', background: '#ef4444' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="tube-outlet"
        style={{ top: '80%', background: '#ef4444' }}
      />
    </div>
  );
}

export default memo(HeatExchangerNode);
