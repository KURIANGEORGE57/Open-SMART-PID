import { memo } from 'react';
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  EdgeLabelRenderer,
} from '@xyflow/react';

/**
 * Signal Line Edge Component
 *
 * Custom edge for instrument signal lines in P&ID diagrams
 * Features:
 * - Dashed line style
 * - Signal type indicator (pneumatic, electrical, digital)
 * - Color coding by signal type
 */
function SignalLineEdge({
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

  // Get signal properties from data
  const signalType = data?.signalType || 'electrical';
  const signalLabel = data?.signalLabel;

  // Determine color and style based on signal type
  const getSignalStyle = () => {
    switch (signalType) {
      case 'pneumatic':
        return {
          stroke: '#2563eb', // blue
          strokeDasharray: '8,4',
        };
      case 'electrical':
        return {
          stroke: '#dc2626', // red
          strokeDasharray: '4,2',
        };
      case 'digital':
      case 'fieldbus':
        return {
          stroke: '#7c3aed', // purple
          strokeDasharray: '2,2',
        };
      case 'hydraulic':
        return {
          stroke: '#059669', // green
          strokeDasharray: '6,3',
        };
      default:
        return {
          stroke: '#6b7280', // gray
          strokeDasharray: '4,2',
        };
    }
  };

  const signalStyle = getSignalStyle();

  return (
    <>
      {/* Main signal line */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...signalStyle,
          strokeWidth: selected ? 2.5 : 1.5,
        }}
      />

      {/* Signal type label */}
      {signalLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div
              className="px-1.5 py-0.5 rounded text-[9px] font-medium text-white shadow-sm"
              style={{ backgroundColor: signalStyle.stroke }}
            >
              {signalLabel}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(SignalLineEdge);
