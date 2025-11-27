import { memo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from '@xyflow/react';

/**
 * Process Line Edge Component
 *
 * Custom edge for process lines (pipes) in P&ID diagrams
 * Features:
 * - Smooth step routing
 * - Line number label
 * - Different stroke styles based on fluid type
 * - Support for insulation/tracing indicators
 */
function ProcessLineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get line properties from data
  const lineNumber = data?.lineNumber;
  const lineType = data?.lineType || 'process';
  const insulation = data?.insulation;
  const tracing = data?.tracing;

  // Determine stroke style based on line type
  const getStrokeStyle = () => {
    switch (lineType) {
      case 'utility':
        return { strokeDasharray: '8,4' };
      case 'signal':
        return { strokeDasharray: '4,2' };
      case 'electrical':
        return { strokeDasharray: '2,2' };
      default:
        return {};
    }
  };

  const strokeStyle = getStrokeStyle();

  return (
    <>
      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          ...strokeStyle,
        }}
      />

      {/* Insulation indicator (double line) */}
      {insulation && (
        <path
          d={edgePath}
          fill="none"
          stroke={style.stroke || '#1f2937'}
          strokeWidth={selected ? 5 : 4}
          strokeOpacity={0.3}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Edge label */}
      {lineNumber && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200">
              <div className="text-[10px] font-mono text-gray-700 whitespace-nowrap">
                {lineNumber}
              </div>
              {(insulation || tracing) && (
                <div className="text-[8px] text-gray-500 flex gap-1">
                  {insulation && <span>I:{insulation}</span>}
                  {tracing && <span>T:{tracing}</span>}
                </div>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(ProcessLineEdge);
