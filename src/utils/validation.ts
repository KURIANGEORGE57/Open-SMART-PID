/**
 * Validation Engine for Smart P&ID
 * 
 * This module provides validation rules to check P&ID diagrams for:
 * - Duplicate tag numbers
 * - Orphan connections (lines referencing non-existent elements)
 * - Disconnected equipment (no incoming/outgoing lines)
 * - Missing required attributes
 * - Spec break consistency
 * - Control loop completeness
 * 
 * @module validation
 */

import {
  PIDDiagram
} from '../types/schema';

// =============================================================================
// TYPES
// =============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export type ValidationRuleType = 
  | 'duplicate_tag'
  | 'orphan_line'
  | 'disconnected_equipment'
  | 'missing_tag'
  | 'missing_attribute'
  | 'spec_break_mismatch'
  | 'incomplete_control_loop'
  | 'invalid_connection';

export interface ValidationError {
  /** Unique identifier for this error instance */
  id: string;
  /** Type of validation rule that failed */
  type: ValidationRuleType;
  /** Severity level */
  severity: ValidationSeverity;
  /** Human-readable error message */
  message: string;
  /** IDs of elements involved in this error */
  elementIds: string[];
  /** Additional context */
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  /** Whether the diagram passed all error-level validations */
  valid: boolean;
  /** List of all validation issues */
  errors: ValidationError[];
  /** Count by severity */
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export interface ValidationOptions {
  /** Which rules to run (default: all) */
  rules?: ValidationRuleType[];
  /** Minimum severity to report (default: 'info') */
  minSeverity?: ValidationSeverity;
  /** Stop on first error (default: false) */
  failFast?: boolean;
}

// =============================================================================
// VALIDATION ENGINE
// =============================================================================

/**
 * Validates a P&ID diagram against all validation rules.
 * 
 * @param diagram - The diagram to validate
 * @param options - Validation options
 * @returns Validation result with all errors found
 * 
 * @example
 * ```ts
 * const result = validateDiagram(diagram);
 * if (!result.valid) {
 *   console.log('Validation failed:', result.errors);
 * }
 * ```
 */
export function validateDiagram(
  diagram: PIDDiagram, 
  options: ValidationOptions = {}
): ValidationResult {
  const errors: ValidationError[] = [];
  
  const rulesToRun = options.rules || [
    'duplicate_tag',
    'orphan_line',
    'disconnected_equipment',
    'missing_tag',
  ];
  
  // Run each validation rule
  if (rulesToRun.includes('duplicate_tag')) {
    errors.push(...checkDuplicateTags(diagram));
  }
  
  if (rulesToRun.includes('orphan_line')) {
    errors.push(...checkOrphanLines(diagram));
  }
  
  if (rulesToRun.includes('disconnected_equipment')) {
    errors.push(...checkDisconnectedEquipment(diagram));
  }
  
  if (rulesToRun.includes('missing_tag')) {
    errors.push(...checkMissingTags(diagram));
  }
  
  // Filter by severity if specified
  const minSeverityLevel = getSeverityLevel(options.minSeverity || 'info');
  const filteredErrors = errors.filter(
    e => getSeverityLevel(e.severity) >= minSeverityLevel
  );
  
  // Calculate summary
  const summary = {
    errors: filteredErrors.filter(e => e.severity === 'error').length,
    warnings: filteredErrors.filter(e => e.severity === 'warning').length,
    info: filteredErrors.filter(e => e.severity === 'info').length,
  };
  
  return {
    valid: summary.errors === 0,
    errors: filteredErrors,
    summary,
  };
}

// =============================================================================
// VALIDATION RULES
// =============================================================================

/**
 * Check for duplicate tag numbers across all element types.
 */
function checkDuplicateTags(diagram: PIDDiagram): ValidationError[] {
  const errors: ValidationError[] = [];
  const tagMap = new Map<string, { id: string; type: string }[]>();
  
  // Collect all tags
  const collectTags = (elements: { id: string; tag?: string }[], type: string) => {
    elements.forEach(el => {
      if (el.tag) {
        const existing = tagMap.get(el.tag) || [];
        existing.push({ id: el.id, type });
        tagMap.set(el.tag, existing);
      }
    });
  };
  
  collectTags(diagram.equipment, 'equipment');
  collectTags(diagram.valves, 'valve');
  collectTags(diagram.instruments, 'instrument');
  
  // Find duplicates
  tagMap.forEach((elements, tag) => {
    if (elements.length > 1) {
      errors.push({
        id: `dup-tag-${tag}`,
        type: 'duplicate_tag',
        severity: 'error',
        message: `Duplicate tag "${tag}" found on ${elements.length} elements`,
        elementIds: elements.map(e => e.id),
        details: { tag, elements },
      });
    }
  });
  
  return errors;
}

/**
 * Check for lines that reference non-existent elements.
 */
function checkOrphanLines(diagram: PIDDiagram): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Build set of all element IDs
  const elementIds = new Set<string>();
  diagram.equipment.forEach(e => elementIds.add(e.id));
  diagram.valves.forEach(v => elementIds.add(v.id));
  diagram.instruments.forEach(i => elementIds.add(i.id));
  
  // Check each line
  diagram.lines.forEach(line => {
    if (!elementIds.has(line.source.elementId)) {
      errors.push({
        id: `orphan-source-${line.id}`,
        type: 'orphan_line',
        severity: 'error',
        message: `Line "${line.attributes.lineNumber || line.id}" references non-existent source element`,
        elementIds: [line.id],
        details: { 
          lineId: line.id, 
          missingElementId: line.source.elementId,
          end: 'source'
        },
      });
    }
    
    if (!elementIds.has(line.target.elementId)) {
      errors.push({
        id: `orphan-target-${line.id}`,
        type: 'orphan_line',
        severity: 'error',
        message: `Line "${line.attributes.lineNumber || line.id}" references non-existent target element`,
        elementIds: [line.id],
        details: { 
          lineId: line.id, 
          missingElementId: line.target.elementId,
          end: 'target'
        },
      });
    }
  });
  
  return errors;
}

/**
 * Check for equipment with no connections.
 */
function checkDisconnectedEquipment(diagram: PIDDiagram): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Build set of connected element IDs
  const connectedIds = new Set<string>();
  diagram.lines.forEach(line => {
    connectedIds.add(line.source.elementId);
    connectedIds.add(line.target.elementId);
  });
  
  // Check equipment
  diagram.equipment.forEach(eq => {
    if (!connectedIds.has(eq.id)) {
      errors.push({
        id: `disconnected-${eq.id}`,
        type: 'disconnected_equipment',
        severity: 'warning',
        message: `Equipment "${eq.tag || eq.id}" has no connections`,
        elementIds: [eq.id],
        details: { tag: eq.tag, category: eq.category },
      });
    }
  });
  
  return errors;
}

/**
 * Check for elements missing tag numbers.
 */
function checkMissingTags(diagram: PIDDiagram): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Equipment should have tags
  diagram.equipment.forEach(eq => {
    if (!eq.tag) {
      errors.push({
        id: `missing-tag-${eq.id}`,
        type: 'missing_tag',
        severity: 'warning',
        message: `${eq.category} is missing a tag number`,
        elementIds: [eq.id],
        details: { category: eq.category },
      });
    }
  });
  
  // Valves often need tags (at least control valves)
  diagram.valves.forEach(v => {
    if (!v.tag && v.category === 'control') {
      errors.push({
        id: `missing-tag-${v.id}`,
        type: 'missing_tag',
        severity: 'warning',
        message: `Control valve is missing a tag number`,
        elementIds: [v.id],
        details: { category: v.category },
      });
    }
  });
  
  // Instruments should always have tags
  diagram.instruments.forEach(inst => {
    if (!inst.tag) {
      errors.push({
        id: `missing-tag-${inst.id}`,
        type: 'missing_tag',
        severity: 'warning',
        message: `Instrument is missing a tag number`,
        elementIds: [inst.id],
        details: { 
          function: inst.attributes.function,
          types: inst.attributes.types 
        },
      });
    }
  });
  
  return errors;
}

// =============================================================================
// HELPERS
// =============================================================================

function getSeverityLevel(severity: ValidationSeverity): number {
  switch (severity) {
    case 'error': return 3;
    case 'warning': return 2;
    case 'info': return 1;
    default: return 0;
  }
}

// =============================================================================
// FUTURE VALIDATION RULES (TODO)
// =============================================================================

/**
 * Check for spec break consistency.
 * Ensures piping specs match across spec breaks.
 */
// function checkSpecBreaks(diagram: PIDDiagram): ValidationError[] { }

/**
 * Check control loop completeness.
 * Ensures control valves have associated controllers/transmitters.
 */
// function checkControlLoops(diagram: PIDDiagram): ValidationError[] { }

/**
 * Check for invalid connections.
 * E.g., connecting two inlets or two outlets.
 */
// function checkConnectionValidity(diagram: PIDDiagram): ValidationError[] { }
