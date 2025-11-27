import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useDiagramValidation } from '../hooks/useDiagramValidation';
import { useState } from 'react';
import { ValidationError } from '../utils/validation';

/**
 * Validation Indicator Component
 *
 * Shows a visual indicator of diagram validation status
 * Displays errors, warnings, and info messages
 */
export default function ValidationIndicator() {
  const validationResult = useDiagramValidation();
  const [isExpanded, setIsExpanded] = useState(false);

  const { summary, errors } = validationResult;
  const hasErrors = summary.errors > 0;
  const hasWarnings = summary.warnings > 0;
  const hasInfo = summary.info > 0;

  // Determine indicator color and icon
  const getIndicatorStyle = () => {
    if (hasErrors) {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500',
        icon: <AlertCircle size={16} />,
      };
    }
    if (hasWarnings) {
      return {
        color: 'text-amber-400',
        bgColor: 'bg-amber-500',
        icon: <AlertTriangle size={16} />,
      };
    }
    if (hasInfo) {
      return {
        color: 'text-blue-400',
        bgColor: 'bg-blue-500',
        icon: <Info size={16} />,
      };
    }
    return {
      color: 'text-green-400',
      bgColor: 'bg-green-500',
      icon: <CheckCircle size={16} />,
    };
  };

  const style = getIndicatorStyle();

  return (
    <div className="relative">
      {/* Indicator Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1 rounded ${style.color} hover:bg-gray-700 transition-colors`}
        title="Validation Status"
      >
        {style.icon}
        <span className="text-xs font-medium">
          {hasErrors && `${summary.errors} error${summary.errors > 1 ? 's' : ''}`}
          {hasWarnings && !hasErrors && `${summary.warnings} warning${summary.warnings > 1 ? 's' : ''}`}
          {hasInfo && !hasErrors && !hasWarnings && `${summary.info} info`}
          {!hasErrors && !hasWarnings && !hasInfo && 'Valid'}
        </span>
      </button>

      {/* Expanded Error List */}
      {isExpanded && errors.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-white">Validation Issues</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {errors.map((error) => (
              <ValidationErrorItem key={error.id} error={error} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual validation error item
 */
function ValidationErrorItem({ error }: { error: ValidationError }) {
  const getIcon = () => {
    switch (error.severity) {
      case 'error':
        return <AlertCircle size={14} className="text-red-400" />;
      case 'warning':
        return <AlertTriangle size={14} className="text-amber-400" />;
      case 'info':
        return <Info size={14} className="text-blue-400" />;
    }
  };

  return (
    <div className="p-3 hover:bg-gray-750 transition-colors">
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white">{error.message}</p>
          {error.details && (
            <p className="text-xs text-gray-400 mt-1">
              {JSON.stringify(error.details, null, 2)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Type: {error.type} • Elements: {error.elementIds.length}
          </p>
        </div>
      </div>
    </div>
  );
}
