import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Equipment } from '../../types/schema';

/**
 * Pump Node - renders centrifugal pump symbol
 * ISA S5.1 style: circle with arrow indicating flow direction
 */
function PumpNode({ data, selected }: NodeProps) {
  const { equipment } = data as { equipment: Equipment; selected?: boolean };
  const { dimensions, tag, subtype } = equipment;
  const { width, height } = dimensions;
  
  const strokeColor = selected ? '#2563eb' : '#1f2937';
  const strokeWidth = selected ? 2.5 : 2;
  
  // Centrifugal pump: circle with discharge arrow
  const radius = Math.min(width, height) / 2 - 4;
  const cx = width / 2;
  const cy = height / 2;
  
  return (
    <div 
      className="relative"
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Pump circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Discharge arrow (pointing up-right for centrifugal) */}
        <path
          d={`
            M ${cx} ${cy - radius}
            L ${cx} ${cy - radius - 15}
            L ${cx + 8} ${cy - radius - 8}
            M ${cx} ${cy - radius - 15}
            L ${cx - 8} ${cy - radius - 8}
          `}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Suction line indicator */}
        <line
          x1={cx - radius}
          y1={cy}
          x2={cx - radius - 10}
          y2={cy}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Motor symbol (M in circle) - only for electric driven */}
        {subtype !== 'turbine' && (
          <>
            <circle
              cx={cx + radius + 15}
              cy={cy}
              r={10}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1.5}
            />
            <text
              x={cx + radius + 15}
              y={cy + 4}
              textAnchor="middle"
              fontSize={10}
              fontWeight="bold"
              fill={strokeColor}
            >
              M
            </text>
            {/* Shaft line connecting pump to motor */}
            <line
              x1={cx + radius}
              y1={cy}
              x2={cx + radius + 5}
              y2={cy}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </>
        )}
      </svg>
      
      {/* Tag label */}
      {tag && (
        <div 
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap 
                     text-xs font-mono font-semibold text-gray-800 bg-white px-1"
        >
          {tag}
        </div>
      )}
      
      {/* Suction handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="suction"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
        style={{ left: -10, top: '50%' }}
      />
      
      {/* Discharge handle (top) */}
      <Handle
        type="source"
        position={Position.Top}
        id="discharge"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ top: -15 }}
      />
    </div>
  );
}

export default memo(PumpNode);
