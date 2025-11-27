/**
 * Serialization utilities for saving and loading P&ID diagrams
 */

import { PIDDiagram } from '../types/schema';

/**
 * Save diagram to JSON file
 * @param diagram - The P&ID diagram to save
 */
export function saveDiagramToFile(diagram: PIDDiagram): void {
  const json = JSON.stringify(diagram, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${diagram.metadata.title || 'pid-diagram'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Load diagram from JSON file
 * @param onLoad - Callback function called with loaded diagram
 * @param onError - Callback function called on error
 */
export function loadDiagramFromFile(
  onLoad: (diagram: PIDDiagram) => void,
  onError?: (error: Error) => void
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // TODO: Add schema validation here
        onLoad(json as PIDDiagram);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to parse JSON');
        if (onError) {
          onError(error);
        } else {
          alert(`Failed to load diagram: ${error.message}`);
        }
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/**
 * Export diagram to JSON string
 * @param diagram - The P&ID diagram to export
 * @param pretty - Whether to format JSON with indentation
 * @returns JSON string representation of the diagram
 */
export function exportDiagramToJSON(diagram: PIDDiagram, pretty = true): string {
  return JSON.stringify(diagram, null, pretty ? 2 : 0);
}

/**
 * Import diagram from JSON string
 * @param json - JSON string to parse
 * @returns Parsed P&ID diagram
 */
export function importDiagramFromJSON(json: string): PIDDiagram {
  const diagram = JSON.parse(json) as PIDDiagram;
  // TODO: Add schema validation and migration
  return diagram;
}
