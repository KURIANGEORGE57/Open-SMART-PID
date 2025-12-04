import {
  PIDNode,
  PIDEntity,
  ZoomLevel,
  Equipment,
  Valve,
  Instrument,
  ProcessLine,
  TextAnnotation,
  LODConfig
} from '../types/schema';

/**
 * LOD Engine - Level of Detail Filtering for Semantic Zoom
 *
 * This engine determines which elements should be visible and how they should
 * be rendered at different semantic zoom levels (L0, L1, L3).
 *
 * Filtering Rules:
 * - L0 (Eagle View): Only show plant blocks and battery limit connections
 * - L1 (Outline View): Hide drains, vents, sample points, and non-critical labels
 * - L3 (Detail View): Show all elements at full detail
 */

/**
 * Default LOD configuration if not specified
 */
const DEFAULT_LOD: LODConfig = {
  visibleAtLevels: ['L0', 'L1', 'L3'],
  criticalLabel: false,
};

/**
 * Get LOD configuration for an entity, using defaults if not specified
 */
function getLODConfig(entity: PIDEntity): LODConfig {
  return entity.lod || DEFAULT_LOD;
}

/**
 * Check if an element should be visible at the given zoom level
 */
export function isVisibleAtLevel(entity: PIDEntity, level: ZoomLevel): boolean {
  const lodConfig = getLODConfig(entity);
  return lodConfig.visibleAtLevels.includes(level);
}

/**
 * Check if an element's label should be shown at the given zoom level
 */
export function shouldShowLabel(entity: PIDNode, level: ZoomLevel): boolean {
  const lodConfig = getLODConfig(entity);

  switch (level) {
    case 'L0':
      // At L0, only show critical labels
      return lodConfig.criticalLabel === true;

    case 'L1':
      // At L1, show labels only for critical items
      return lodConfig.criticalLabel === true;

    case 'L3':
      // At L3, show all labels
      return true;

    default:
      return false;
  }
}

/**
 * Apply filtering rules based on element classification
 */
export function applyClassificationRules(entity: PIDEntity, level: ZoomLevel): boolean {
  const lodConfig = getLODConfig(entity);
  const classification = lodConfig.class;

  // At L1, hide auxiliary items
  if (level === 'L1') {
    const hiddenClasses = ['Drain', 'Vent', 'SamplePoint', 'Instrument_Local'];
    if (classification && hiddenClasses.includes(classification)) {
      return false;
    }
  }

  // At L0, hide almost everything except main equipment
  if (level === 'L0') {
    const visibleClasses = ['MainEquipment', 'CriticalEquipment'];
    if (classification && !visibleClasses.includes(classification)) {
      return false;
    }
  }

  return true;
}

/**
 * Filter a list of nodes based on the current zoom level
 */
export function filterNodesByLevel<T extends PIDNode>(
  nodes: T[],
  level: ZoomLevel
): T[] {
  return nodes.filter((node) => {
    // Check visibility at level
    if (!isVisibleAtLevel(node, level)) {
      return false;
    }

    // Apply classification rules
    if (!applyClassificationRules(node, level)) {
      return false;
    }

    return true;
  });
}

/**
 * Filter process lines based on the current zoom level
 */
export function filterLinesByLevel(
  lines: ProcessLine[],
  level: ZoomLevel
): ProcessLine[] {
  return lines.filter((line) => {
    // Check visibility at level
    if (!isVisibleAtLevel(line, level)) {
      return false;
    }

    // Apply classification rules
    if (!applyClassificationRules(line, level)) {
      return false;
    }

    // At L1, hide utility lines (drains, vents)
    if (level === 'L1' && line.lineType !== 'process') {
      return false;
    }

    // At L0, only show main process lines
    if (level === 'L0' && line.lineType !== 'process') {
      return false;
    }

    return true;
  });
}

/**
 * Determine rendering style based on zoom level
 */
export interface RenderingStyle {
  showDetail: boolean;
  showLabels: boolean;
  showNozzles: boolean;
  showAnnotations: boolean;
  simplifySymbols: boolean;
  lineWidth: number;
}

export function getRenderingStyle(level: ZoomLevel): RenderingStyle {
  switch (level) {
    case 'L0':
      return {
        showDetail: false,
        showLabels: false, // Only critical labels via shouldShowLabel()
        showNozzles: false,
        showAnnotations: false,
        simplifySymbols: true,
        lineWidth: 4, // Thick lines for visibility
      };

    case 'L1':
      return {
        showDetail: false,
        showLabels: false, // Only critical labels via shouldShowLabel()
        showNozzles: false,
        showAnnotations: false,
        simplifySymbols: true,
        lineWidth: 2,
      };

    case 'L3':
      return {
        showDetail: true,
        showLabels: true,
        showNozzles: true,
        showAnnotations: true,
        simplifySymbols: false,
        lineWidth: 1.5,
      };

    default:
      return {
        showDetail: true,
        showLabels: true,
        showNozzles: true,
        showAnnotations: true,
        simplifySymbols: false,
        lineWidth: 1.5,
      };
  }
}

/**
 * Group elements for L0 aggregation
 * Elements with the same aggregationGroup are bundled together at L0
 */
export interface AggregatedGroup {
  groupId: string;
  elements: PIDEntity[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export function aggregateElements(entities: PIDEntity[]): AggregatedGroup[] {
  const groups = new Map<string, PIDEntity[]>();

  // Group entities by aggregationGroup
  entities.forEach((entity) => {
    const lodConfig = getLODConfig(entity);
    const groupId = lodConfig.aggregationGroup || entity.id;

    if (!groups.has(groupId)) {
      groups.set(groupId, []);
    }
    groups.get(groupId)!.push(entity);
  });

  // Calculate bounding boxes for each group
  const aggregated: AggregatedGroup[] = [];

  groups.forEach((elements, groupId) => {
    // Calculate bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((element) => {
      const { x, y } = element.position;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });

    aggregated.push({
      groupId,
      elements,
      boundingBox: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
    });
  });

  return aggregated;
}

/**
 * Apply LOD defaults to entities that don't have LOD config
 * This is a utility function to prepare diagrams for semantic zoom
 */
export function applyDefaultLOD(entity: PIDEntity): PIDEntity {
  if (entity.lod) {
    return entity; // Already has LOD config
  }

  // Determine default LOD based on entity type and properties
  let lodConfig: LODConfig = { ...DEFAULT_LOD };

  // Type-specific defaults
  if (entity.type === 'equipment') {
    const equipment = entity as Equipment;
    lodConfig = {
      visibleAtLevels: ['L0', 'L1', 'L3'],
      criticalLabel: true, // Equipment tags are usually critical
      class: 'MainEquipment',
    };
  } else if (entity.type === 'valve') {
    const valve = entity as Valve;
    // Hide small utility valves at L1
    const isUtility = valve.tag?.includes('-DV-') || valve.tag?.includes('-SV-');
    lodConfig = {
      visibleAtLevels: isUtility ? ['L3'] : ['L1', 'L3'],
      class: isUtility ? 'Drain' : undefined,
    };
  } else if (entity.type === 'instrument') {
    const instrument = entity as Instrument;
    // Hide field instruments at L0, show control instruments at L1
    const isControl = instrument.attributes.types.includes('C');
    lodConfig = {
      visibleAtLevels: isControl ? ['L1', 'L3'] : ['L3'],
      criticalLabel: isControl,
      class: instrument.attributes.location === 'field' ? 'Instrument_Local' : undefined,
    };
  } else if (entity.type === 'line') {
    const line = entity as ProcessLine;
    lodConfig = {
      visibleAtLevels: line.lineType === 'process' ? ['L0', 'L1', 'L3'] : ['L3'],
    };
  } else if (entity.type === 'annotation') {
    lodConfig = {
      visibleAtLevels: ['L3'], // Annotations only at detail view
    };
  }

  return { ...entity, lod: lodConfig };
}

/**
 * Prepare a complete diagram for semantic zoom by applying default LOD configs
 */
export function prepareDiagramForSemanticZoom(diagram: {
  equipment: Equipment[];
  valves: Valve[];
  instruments: Instrument[];
  lines: ProcessLine[];
  annotations: TextAnnotation[];
}): typeof diagram {
  return {
    equipment: diagram.equipment.map((e) => applyDefaultLOD(e) as Equipment),
    valves: diagram.valves.map((v) => applyDefaultLOD(v) as Valve),
    instruments: diagram.instruments.map((i) => applyDefaultLOD(i) as Instrument),
    lines: diagram.lines.map((l) => applyDefaultLOD(l) as ProcessLine),
    annotations: diagram.annotations.map((a) => applyDefaultLOD(a) as TextAnnotation),
  };
}
