import { ZoomLevel, EquipmentCategory, ValveCategory } from '../../types/schema';

/**
 * Symbol Registry - Manages symbol definitions and LOD variants
 *
 * Each symbol has three levels of detail:
 * - L0: Ultra-simplified block representation
 * - L1: Simplified symbol without text/annotations
 * - L3: Full detail with all annotations
 */

export interface SymbolDefinition {
  id: string;
  name: string;
  category: string;
  subcategory?: string;

  // LOD variants - each level can have different rendering
  variants: {
    L0?: SymbolVariant;
    L1?: SymbolVariant;
    L3: SymbolVariant; // L3 is always required
  };

  // Connection points (relative to symbol bounds, 0-1 normalized)
  connectionPoints?: Array<{
    id: string;
    x: number;
    y: number;
    direction: 'top' | 'bottom' | 'left' | 'right';
  }>;

  // Default dimensions
  defaultDimensions: {
    width: number;
    height: number;
  };

  // Metadata
  standards: string[]; // e.g., ['ISA-5.1', 'ISO 10628']
  tags?: string[];
}

export interface SymbolVariant {
  level: ZoomLevel;
  renderType: 'svg' | 'shape' | 'image';
  data: string | ShapeDefinition;
  strokeWidth?: number;
  fillColor?: string;
  strokeColor?: string;
}

export interface ShapeDefinition {
  type: 'rect' | 'circle' | 'ellipse' | 'path' | 'polygon';
  data: unknown;
}

/**
 * Symbol Library - All available symbols
 */
class SymbolLibrary {
  private symbols: Map<string, SymbolDefinition> = new Map();

  constructor() {
    this.initializeStandardSymbols();
  }

  /**
   * Register a symbol in the library
   */
  register(symbol: SymbolDefinition): void {
    this.symbols.set(symbol.id, symbol);
  }

  /**
   * Get a symbol by ID
   */
  get(id: string): SymbolDefinition | undefined {
    return this.symbols.get(id);
  }

  /**
   * Get all symbols in a category
   */
  getByCategory(category: string): SymbolDefinition[] {
    return Array.from(this.symbols.values()).filter(
      (symbol) => symbol.category === category
    );
  }

  /**
   * Get symbol variant for a specific LOD level
   */
  getVariant(id: string, level: ZoomLevel): SymbolVariant | undefined {
    const symbol = this.get(id);
    if (!symbol) return undefined;

    // Try to get the requested level, fall back to L3
    return symbol.variants[level] || symbol.variants.L3;
  }

  /**
   * Initialize standard ISA-5.1 compliant symbols
   */
  private initializeStandardSymbols(): void {
    // EQUIPMENT SYMBOLS
    this.registerEquipmentSymbols();

    // VALVE SYMBOLS
    this.registerValveSymbols();

    // INSTRUMENT SYMBOLS
    this.registerInstrumentSymbols();
  }

  private registerEquipmentSymbols(): void {
    // Vertical Vessel
    this.register({
      id: 'vessel-vertical',
      name: 'Vertical Vessel',
      category: 'equipment',
      subcategory: 'vessel',
      defaultDimensions: { width: 80, height: 120 },
      standards: ['ISA-5.1', 'ISO 10628'],
      connectionPoints: [
        { id: 'top', x: 0.5, y: 0, direction: 'top' },
        { id: 'bottom', x: 0.5, y: 1, direction: 'bottom' },
      ],
      variants: {
        L0: {
          level: 'L0',
          renderType: 'shape',
          data: { type: 'rect', data: {} },
          strokeWidth: 3,
          strokeColor: '#1f2937',
        },
        L1: {
          level: 'L1',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 80 120">
              <rect x="20" y="10" width="40" height="100" fill="none" stroke="#1f2937" stroke-width="2"/>
              <ellipse cx="40" cy="10" rx="20" ry="5" fill="none" stroke="#1f2937" stroke-width="2"/>
              <ellipse cx="40" cy="110" rx="20" ry="5" fill="none" stroke="#1f2937" stroke-width="2"/>
            </svg>
          `,
        },
        L3: {
          level: 'L3',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 80 120">
              <!-- Main vessel body -->
              <rect x="20" y="10" width="40" height="100" fill="none" stroke="#1f2937" stroke-width="2"/>
              <!-- Top head -->
              <ellipse cx="40" cy="10" rx="20" ry="5" fill="none" stroke="#1f2937" stroke-width="2"/>
              <!-- Bottom head -->
              <ellipse cx="40" cy="110" rx="20" ry="5" fill="none" stroke="#1f2937" stroke-width="2"/>
              <!-- Center line -->
              <line x1="40" y1="10" x2="40" y2="110" stroke="#9ca3af" stroke-width="1" stroke-dasharray="4,2"/>
            </svg>
          `,
        },
      },
    });

    // Centrifugal Pump
    this.register({
      id: 'pump-centrifugal',
      name: 'Centrifugal Pump',
      category: 'equipment',
      subcategory: 'pump',
      defaultDimensions: { width: 60, height: 50 },
      standards: ['ISA-5.1', 'ISO 10628'],
      connectionPoints: [
        { id: 'suction', x: 0, y: 0.5, direction: 'left' },
        { id: 'discharge', x: 1, y: 0.3, direction: 'right' },
      ],
      variants: {
        L0: {
          level: 'L0',
          renderType: 'shape',
          data: { type: 'circle', data: {} },
          strokeWidth: 3,
          strokeColor: '#1f2937',
        },
        L1: {
          level: 'L1',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 60 50">
              <circle cx="30" cy="25" r="18" fill="none" stroke="#1f2937" stroke-width="2"/>
              <path d="M 30 25 L 48 15" stroke="#1f2937" stroke-width="2" fill="none"/>
            </svg>
          `,
        },
        L3: {
          level: 'L3',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 60 50">
              <!-- Pump casing -->
              <circle cx="30" cy="25" r="18" fill="none" stroke="#1f2937" stroke-width="2"/>
              <!-- Discharge nozzle indicator -->
              <path d="M 30 25 L 48 15" stroke="#1f2937" stroke-width="2" fill="none"/>
              <!-- Center point -->
              <circle cx="30" cy="25" r="2" fill="#1f2937"/>
            </svg>
          `,
        },
      },
    });
  }

  private registerValveSymbols(): void {
    // Gate Valve
    this.register({
      id: 'valve-gate',
      name: 'Gate Valve',
      category: 'valve',
      subcategory: 'gate',
      defaultDimensions: { width: 40, height: 40 },
      standards: ['ISA-5.1'],
      connectionPoints: [
        { id: 'inlet', x: 0, y: 0.5, direction: 'left' },
        { id: 'outlet', x: 1, y: 0.5, direction: 'right' },
      ],
      variants: {
        L0: {
          level: 'L0',
          renderType: 'shape',
          data: { type: 'rect', data: {} },
          strokeWidth: 2,
          strokeColor: '#1f2937',
        },
        L1: {
          level: 'L1',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 40 40">
              <path d="M 0 12 L 20 20 L 0 28 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
              <path d="M 40 12 L 20 20 L 40 28 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
            </svg>
          `,
        },
        L3: {
          level: 'L3',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 40 40">
              <!-- Left triangle -->
              <path d="M 0 12 L 20 20 L 0 28 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
              <!-- Right triangle -->
              <path d="M 40 12 L 20 20 L 40 28 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
              <!-- Stem -->
              <line x1="20" y1="20" x2="20" y2="4" stroke="#1f2937" stroke-width="2"/>
              <!-- Handwheel -->
              <circle cx="20" cy="4" r="3" fill="none" stroke="#1f2937" stroke-width="1.5"/>
            </svg>
          `,
        },
      },
    });

    // Control Valve
    this.register({
      id: 'valve-control',
      name: 'Control Valve',
      category: 'valve',
      subcategory: 'control',
      defaultDimensions: { width: 40, height: 50 },
      standards: ['ISA-5.1'],
      connectionPoints: [
        { id: 'inlet', x: 0, y: 0.7, direction: 'left' },
        { id: 'outlet', x: 1, y: 0.7, direction: 'right' },
      ],
      variants: {
        L0: {
          level: 'L0',
          renderType: 'shape',
          data: { type: 'rect', data: {} },
          strokeWidth: 2,
          strokeColor: '#1f2937',
        },
        L1: {
          level: 'L1',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 40 50">
              <path d="M 0 25 L 20 35 L 0 45 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
              <path d="M 40 25 L 20 35 L 40 45 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
              <rect x="15" y="5" width="10" height="15" fill="none" stroke="#1f2937" stroke-width="2"/>
            </svg>
          `,
        },
        L3: {
          level: 'L3',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 40 50">
              <!-- Valve body -->
              <path d="M 0 25 L 20 35 L 0 45 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
              <path d="M 40 25 L 20 35 L 40 45 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
              <!-- Actuator -->
              <rect x="15" y="5" width="10" height="15" fill="none" stroke="#1f2937" stroke-width="2"/>
              <!-- Connection line -->
              <line x1="20" y1="20" x2="20" y2="35" stroke="#1f2937" stroke-width="1.5"/>
            </svg>
          `,
        },
      },
    });
  }

  private registerInstrumentSymbols(): void {
    // Generic Instrument Bubble
    this.register({
      id: 'instrument-bubble',
      name: 'Instrument Bubble',
      category: 'instrument',
      defaultDimensions: { width: 40, height: 40 },
      standards: ['ISA-5.1'],
      connectionPoints: [
        { id: 'process', x: 0.5, y: 1, direction: 'bottom' },
      ],
      variants: {
        L0: {
          level: 'L0',
          renderType: 'shape',
          data: { type: 'circle', data: {} },
          strokeWidth: 1,
          strokeColor: '#1f2937',
        },
        L1: {
          level: 'L1',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="white" stroke="#1f2937" stroke-width="1.5"/>
            </svg>
          `,
        },
        L3: {
          level: 'L3',
          renderType: 'svg',
          data: `
            <svg viewBox="0 0 40 40">
              <!-- Bubble -->
              <circle cx="20" cy="20" r="18" fill="white" stroke="#1f2937" stroke-width="1.5"/>
              <!-- Dividing line for tag -->
              <line x1="5" y1="20" x2="35" y2="20" stroke="#1f2937" stroke-width="1"/>
            </svg>
          `,
        },
      },
    });
  }
}

// Singleton instance
export const symbolLibrary = new SymbolLibrary();

/**
 * Helper function to get symbol for equipment category
 */
export function getEquipmentSymbol(category: EquipmentCategory): string {
  const symbolMap: Record<EquipmentCategory, string> = {
    vessel: 'vessel-vertical',
    pump: 'pump-centrifugal',
    column: 'vessel-vertical', // TODO: Add dedicated column symbol
    tank: 'vessel-vertical', // TODO: Add dedicated tank symbol
    heat_exchanger: 'vessel-vertical', // TODO: Add HX symbol
    compressor: 'pump-centrifugal', // TODO: Add compressor symbol
    blower: 'pump-centrifugal', // TODO: Add blower symbol
    filter: 'vessel-vertical', // TODO: Add filter symbol
    reactor: 'vessel-vertical', // TODO: Add reactor symbol
    drum: 'vessel-vertical', // TODO: Add drum symbol
    other: 'vessel-vertical',
  };

  return symbolMap[category];
}

/**
 * Helper function to get symbol for valve category
 */
export function getValveSymbol(category: ValveCategory): string {
  const symbolMap: Record<ValveCategory, string> = {
    gate: 'valve-gate',
    control: 'valve-control',
    globe: 'valve-gate', // TODO: Add globe valve symbol
    ball: 'valve-gate', // TODO: Add ball valve symbol
    butterfly: 'valve-gate', // TODO: Add butterfly valve symbol
    check: 'valve-gate', // TODO: Add check valve symbol
    plug: 'valve-gate', // TODO: Add plug valve symbol
    needle: 'valve-gate', // TODO: Add needle valve symbol
    relief: 'valve-gate', // TODO: Add relief valve symbol
    three_way: 'valve-gate', // TODO: Add three-way valve symbol
    other: 'valve-gate',
  };

  return symbolMap[category];
}
