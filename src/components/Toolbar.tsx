import { 
  MousePointer2, 
  Hand, 
  Circle,
  Square,
  Cylinder,
  Gauge,
  Download,
  Upload,
  FilePlus,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react';
import { useDiagramStore, selectCanUndo, selectCanRedo } from '../store/diagramStore';
import { 
  createEquipment, 
  createValve, 
  createInstrument,
  EquipmentCategory,
  ValveCategory,
} from '../types/schema';

/**
 * Toolbar Component
 * 
 * Contains:
 * - Selection/Pan tools
 * - Equipment symbols
 * - Valve symbols  
 * - Instrument symbols
 * - File operations
 * - Undo/Redo
 */
export default function Toolbar() {
  const { 
    activeTool, 
    setActiveTool, 
    addEquipment, 
    addValve, 
    addInstrument,
    deleteSelected,
    selectedIds,
    undo,
    redo,
    newDiagram,
    diagram,
    setDiagram,
  } = useDiagramStore();
  
  const canUndo = useDiagramStore(selectCanUndo);
  const canRedo = useDiagramStore(selectCanRedo);

  // Add equipment at center of viewport
  const handleAddEquipment = (category: EquipmentCategory, subtype?: string) => {
    const equipment = createEquipment({
      category,
      subtype,
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      tag: generateTag(category),
      nozzles: getDefaultNozzles(category),
    });
    addEquipment(equipment);
    setActiveTool('select');
  };

  // Add valve
  const handleAddValve = (category: ValveCategory) => {
    const valve = createValve({
      category,
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      tag: generateValveTag(category),
    });
    addValve(valve);
    setActiveTool('select');
  };

  // Add instrument
  const handleAddInstrument = (func: string, types: string[]) => {
    const instrument = createInstrument({
      position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
      tag: `${func}${types.join('')}-${Math.floor(Math.random() * 900) + 100}`,
      attributes: {
        function: func as any,
        types: types as any[],
        location: 'field',
        loopNumber: String(Math.floor(Math.random() * 900) + 100),
      },
      isInline: false,
    });
    addInstrument(instrument);
    setActiveTool('select');
  };

  // Save diagram to file
  const handleSave = () => {
    const json = JSON.stringify(diagram, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagram.metadata.title || 'pid-diagram'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load diagram from file
  const handleLoad = () => {
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
          setDiagram(json);
        } catch (err) {
          alert('Failed to load diagram: Invalid JSON');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white w-16 border-r border-gray-700">
      {/* Selection Tools */}
      <ToolSection title="Tools">
        <ToolButton
          icon={<MousePointer2 size={20} />}
          label="Select"
          active={activeTool === 'select'}
          onClick={() => setActiveTool('select')}
        />
        <ToolButton
          icon={<Hand size={20} />}
          label="Pan"
          active={activeTool === 'pan'}
          onClick={() => setActiveTool('pan')}
        />
      </ToolSection>

      {/* Equipment */}
      <ToolSection title="Equipment">
        <ToolButton
          icon={<Cylinder size={20} />}
          label="Vessel"
          onClick={() => handleAddEquipment('vessel')}
        />
        <ToolButton
          icon={<Circle size={20} />}
          label="Pump"
          onClick={() => handleAddEquipment('pump', 'centrifugal')}
        />
        <ToolButton
          icon={<Square size={20} />}
          label="Tank"
          onClick={() => handleAddEquipment('tank')}
        />
      </ToolSection>

      {/* Valves */}
      <ToolSection title="Valves">
        <ToolButton
          icon={<ValveIcon type="gate" />}
          label="Gate"
          onClick={() => handleAddValve('gate')}
        />
        <ToolButton
          icon={<ValveIcon type="globe" />}
          label="Globe"
          onClick={() => handleAddValve('globe')}
        />
        <ToolButton
          icon={<ValveIcon type="control" />}
          label="Control"
          onClick={() => handleAddValve('control')}
        />
        <ToolButton
          icon={<ValveIcon type="check" />}
          label="Check"
          onClick={() => handleAddValve('check')}
        />
      </ToolSection>

      {/* Instruments */}
      <ToolSection title="Instruments">
        <ToolButton
          icon={<Gauge size={20} />}
          label="FI"
          onClick={() => handleAddInstrument('F', ['I'])}
        />
        <ToolButton
          icon={<Gauge size={20} />}
          label="PI"
          onClick={() => handleAddInstrument('P', ['I'])}
        />
        <ToolButton
          icon={<Gauge size={20} />}
          label="TI"
          onClick={() => handleAddInstrument('T', ['I'])}
        />
        <ToolButton
          icon={<Gauge size={20} />}
          label="LI"
          onClick={() => handleAddInstrument('L', ['I'])}
        />
      </ToolSection>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <ToolSection title="Actions">
        <ToolButton
          icon={<Undo2 size={20} />}
          label="Undo"
          onClick={undo}
          disabled={!canUndo}
        />
        <ToolButton
          icon={<Redo2 size={20} />}
          label="Redo"
          onClick={redo}
          disabled={!canRedo}
        />
        <ToolButton
          icon={<Trash2 size={20} />}
          label="Delete"
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
        />
      </ToolSection>

      {/* File */}
      <ToolSection title="File">
        <ToolButton
          icon={<FilePlus size={20} />}
          label="New"
          onClick={newDiagram}
        />
        <ToolButton
          icon={<Upload size={20} />}
          label="Load"
          onClick={handleLoad}
        />
        <ToolButton
          icon={<Download size={20} />}
          label="Save"
          onClick={handleSave}
        />
      </ToolSection>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface ToolSectionProps {
  title: string;
  children: React.ReactNode;
}

function ToolSection({ title, children }: ToolSectionProps) {
  return (
    <div className="border-b border-gray-700 py-2">
      <div className="px-2 pb-1 text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
        {title}
      </div>
      <div className="flex flex-col items-center gap-1 px-1">
        {children}
      </div>
    </div>
  );
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function ToolButton({ icon, label, active, disabled, onClick }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-12 h-10 flex flex-col items-center justify-center rounded
        transition-colors text-[9px]
        ${active 
          ? 'bg-blue-600 text-white' 
          : 'hover:bg-gray-700 text-gray-300'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={label}
    >
      {icon}
      <span className="mt-0.5">{label}</span>
    </button>
  );
}

/** Simple valve icon for toolbar */
function ValveIcon({ type }: { type: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20">
      <path
        d="M 2 6 L 10 10 L 2 14 Z M 18 6 L 10 10 L 18 14 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {type === 'control' && (
        <rect x={7} y={2} width={6} height={4} fill="none" stroke="currentColor" strokeWidth={1} />
      )}
      {type === 'check' && (
        <path d="M 2 6 L 10 10 L 2 14 Z" fill="currentColor" />
      )}
    </svg>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

let tagCounters: Record<string, number> = {};

function generateTag(category: EquipmentCategory): string {
  const prefixes: Record<EquipmentCategory, string> = {
    vessel: 'V',
    column: 'C',
    tank: 'TK',
    heat_exchanger: 'E',
    pump: 'P',
    compressor: 'K',
    blower: 'B',
    filter: 'F',
    reactor: 'R',
    drum: 'D',
    other: 'X',
  };
  
  const prefix = prefixes[category] || 'X';
  tagCounters[prefix] = (tagCounters[prefix] || 0) + 1;
  return `${prefix}-${100 + tagCounters[prefix]}`;
}

function generateValveTag(category: ValveCategory): string {
  tagCounters['valve'] = (tagCounters['valve'] || 0) + 1;
  return `XV-${100 + tagCounters['valve']}`;
}

function getDefaultNozzles(category: EquipmentCategory) {
  // Return default nozzle configuration based on equipment type
  return [
    { id: 'n1', name: 'N1', type: 'inlet' as const, relativePosition: { x: 0, y: 0.3 } },
    { id: 'n2', name: 'N2', type: 'outlet' as const, relativePosition: { x: 0, y: 0.7 } },
    { id: 'n3', name: 'N3', type: 'outlet' as const, relativePosition: { x: 0.5, y: 1 } },
  ];
}
