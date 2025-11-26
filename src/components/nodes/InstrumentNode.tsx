import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Instrument, InstrumentLocation } from '../../types/schema';

interface InstrumentNodeData {
  instrument: Instrument;
  selected?: boolean;
}

/**
 * Instrument Node - renders instrument bubbles per ISA S5.1
 * 
 * Standard instrument bubble is a circle with:
 * - Tag number in upper half
 * - Function letters (FIC, TI, etc.)
 * - Horizontal line for field-mounted
 * - Additional line for panel-mounted
 * - Square for DCS/PLC
 */
function InstrumentNode({ data, selected }: NodeProps<InstrumentNodeData>) {
  const { instrument } = data;
  const { dimensions, tag, attributes, isInline } = instrument;
  const { width, height } = dimensions;
  
  const strokeColor = selected ? '#2563eb' : '#1f2937';
  const strokeWidth = selected ? 2.5 : 2;
  
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 4;
  
  // Build function string (e.g., "FIC" for Flow Indicating Controller)
  const functionString = attributes.function + attributes.types.join('');
  
  // Get location display indicator
  const getLocationIndicator = (location: InstrumentLocation) => {
    switch (location) {
      case 'field':
        return null; // No additional indicator
      case 'local_panel':
        return (
          <line
            x1={cx - radius}
            y1={cy}
            x2={cx + radius}
            y2={cy}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case 'control_room':
        return (
          <>
            <line x1={cx - radius} y1={cy - 3} x2={cx + radius} y2={cy - 3} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={cx - radius} y1={cy + 3} x2={cx + radius} y2={cy + 3} stroke={strokeColor} strokeWidth={strokeWidth} />
          </>
        );
      case 'dcs':
      case 'plc':
        return (
          <rect
            x={cx - radius * 0.7}
            y={cy - radius * 0.7}
            width={radius * 1.4}
            height={radius * 1.4}
            fill="none"
            stroke={strokeColor}
            strokeWidth={1}
          />
        );
      default:
        return null;
    }
  };
  
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
        {/* Main circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="white"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Location indicator */}
        {getLocationIndicator(attributes.location)}
        
        {/* Horizontal dividing line */}
        <line
          x1={cx - radius + 4}
          y1={cy}
          x2={cx + radius - 4}
          y2={cy}
          stroke={strokeColor}
          strokeWidth={1}
        />
        
        {/* Function letters (top half) */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
          fontFamily="monospace"
          fill={strokeColor}
        >
          {functionString}
        </text>
        
        {/* Loop number (bottom half) */}
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize={10}
          fontFamily="monospace"
          fill={strokeColor}
        >
          {attributes.loopNumber || ''}
        </text>
        
        {/* Inline indicator (if mounted on pipe) */}
        {isInline && (
          <>
            <line
              x1={0}
              y1={cy}
              x2={cx - radius}
              y2={cy}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <line
              x1={cx + radius}
              y1={cy}
              x2={width}
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
      
      {/* Connection handles */}
      {isInline ? (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="inlet"
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="outlet"
            className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
          />
        </>
      ) : (
        <>
          {/* Process connection (typically bottom for field instruments) */}
          <Handle
            type="target"
            position={Position.Bottom}
            id="process"
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
          />
          {/* Signal output (typically top) */}
          <Handle
            type="source"
            position={Position.Top}
            id="signal"
            className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
          />
        </>
      )}
    </div>
  );
}

export default memo(InstrumentNode);
