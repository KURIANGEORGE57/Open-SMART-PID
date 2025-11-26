import { useMemo } from 'react';
import { useDiagramStore } from '../store/diagramStore';
import { 
  Equipment, 
  Valve, 
  Instrument, 
  ProcessLine,
  isEquipment,
  isValve,
  isInstrument,
} from '../types/schema';

/**
 * Property Panel Component
 * 
 * Shows and allows editing of properties for selected elements.
 * Adapts based on what type of element is selected.
 */
export default function PropertyPanel() {
  const { 
    selectedIds, 
    getNodeById, 
    getLineById,
    updateEquipment,
    updateValve,
    updateInstrument,
    updateLine,
    diagram,
  } = useDiagramStore();

  // Get selected element
  const selectedElement = useMemo(() => {
    if (selectedIds.length !== 1) return null;
    const id = selectedIds[0];
    return getNodeById(id) || getLineById(id) || null;
  }, [selectedIds, getNodeById, getLineById]);

  if (selectedIds.length === 0) {
    return (
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Properties</h2>
        <p className="text-sm text-gray-400 italic">Select an element to view properties</p>
        
        {/* Diagram metadata */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Diagram Info
          </h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-gray-500">Title:</span>{' '}
              <span className="text-gray-700">{diagram.metadata.title}</span>
            </div>
            <div>
              <span className="text-gray-500">Equipment:</span>{' '}
              <span className="text-gray-700">{diagram.equipment.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Valves:</span>{' '}
              <span className="text-gray-700">{diagram.valves.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Instruments:</span>{' '}
              <span className="text-gray-700">{diagram.instruments.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Lines:</span>{' '}
              <span className="text-gray-700">{diagram.lines.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedIds.length > 1) {
    return (
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Properties</h2>
        <p className="text-sm text-gray-400 italic">
          {selectedIds.length} elements selected
        </p>
      </div>
    );
  }

  if (!selectedElement) {
    return (
      <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Properties</h2>
        <p className="text-sm text-gray-400 italic">Element not found</p>
      </div>
    );
  }

  // Render appropriate property editor
  if (isEquipment(selectedElement)) {
    return (
      <EquipmentProperties 
        equipment={selectedElement} 
        onUpdate={(updates) => updateEquipment(selectedElement.id, updates)}
      />
    );
  }

  if (isValve(selectedElement)) {
    return (
      <ValveProperties 
        valve={selectedElement}
        onUpdate={(updates) => updateValve(selectedElement.id, updates)}
      />
    );
  }

  if (isInstrument(selectedElement)) {
    return (
      <InstrumentProperties 
        instrument={selectedElement}
        onUpdate={(updates) => updateInstrument(selectedElement.id, updates)}
      />
    );
  }

  // Line properties
  if ('source' in selectedElement && 'target' in selectedElement) {
    return (
      <LineProperties 
        line={selectedElement as ProcessLine}
        onUpdate={(updates) => updateLine(selectedElement.id, updates)}
      />
    );
  }

  return (
    <div className="w-72 bg-gray-50 border-l border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-600 mb-4">Properties</h2>
      <p className="text-sm text-gray-400 italic">Unknown element type</p>
    </div>
  );
}

// =============================================================================
// PROPERTY EDITORS
// =============================================================================

interface EquipmentPropertiesProps {
  equipment: Equipment;
  onUpdate: (updates: Partial<Equipment>) => void;
}

function EquipmentProperties({ equipment, onUpdate }: EquipmentPropertiesProps) {
  return (
    <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        Equipment Properties
      </h2>
      
      <PropertySection title="Identification">
        <PropertyInput
          label="Tag"
          value={equipment.tag || ''}
          onChange={(value) => onUpdate({ tag: value })}
        />
        <PropertyInput
          label="Description"
          value={equipment.description || ''}
          onChange={(value) => onUpdate({ description: value })}
        />
        <PropertyDisplay label="Category" value={equipment.category} />
        {equipment.subtype && (
          <PropertyDisplay label="Subtype" value={equipment.subtype} />
        )}
      </PropertySection>

      <PropertySection title="Design Conditions">
        <PropertyInput
          label="Design Pressure"
          value={equipment.attributes.designPressure || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...equipment.attributes, designPressure: value } 
          })}
        />
        <PropertyInput
          label="Design Temperature"
          value={equipment.attributes.designTemperature || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...equipment.attributes, designTemperature: value } 
          })}
        />
        <PropertyInput
          label="Material"
          value={equipment.attributes.material || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...equipment.attributes, material: value } 
          })}
        />
      </PropertySection>

      <PropertySection title="Position">
        <div className="grid grid-cols-2 gap-2">
          <PropertyInput
            label="X"
            value={String(Math.round(equipment.position.x))}
            onChange={(value) => onUpdate({ 
              position: { ...equipment.position, x: Number(value) } 
            })}
            type="number"
          />
          <PropertyInput
            label="Y"
            value={String(Math.round(equipment.position.y))}
            onChange={(value) => onUpdate({ 
              position: { ...equipment.position, y: Number(value) } 
            })}
            type="number"
          />
        </div>
      </PropertySection>

      <PropertySection title="Nozzles">
        {equipment.nozzles.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No nozzles defined</p>
        ) : (
          <div className="space-y-1">
            {equipment.nozzles.map((nozzle) => (
              <div key={nozzle.id} className="text-xs bg-white p-2 rounded border">
                <span className="font-medium">{nozzle.name || nozzle.id}</span>
                <span className="text-gray-400 ml-2">({nozzle.type})</span>
              </div>
            ))}
          </div>
        )}
      </PropertySection>
    </div>
  );
}

interface ValvePropertiesProps {
  valve: Valve;
  onUpdate: (updates: Partial<Valve>) => void;
}

function ValveProperties({ valve, onUpdate }: ValvePropertiesProps) {
  return (
    <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        Valve Properties
      </h2>
      
      <PropertySection title="Identification">
        <PropertyInput
          label="Tag"
          value={valve.tag || ''}
          onChange={(value) => onUpdate({ tag: value })}
        />
        <PropertyDisplay label="Type" value={valve.category} />
      </PropertySection>

      <PropertySection title="Specifications">
        <PropertyInput
          label="Size"
          value={valve.attributes.size || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...valve.attributes, size: value } 
          })}
        />
        <PropertyInput
          label="Rating"
          value={valve.attributes.rating || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...valve.attributes, rating: value } 
          })}
        />
        <PropertyInput
          label="Material"
          value={valve.attributes.material || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...valve.attributes, material: value } 
          })}
        />
        <PropertySelect
          label="Actuator"
          value={valve.attributes.actuator || 'manual'}
          options={[
            { value: 'manual', label: 'Manual' },
            { value: 'pneumatic', label: 'Pneumatic' },
            { value: 'electric', label: 'Electric' },
            { value: 'hydraulic', label: 'Hydraulic' },
          ]}
          onChange={(value) => onUpdate({ 
            attributes: { ...valve.attributes, actuator: value as any } 
          })}
        />
      </PropertySection>
    </div>
  );
}

interface InstrumentPropertiesProps {
  instrument: Instrument;
  onUpdate: (updates: Partial<Instrument>) => void;
}

function InstrumentProperties({ instrument, onUpdate }: InstrumentPropertiesProps) {
  return (
    <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        Instrument Properties
      </h2>
      
      <PropertySection title="Identification">
        <PropertyInput
          label="Tag"
          value={instrument.tag || ''}
          onChange={(value) => onUpdate({ tag: value })}
        />
        <PropertyDisplay 
          label="Function" 
          value={`${instrument.attributes.function}${instrument.attributes.types.join('')}`} 
        />
        <PropertyInput
          label="Loop Number"
          value={instrument.attributes.loopNumber || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...instrument.attributes, loopNumber: value } 
          })}
        />
      </PropertySection>

      <PropertySection title="Configuration">
        <PropertySelect
          label="Location"
          value={instrument.attributes.location}
          options={[
            { value: 'field', label: 'Field' },
            { value: 'local_panel', label: 'Local Panel' },
            { value: 'control_room', label: 'Control Room' },
            { value: 'dcs', label: 'DCS' },
            { value: 'plc', label: 'PLC' },
          ]}
          onChange={(value) => onUpdate({ 
            attributes: { ...instrument.attributes, location: value as any } 
          })}
        />
        <PropertyInput
          label="Range"
          value={instrument.attributes.range || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...instrument.attributes, range: value } 
          })}
        />
        <PropertyInput
          label="Signal Type"
          value={instrument.attributes.signalType || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...instrument.attributes, signalType: value } 
          })}
        />
      </PropertySection>
    </div>
  );
}

interface LinePropertiesProps {
  line: ProcessLine;
  onUpdate: (updates: Partial<ProcessLine>) => void;
}

function LineProperties({ line, onUpdate }: LinePropertiesProps) {
  return (
    <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        Line Properties
      </h2>
      
      <PropertySection title="Identification">
        <PropertyInput
          label="Line Number"
          value={line.attributes.lineNumber || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...line.attributes, lineNumber: value } 
          })}
        />
        <PropertyDisplay label="Type" value={line.lineType} />
      </PropertySection>

      <PropertySection title="Specifications">
        <PropertyInput
          label="Size"
          value={line.attributes.size || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...line.attributes, size: value } 
          })}
        />
        <PropertyInput
          label="Material"
          value={line.attributes.material || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...line.attributes, material: value } 
          })}
        />
        <PropertyInput
          label="Rating"
          value={line.attributes.rating || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...line.attributes, rating: value } 
          })}
        />
        <PropertyInput
          label="Fluid"
          value={line.attributes.fluid || ''}
          onChange={(value) => onUpdate({ 
            attributes: { ...line.attributes, fluid: value } 
          })}
        />
      </PropertySection>

      <PropertySection title="Connection">
        <PropertyDisplay label="From" value={line.source.elementId.slice(0, 8) + '...'} />
        <PropertyDisplay label="To" value={line.target.elementId.slice(0, 8) + '...'} />
      </PropertySection>
    </div>
  );
}

// =============================================================================
// REUSABLE PROPERTY COMPONENTS
// =============================================================================

function PropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

interface PropertyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
}

function PropertyInput({ label, value, onChange, type = 'text' }: PropertyInputProps) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                   bg-white"
      />
    </div>
  );
}

function PropertyDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="px-2 py-1 text-sm bg-gray-100 rounded text-gray-700 capitalize">
        {value.replace(/_/g, ' ')}
      </div>
    </div>
  );
}

interface PropertySelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function PropertySelect({ label, value, options, onChange }: PropertySelectProps) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded 
                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                   bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
