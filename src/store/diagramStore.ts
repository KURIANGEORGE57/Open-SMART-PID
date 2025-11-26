import { create } from 'zustand';
import { 
  PIDDiagram, 
  Equipment, 
  Valve, 
  Instrument, 
  ProcessLine,
  TextAnnotation,
  PIDNode,
  createDiagram 
} from '../types/schema';

// =============================================================================
// HISTORY (for Undo/Redo)
// =============================================================================

interface HistoryState {
  past: PIDDiagram[];
  future: PIDDiagram[];
}

// =============================================================================
// STORE STATE
// =============================================================================

interface DiagramState {
  // Current diagram
  diagram: PIDDiagram;
  
  // Selection
  selectedIds: string[];
  
  // History
  history: HistoryState;
  
  // UI State
  isDirty: boolean;
  activeTool: 'select' | 'pan' | 'connect' | ToolType;
  
  // Actions - Diagram
  setDiagram: (diagram: PIDDiagram) => void;
  newDiagram: () => void;
  updateMetadata: (metadata: Partial<PIDDiagram['metadata']>) => void;
  
  // Actions - Equipment
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  
  // Actions - Valves
  addValve: (valve: Valve) => void;
  updateValve: (id: string, updates: Partial<Valve>) => void;
  removeValve: (id: string) => void;
  
  // Actions - Instruments
  addInstrument: (instrument: Instrument) => void;
  updateInstrument: (id: string, updates: Partial<Instrument>) => void;
  removeInstrument: (id: string) => void;
  
  // Actions - Lines
  addLine: (line: ProcessLine) => void;
  updateLine: (id: string, updates: Partial<ProcessLine>) => void;
  removeLine: (id: string) => void;
  
  // Actions - Annotations
  addAnnotation: (annotation: TextAnnotation) => void;
  updateAnnotation: (id: string, updates: Partial<TextAnnotation>) => void;
  removeAnnotation: (id: string) => void;
  
  // Actions - Selection
  select: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Actions - Generic
  deleteSelected: () => void;
  updateNode: (id: string, updates: Partial<PIDNode>) => void;
  
  // Actions - History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Actions - Tools
  setActiveTool: (tool: DiagramState['activeTool']) => void;
  
  // Getters
  getNodeById: (id: string) => PIDNode | undefined;
  getLineById: (id: string) => ProcessLine | undefined;
  getAllNodes: () => PIDNode[];
}

// Tool types for the toolbar
export type ToolType = 
  | 'vessel' 
  | 'tank'
  | 'pump' 
  | 'heat_exchanger'
  | 'column'
  | 'valve_gate'
  | 'valve_globe'
  | 'valve_ball'
  | 'valve_check'
  | 'valve_control'
  | 'instrument';

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

const MAX_HISTORY = 50;

export const useDiagramStore = create<DiagramState>((set, get) => ({
  // Initial state
  diagram: createDiagram(),
  selectedIds: [],
  history: { past: [], future: [] },
  isDirty: false,
  activeTool: 'select',

  // Diagram actions
  setDiagram: (diagram) => {
    set({ diagram, isDirty: false, selectedIds: [] });
    get().saveToHistory();
  },
  
  newDiagram: () => {
    set({ 
      diagram: createDiagram(), 
      isDirty: false, 
      selectedIds: [],
      history: { past: [], future: [] }
    });
  },
  
  updateMetadata: (metadata) => {
    set((state) => ({
      diagram: {
        ...state.diagram,
        metadata: { ...state.diagram.metadata, ...metadata }
      },
      isDirty: true
    }));
  },

  // Equipment actions
  addEquipment: (equipment) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        equipment: [...state.diagram.equipment, equipment]
      },
      isDirty: true
    }));
  },
  
  updateEquipment: (id, updates) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        equipment: state.diagram.equipment.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        )
      },
      isDirty: true
    }));
  },
  
  removeEquipment: (id) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        equipment: state.diagram.equipment.filter((e) => e.id !== id),
        // Also remove connected lines
        lines: state.diagram.lines.filter(
          (l) => l.source.elementId !== id && l.target.elementId !== id
        )
      },
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
      isDirty: true
    }));
  },

  // Valve actions
  addValve: (valve) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        valves: [...state.diagram.valves, valve]
      },
      isDirty: true
    }));
  },
  
  updateValve: (id, updates) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        valves: state.diagram.valves.map((v) =>
          v.id === id ? { ...v, ...updates } : v
        )
      },
      isDirty: true
    }));
  },
  
  removeValve: (id) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        valves: state.diagram.valves.filter((v) => v.id !== id),
        lines: state.diagram.lines.filter(
          (l) => l.source.elementId !== id && l.target.elementId !== id
        )
      },
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
      isDirty: true
    }));
  },

  // Instrument actions
  addInstrument: (instrument) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        instruments: [...state.diagram.instruments, instrument]
      },
      isDirty: true
    }));
  },
  
  updateInstrument: (id, updates) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        instruments: state.diagram.instruments.map((i) =>
          i.id === id ? { ...i, ...updates } : i
        )
      },
      isDirty: true
    }));
  },
  
  removeInstrument: (id) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        instruments: state.diagram.instruments.filter((i) => i.id !== id),
        lines: state.diagram.lines.filter(
          (l) => l.source.elementId !== id && l.target.elementId !== id
        )
      },
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
      isDirty: true
    }));
  },

  // Line actions
  addLine: (line) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        lines: [...state.diagram.lines, line]
      },
      isDirty: true
    }));
  },
  
  updateLine: (id, updates) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        lines: state.diagram.lines.map((l) =>
          l.id === id ? { ...l, ...updates } : l
        )
      },
      isDirty: true
    }));
  },
  
  removeLine: (id) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        lines: state.diagram.lines.filter((l) => l.id !== id)
      },
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
      isDirty: true
    }));
  },

  // Annotation actions
  addAnnotation: (annotation) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        annotations: [...state.diagram.annotations, annotation]
      },
      isDirty: true
    }));
  },
  
  updateAnnotation: (id, updates) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        annotations: state.diagram.annotations.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        )
      },
      isDirty: true
    }));
  },
  
  removeAnnotation: (id) => {
    get().saveToHistory();
    set((state) => ({
      diagram: {
        ...state.diagram,
        annotations: state.diagram.annotations.filter((a) => a.id !== id)
      },
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
      isDirty: true
    }));
  },

  // Selection actions
  select: (ids) => set({ selectedIds: ids }),
  
  addToSelection: (id) => 
    set((state) => ({
      selectedIds: state.selectedIds.includes(id) 
        ? state.selectedIds 
        : [...state.selectedIds, id]
    })),
  
  removeFromSelection: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.filter((sid) => sid !== id)
    })),
  
  clearSelection: () => set({ selectedIds: [] }),
  
  selectAll: () => {
    const nodes = get().getAllNodes();
    set({ selectedIds: nodes.map((n) => n.id) });
  },

  // Generic actions
  deleteSelected: () => {
    const { selectedIds, diagram } = get();
    if (selectedIds.length === 0) return;
    
    get().saveToHistory();
    
    set((state) => ({
      diagram: {
        ...state.diagram,
        equipment: state.diagram.equipment.filter((e) => !selectedIds.includes(e.id)),
        valves: state.diagram.valves.filter((v) => !selectedIds.includes(v.id)),
        instruments: state.diagram.instruments.filter((i) => !selectedIds.includes(i.id)),
        annotations: state.diagram.annotations.filter((a) => !selectedIds.includes(a.id)),
        lines: state.diagram.lines.filter(
          (l) => !selectedIds.includes(l.id) &&
                 !selectedIds.includes(l.source.elementId) &&
                 !selectedIds.includes(l.target.elementId)
        )
      },
      selectedIds: [],
      isDirty: true
    }));
  },
  
  updateNode: (id, updates) => {
    const node = get().getNodeById(id);
    if (!node) return;
    
    switch (node.type) {
      case 'equipment':
        get().updateEquipment(id, updates as Partial<Equipment>);
        break;
      case 'valve':
        get().updateValve(id, updates as Partial<Valve>);
        break;
      case 'instrument':
        get().updateInstrument(id, updates as Partial<Instrument>);
        break;
      case 'annotation':
        get().updateAnnotation(id, updates as Partial<TextAnnotation>);
        break;
    }
  },

  // History actions
  saveToHistory: () => {
    set((state) => ({
      history: {
        past: [...state.history.past.slice(-MAX_HISTORY + 1), state.diagram],
        future: []
      }
    }));
  },
  
  undo: () => {
    const { history, diagram } = get();
    if (history.past.length === 0) return;
    
    const previous = history.past[history.past.length - 1];
    set({
      diagram: previous,
      history: {
        past: history.past.slice(0, -1),
        future: [diagram, ...history.future]
      },
      selectedIds: [],
      isDirty: true
    });
  },
  
  redo: () => {
    const { history, diagram } = get();
    if (history.future.length === 0) return;
    
    const next = history.future[0];
    set({
      diagram: next,
      history: {
        past: [...history.past, diagram],
        future: history.future.slice(1)
      },
      selectedIds: [],
      isDirty: true
    });
  },

  // Tool actions
  setActiveTool: (tool) => set({ activeTool: tool }),

  // Getters
  getNodeById: (id) => {
    const { diagram } = get();
    return (
      diagram.equipment.find((e) => e.id === id) ||
      diagram.valves.find((v) => v.id === id) ||
      diagram.instruments.find((i) => i.id === id) ||
      diagram.annotations.find((a) => a.id === id)
    );
  },
  
  getLineById: (id) => {
    return get().diagram.lines.find((l) => l.id === id);
  },
  
  getAllNodes: () => {
    const { diagram } = get();
    return [
      ...diagram.equipment,
      ...diagram.valves,
      ...diagram.instruments,
      ...diagram.annotations
    ];
  }
}));

// =============================================================================
// SELECTORS (for performance optimization)
// =============================================================================

export const selectDiagram = (state: DiagramState) => state.diagram;
export const selectSelectedIds = (state: DiagramState) => state.selectedIds;
export const selectActiveTool = (state: DiagramState) => state.activeTool;
export const selectIsDirty = (state: DiagramState) => state.isDirty;
export const selectCanUndo = (state: DiagramState) => state.history.past.length > 0;
export const selectCanRedo = (state: DiagramState) => state.history.future.length > 0;
