/**
 * Smart P&ID Data Schema
 * 
 * Inspired by DEXPI (Data Exchange in Process Industries) standard
 * but simplified for MVP. This schema defines the core entities
 * that make up a P&ID diagram.
 * 
 * Key concepts:
 * - Everything has a unique ID and optional tag number
 * - Equipment has Nozzles (connection points)
 * - ProcessLines connect Nozzles
 * - Instruments can be inline or standalone
 */

// =============================================================================
// BASE TYPES
// =============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

/** Base interface for all P&ID elements */
export interface PIDElement {
  id: string;
  tag?: string;              // e.g., "V-100", "P-101A", "FIC-100"
  description?: string;
  position: Position;
  rotation?: number;         // degrees, 0-360
  metadata?: Record<string, unknown>;
}

// =============================================================================
// NOZZLES (Connection Points)
// =============================================================================

export type NozzleType = 'inlet' | 'outlet' | 'bidirectional' | 'utility' | 'vent' | 'drain';

export interface Nozzle {
  id: string;
  name?: string;             // e.g., "N1", "Inlet", "Steam In"
  type: NozzleType;
  relativePosition: Position; // relative to parent equipment (0-1 normalized)
  size?: string;             // e.g., "2\"", "DN50"
  rating?: string;           // e.g., "150#", "PN16"
  facing?: string;           // e.g., "RF", "RTJ"
}

// =============================================================================
// EQUIPMENT
// =============================================================================

export type EquipmentCategory = 
  | 'vessel'
  | 'column'
  | 'tank'
  | 'heat_exchanger'
  | 'pump'
  | 'compressor'
  | 'blower'
  | 'filter'
  | 'reactor'
  | 'drum'
  | 'other';

export interface EquipmentAttributes {
  // Design conditions
  designPressure?: string;   // e.g., "10 barg"
  designTemperature?: string;// e.g., "150°C"
  operatingPressure?: string;
  operatingTemperature?: string;
  
  // Physical
  material?: string;         // e.g., "CS", "SS316", "Monel"
  capacity?: string;         // e.g., "50 m³"
  
  // Mechanical
  driver?: string;           // for pumps/compressors: "Electric", "Turbine"
  power?: string;            // e.g., "75 kW"
  
  // Custom fields
  [key: string]: unknown;
}

export interface Equipment extends PIDElement {
  type: 'equipment';
  category: EquipmentCategory;
  subtype?: string;          // e.g., "centrifugal" for pump, "shell_tube" for HX
  dimensions: Dimensions;
  nozzles: Nozzle[];
  attributes: EquipmentAttributes;
}

// =============================================================================
// PIPING COMPONENTS (Valves, Fittings)
// =============================================================================

export type ValveCategory = 
  | 'gate'
  | 'globe'
  | 'ball'
  | 'butterfly'
  | 'check'
  | 'plug'
  | 'needle'
  | 'relief'
  | 'control'
  | 'three_way'
  | 'other';

export type ActuatorType = 'manual' | 'pneumatic' | 'electric' | 'hydraulic' | 'self_acting';

export interface ValveAttributes {
  size?: string;             // e.g., "4\""
  rating?: string;           // e.g., "300#"
  material?: string;
  actuator?: ActuatorType;
  failPosition?: 'open' | 'closed' | 'last';
  normalPosition?: 'open' | 'closed';
  [key: string]: unknown;
}

export interface Valve extends PIDElement {
  type: 'valve';
  category: ValveCategory;
  dimensions: Dimensions;
  attributes: ValveAttributes;
  // Valves have exactly 2 connection points (or 3 for three-way)
  connectionPoints: {
    inlet: Position;   // relative
    outlet: Position;  // relative
    branch?: Position; // for three-way valves
  };
}

// =============================================================================
// INSTRUMENTS
// =============================================================================

export type InstrumentFunction = 
  | 'F'   // Flow
  | 'L'   // Level
  | 'P'   // Pressure
  | 'T'   // Temperature
  | 'A'   // Analysis
  | 'S'   // Speed
  | 'W'   // Weight
  | 'H'   // Hand (manual)
  | 'Z'   // Position
  | 'V'   // Vibration
  | 'X'   // Other
  ;

export type InstrumentType =
  | 'I'   // Indicator
  | 'R'   // Recorder
  | 'C'   // Controller
  | 'T'   // Transmitter
  | 'E'   // Element/Sensor
  | 'S'   // Switch
  | 'A'   // Alarm
  | 'V'   // Valve (control valve)
  | 'Y'   // Relay/Compute
  | 'Z'   // Driver/Actuator
  ;

export type InstrumentLocation = 'field' | 'local_panel' | 'control_room' | 'dcs' | 'plc';

export interface InstrumentAttributes {
  function: InstrumentFunction;
  types: InstrumentType[];    // e.g., ['I', 'C'] for FIC (Flow Indicating Controller)
  location: InstrumentLocation;
  loopNumber?: string;        // e.g., "100" for FIC-100
  range?: string;             // e.g., "0-100 m³/h"
  setpoint?: string;
  alarmHigh?: string;
  alarmLow?: string;
  signalType?: string;        // e.g., "4-20mA", "HART", "Fieldbus"
  [key: string]: unknown;
}

export interface Instrument extends PIDElement {
  type: 'instrument';
  attributes: InstrumentAttributes;
  dimensions: Dimensions;
  isInline: boolean;          // true if mounted directly on pipe
  connectionPoints: {
    process?: Position;       // connection to process line
    signal?: Position;        // connection to signal line
  };
}

// =============================================================================
// PROCESS LINES (Pipes)
// =============================================================================

export type LineType = 'process' | 'utility' | 'signal' | 'electrical' | 'pneumatic' | 'hydraulic';

export interface LineAttributes {
  lineNumber?: string;        // e.g., "101-P-2\"-CS-150#"
  size?: string;              // e.g., "2\""
  schedule?: string;          // e.g., "40", "80", "STD"
  material?: string;          // e.g., "CS", "SS316"
  rating?: string;            // e.g., "150#"
  insulation?: string;        // e.g., "H" (hot), "C" (cold), "P" (personnel protection)
  tracing?: string;           // e.g., "ST" (steam), "ET" (electric)
  fluid?: string;             // e.g., "Process Water", "Steam"
  [key: string]: unknown;
}

export interface ProcessLine extends PIDElement {
  type: 'line';
  lineType: LineType;
  attributes: LineAttributes;
  
  // Connection info - references nozzle IDs or other connection points
  source: {
    elementId: string;
    nozzleId?: string;        // for equipment
    connectionPoint?: string; // for valves/instruments: 'inlet', 'outlet', etc.
  };
  target: {
    elementId: string;
    nozzleId?: string;
    connectionPoint?: string;
  };
  
  // Routing waypoints (for non-straight lines)
  waypoints?: Position[];
}

// =============================================================================
// ANNOTATIONS
// =============================================================================

export interface TextAnnotation extends PIDElement {
  type: 'annotation';
  text: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

// =============================================================================
// DIAGRAM (Root)
// =============================================================================

export interface DiagramMetadata {
  title: string;
  drawingNumber?: string;
  revision?: string;
  author?: string;
  checker?: string;
  approver?: string;
  date?: string;
  plant?: string;
  area?: string;
  unit?: string;
  sheet?: string;
  scale?: string;
}

export interface PIDDiagram {
  id: string;
  version: string;           // schema version for migrations
  metadata: DiagramMetadata;
  equipment: Equipment[];
  valves: Valve[];
  instruments: Instrument[];
  lines: ProcessLine[];
  annotations: TextAnnotation[];
  
  // Viewport state (optional, for restoring view)
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

// =============================================================================
// HELPER TYPES
// =============================================================================

export type PIDNode = Equipment | Valve | Instrument | TextAnnotation;
export type PIDEdge = ProcessLine;
export type PIDEntity = PIDNode | PIDEdge;

// Type guards
export const isEquipment = (entity: PIDEntity): entity is Equipment => 
  entity.type === 'equipment';

export const isValve = (entity: PIDEntity): entity is Valve => 
  entity.type === 'valve';

export const isInstrument = (entity: PIDEntity): entity is Instrument => 
  entity.type === 'instrument';

export const isLine = (entity: PIDEntity): entity is ProcessLine => 
  entity.type === 'line';

export const isAnnotation = (entity: PIDEntity): entity is TextAnnotation => 
  entity.type === 'annotation';

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createEquipment(
  partial: Partial<Equipment> & { category: EquipmentCategory }
): Equipment {
  return {
    id: partial.id || crypto.randomUUID(),
    type: 'equipment',
    category: partial.category,
    position: partial.position || { x: 0, y: 0 },
    dimensions: partial.dimensions || { width: 80, height: 120 },
    nozzles: partial.nozzles || [],
    attributes: partial.attributes || {},
    ...partial,
  };
}

export function createValve(
  partial: Partial<Valve> & { category: ValveCategory }
): Valve {
  return {
    id: partial.id || crypto.randomUUID(),
    type: 'valve',
    category: partial.category,
    position: partial.position || { x: 0, y: 0 },
    dimensions: partial.dimensions || { width: 40, height: 40 },
    attributes: partial.attributes || {},
    connectionPoints: partial.connectionPoints || {
      inlet: { x: 0, y: 0.5 },
      outlet: { x: 1, y: 0.5 },
    },
    ...partial,
  };
}

export function createInstrument(
  partial: Partial<Instrument> & { 
    attributes: Pick<InstrumentAttributes, 'function' | 'types' | 'location'> 
  }
): Instrument {
  return {
    id: partial.id || crypto.randomUUID(),
    type: 'instrument',
    position: partial.position || { x: 0, y: 0 },
    dimensions: partial.dimensions || { width: 40, height: 40 },
    isInline: partial.isInline ?? false,
    connectionPoints: partial.connectionPoints || {},
    attributes: {
      location: 'field',
      ...partial.attributes,
    },
    ...partial,
  };
}

export function createLine(
  partial: Partial<ProcessLine> & {
    source: ProcessLine['source'];
    target: ProcessLine['target'];
  }
): ProcessLine {
  return {
    id: partial.id || crypto.randomUUID(),
    type: 'line',
    lineType: partial.lineType || 'process',
    position: { x: 0, y: 0 }, // Lines don't really have a position
    attributes: partial.attributes || {},
    source: partial.source,
    target: partial.target,
    ...partial,
  };
}

export function createDiagram(partial?: Partial<PIDDiagram>): PIDDiagram {
  return {
    id: partial?.id || crypto.randomUUID(),
    version: '1.0.0',
    metadata: partial?.metadata || {
      title: 'Untitled P&ID',
    },
    equipment: partial?.equipment || [],
    valves: partial?.valves || [],
    instruments: partial?.instruments || [],
    lines: partial?.lines || [],
    annotations: partial?.annotations || [],
  };
}
