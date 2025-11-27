import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertyPanel from './components/PropertyPanel';
import ValidationIndicator from './components/ValidationIndicator';
import { useDiagramStore } from './store/diagramStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { saveDiagramToFile } from './utils/serialization';

/**
 * Smart P&ID - Main Application
 *
 * Layout:
 * ┌─────────┬────────────────────────┬──────────┐
 * │ Toolbar │        Canvas          │ Property │
 * │  (64px) │       (flex-1)         │  Panel   │
 * │         │                        │ (288px)  │
 * └─────────┴────────────────────────┴──────────┘
 */
export default function App() {
  const { diagram, isDirty } = useDiagramStore();

  // Handle save via keyboard shortcut
  const handleSave = () => {
    saveDiagramToFile(diagram);
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts(handleSave);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="h-10 bg-gray-800 text-white flex items-center px-4 border-b border-gray-700">
        <h1 className="text-sm font-semibold tracking-wide">
          Smart P&ID
        </h1>
        <span className="mx-3 text-gray-500">|</span>
        <span className="text-sm text-gray-300">
          {diagram.metadata.title}
          {isDirty && <span className="text-amber-400 ml-1">•</span>}
        </span>
        <div className="flex-1" />
        <ValidationIndicator />
        <span className="mx-3 text-gray-600">|</span>
        <span className="text-xs text-gray-500">
          v0.2.0 (Phase 2 Complete)
        </span>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left toolbar */}
        <Toolbar />

        {/* Canvas */}
        <main className="flex-1 overflow-hidden">
          <Canvas />
        </main>

        {/* Right property panel */}
        <PropertyPanel />
      </div>

      {/* Status bar */}
      <footer className="h-6 bg-gray-800 text-gray-400 flex items-center px-4 text-xs border-t border-gray-700">
        <span>
          {diagram.equipment.length} equipment • {diagram.valves.length} valves • {diagram.instruments.length} instruments • {diagram.lines.length} lines
        </span>
        <div className="flex-1" />
        <span className="text-gray-500">
          Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Delete</kbd> to remove selected
        </span>
      </footer>
    </div>
  );
}
