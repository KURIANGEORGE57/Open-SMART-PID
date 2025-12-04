import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Equipment } from '../../types/schema';

interface VesselNodeData {
  equipment: Equipment;
  selected?: boolean;
}

/**
 * Vessel Node - renders vertical pressure vessels, drums, etc.
 * ISA S5.1 style symbol
 */
function VesselNode({ data, selected }: NodeProps<VesselNodeData>) {
  const { equipment } = data;
  const { dimensions, tag } = equipment;
  const { width, height } = dimensions;
  
  // Calculate head radius (typically 1/4 of width for 2:1 elliptical)
  const headRadius = width / 4;
  
  return (
    <div 
      className="relative"
      style={{ width, height }}
    >
      {/* SVG Symbol */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Vessel body */}
        <path
          d={`
            M ${headRadius} ${headRadius}
            A ${headRadius} ${headRadius} 0 0 1 ${width - headRadius} ${headRadius}
            L ${width - headRadius} ${height - headRadius}
            A ${headRadius} ${headRadius} 0 0 1 ${headRadius} ${height - headRadius}
            Z
          `}
          fill="none"
          stroke={selected ? '#2563eb' : '#1f2937'}
          strokeWidth={selected ? 2.5 : 2}
          className="transition-colors"
        />
        
        {/* Top head (ellipse) */}
        <ellipse
          cx={width / 2}
          cy={headRadius}
          rx={width / 2 - headRadius}
          ry={headRadius}
          fill="none"
          stroke={selected ? '#2563eb' : '#1f2937'}
          strokeWidth={selected ? 2.5 : 2}
        />
        
        {/* Bottom head (ellipse) */}
        <ellipse
          cx={width / 2}
          cy={height - headRadius}
          rx={width / 2 - headRadius}
          ry={headRadius}
          fill="none"
          stroke={selected ? '#2563eb' : '#1f2937'}
          strokeWidth={selected ? 2.5 : 2}
        />
        
        {/* Centerline (dashed) */}
        <line
          x1={width / 2}
          y1={0}
          x2={width / 2}
          y2={height}
          stroke="#9ca3af"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
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
      
      {/* Default nozzle handles */}
      {/* Top center */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ top: 0 }}
      />
      
      {/* Bottom center */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ bottom: 0 }}
      />
      
      {/* Left side */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ top: '50%' }}
      />
      
      {/* Right side */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ top: '50%' }}
      />
    </div>
  );
}

export default memo(VesselNode);
