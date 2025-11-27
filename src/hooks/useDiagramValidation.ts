import { useMemo } from 'react';
import { validateDiagram, ValidationResult } from '../utils/validation';
import { useDiagramStore } from '../store/diagramStore';

/**
 * Hook to automatically validate the current diagram
 *
 * Runs validation whenever the diagram changes and returns the result.
 * This hook is memoized to avoid re-running validation unnecessarily.
 *
 * @returns Validation result with errors, warnings, and info
 */
export function useDiagramValidation(): ValidationResult {
  const diagram = useDiagramStore((state) => state.diagram);

  const validationResult = useMemo(() => {
    return validateDiagram(diagram, {
      rules: ['duplicate_tag', 'orphan_line', 'disconnected_equipment', 'missing_tag'],
      minSeverity: 'info',
    });
  }, [
    diagram.equipment,
    diagram.valves,
    diagram.instruments,
    diagram.lines,
    diagram.annotations,
  ]);

  return validationResult;
}
