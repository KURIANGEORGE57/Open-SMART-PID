import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Valve } from '../../types/schema';

/**
 * Valve Node - renders various valve symbols
 * ISA S5.1 / ISO 10628 style symbols
 */
function ValveNode({ data, selected }: NodeProps) {
  const { valve } = data as { valve: Valve; selected?: boolean };
  const { dimensions, tag, category, attributes } = valve;
  const { width, height } = dimensions;
  
  const strokeColor = selected ? '#2563eb' : '#1f2937';
  const strokeWidth = selected ? 2.5 : 2;
  
  const renderValveSymbol = () => {
    switch (category) {
      case 'gate':
        return <GateValveSymbol width={width} height={height} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'globe':
        return <GlobeValveSymbol width={width} height={height} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'ball':
        return <BallValveSymbol width={width} height={height} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'butterfly':
        return <ButterflyValveSymbol width={width} height={height} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'check':
        return <CheckValveSymbol width={width} height={height} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'control':
        return <ControlValveSymbol width={width} height={height} stroke={strokeColor} strokeWidth={strokeWidth} />;
      case 'relief':
        return <ReliefValveSymbol width={width} height={height} stroke={strokeColor} strokeWidth={strokeWidth} />;
      default:
        return <GateValveSymbol width={width} height={height} stroke={strokeColor} strokeWidth={strokeWidth} />;
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
        {renderValveSymbol()}
        
        {/* Actuator indicator if not manual */}
        {attributes.actuator && attributes.actuator !== 'manual' && (
          <ActuatorSymbol 
            type={attributes.actuator} 
            width={width} 
            height={height}
            stroke={strokeColor}
          />
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
      
      {/* Inlet handle (left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="inlet"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
      
      {/* Outlet handle (right) */}
      <Handle
        type="source"
        position={Position.Right}
        id="outlet"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  );
}

// =============================================================================
// VALVE SYMBOL COMPONENTS
// =============================================================================

interface SymbolProps {
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
}

/** Gate valve: two triangles meeting at center */
function GateValveSymbol({ width, height, stroke, strokeWidth }: SymbolProps) {
  const cx = width / 2;
  const cy = height / 2;
  const triangleHeight = height * 0.4;
  
  return (
    <g>
      {/* Left triangle */}
      <path
        d={`
          M 0 ${cy - triangleHeight}
          L ${cx} ${cy}
          L 0 ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Right triangle */}
      <path
        d={`
          M ${width} ${cy - triangleHeight}
          L ${cx} ${cy}
          L ${width} ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Stem */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - triangleHeight - 10}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

/** Globe valve: gate valve with horizontal bar at center */
function GlobeValveSymbol({ width, height, stroke, strokeWidth }: SymbolProps) {
  const cx = width / 2;
  const cy = height / 2;
  const triangleHeight = height * 0.4;
  
  return (
    <g>
      {/* Left triangle */}
      <path
        d={`
          M 0 ${cy - triangleHeight}
          L ${cx} ${cy}
          L 0 ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Right triangle */}
      <path
        d={`
          M ${width} ${cy - triangleHeight}
          L ${cx} ${cy}
          L ${width} ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Horizontal bar (globe indicator) */}
      <line
        x1={cx - 6}
        y1={cy}
        x2={cx + 6}
        y2={cy}
        stroke={stroke}
        strokeWidth={strokeWidth + 1}
      />
      {/* Stem */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - triangleHeight - 10}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

/** Ball valve: gate valve with circle at center */
function BallValveSymbol({ width, height, stroke, strokeWidth }: SymbolProps) {
  const cx = width / 2;
  const cy = height / 2;
  const triangleHeight = height * 0.4;
  
  return (
    <g>
      {/* Left triangle */}
      <path
        d={`
          M 0 ${cy - triangleHeight}
          L ${cx} ${cy}
          L 0 ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Right triangle */}
      <path
        d={`
          M ${width} ${cy - triangleHeight}
          L ${cx} ${cy}
          L ${width} ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Circle (ball indicator) */}
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={stroke}
        stroke={stroke}
        strokeWidth={1}
      />
      {/* Stem */}
      <line
        x1={cx}
        y1={cy - 5}
        x2={cx}
        y2={cy - triangleHeight - 10}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

/** Butterfly valve: two triangles with line through center */
function ButterflyValveSymbol({ width, height, stroke, strokeWidth }: SymbolProps) {
  const cx = width / 2;
  const cy = height / 2;
  const triangleHeight = height * 0.4;
  
  return (
    <g>
      {/* Left triangle */}
      <path
        d={`
          M 0 ${cy - triangleHeight}
          L ${cx} ${cy}
          L 0 ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Right triangle */}
      <path
        d={`
          M ${width} ${cy - triangleHeight}
          L ${cx} ${cy}
          L ${width} ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Disc line */}
      <line
        x1={cx - 8}
        y1={cy - 8}
        x2={cx + 8}
        y2={cy + 8}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Stem */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - triangleHeight - 10}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

/** Check valve: triangles with arrow showing flow direction */
function CheckValveSymbol({ width, height, stroke, strokeWidth }: SymbolProps) {
  const cx = width / 2;
  const cy = height / 2;
  const triangleHeight = height * 0.4;
  
  return (
    <g>
      {/* Left triangle (filled to show direction) */}
      <path
        d={`
          M 0 ${cy - triangleHeight}
          L ${cx} ${cy}
          L 0 ${cy + triangleHeight}
          Z
        `}
        fill={stroke}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Right triangle */}
      <path
        d={`
          M ${width} ${cy - triangleHeight}
          L ${cx} ${cy}
          L ${width} ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

/** Control valve: gate valve with diaphragm actuator symbol */
function ControlValveSymbol({ width, height, stroke, strokeWidth }: SymbolProps) {
  const cx = width / 2;
  const cy = height / 2;
  const triangleHeight = height * 0.35;
  
  return (
    <g>
      {/* Left triangle */}
      <path
        d={`
          M 0 ${cy - triangleHeight}
          L ${cx} ${cy}
          L 0 ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Right triangle */}
      <path
        d={`
          M ${width} ${cy - triangleHeight}
          L ${cx} ${cy}
          L ${width} ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Stem */}
      <line
        x1={cx}
        y1={cy}
        x2={cx}
        y2={cy - triangleHeight - 8}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Diaphragm actuator */}
      <rect
        x={cx - 10}
        y={cy - triangleHeight - 23}
        width={20}
        height={15}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

/** Relief/Safety valve */
function ReliefValveSymbol({ width, height, stroke, strokeWidth }: SymbolProps) {
  const cx = width / 2;
  const cy = height / 2;
  const triangleHeight = height * 0.4;
  
  return (
    <g>
      {/* Angled body (relief valve characteristic) */}
      <path
        d={`
          M 0 ${cy}
          L ${cx} ${cy - triangleHeight}
          L ${cx} ${cy + triangleHeight}
          Z
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {/* Spring symbol */}
      <path
        d={`
          M ${cx} ${cy - triangleHeight}
          L ${cx} ${cy - triangleHeight - 5}
          L ${cx - 5} ${cy - triangleHeight - 10}
          L ${cx + 5} ${cy - triangleHeight - 15}
          L ${cx - 5} ${cy - triangleHeight - 20}
          L ${cx + 5} ${cy - triangleHeight - 25}
          L ${cx} ${cy - triangleHeight - 30}
        `}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </g>
  );
}

/** Actuator symbol rendered above valve */
interface ActuatorProps {
  type: string;
  width: number;
  height: number;
  stroke: string;
}

function ActuatorSymbol({ type, width, height, stroke }: ActuatorProps) {
  const cx = width / 2;
  const topY = height * 0.1 - 25;
  
  if (type === 'pneumatic') {
    return (
      <circle
        cx={cx}
        cy={topY}
        r={8}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
      />
    );
  }
  
  if (type === 'electric') {
    return (
      <>
        <circle cx={cx} cy={topY} r={8} fill="none" stroke={stroke} strokeWidth={1.5} />
        <text x={cx} y={topY + 3} textAnchor="middle" fontSize={8} fill={stroke}>M</text>
      </>
    );
  }
  
  return null;
}

export default memo(ValveNode);
