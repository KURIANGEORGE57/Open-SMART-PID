# Smart P&ID

An open-source intelligent Piping and Instrumentation Diagram editor.

## Features

### ✅ Phase 1 - MVP (Completed)
- [x] React Flow based canvas with pan/zoom
- [x] Custom P&ID symbol nodes (Equipment, Instruments, Valves)
- [x] Connection semantics (pipes know their endpoints)
- [x] Property panel for editing attributes
- [x] Undo/Redo (50 levels)
- [x] Save/Load to JSON

### ✅ Phase 2 - Core Features (Completed)
- [x] **Expanded Symbol Library**: Heat exchangers, distillation columns, storage tanks
- [x] **Keyboard Shortcuts**: Ctrl+Z/Y (undo/redo), Delete, Ctrl+S (save), Ctrl+A, Escape
- [x] **Validation Engine**: Real-time duplicate tags, orphan connections, disconnected equipment detection
- [x] **Export Functionality**: SVG and PNG export with high-resolution support
- [x] **Custom Edges**: Process lines with insulation indicators, signal lines with color coding

### 🚧 Phase 3 - Professional Features (Planned)
- [ ] DEXPI XML export (full implementation)
- [ ] DXF export for CAD interoperability
- [ ] Line numbering with spec parsing
- [ ] Instrument loop diagrams
- [ ] Multi-sheet support
- [ ] Revision management
- [ ] Print-ready output with title blocks

### 🔮 Future
- [ ] AI-assisted diagram generation
- [ ] Collaborative editing
- [ ] Cloud sync

## Quick Start

```bash
npm install
npm run dev
```

## Project Structure

```
smart-pid/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx              # Main React Flow canvas
│   │   ├── PropertyPanel.tsx       # Edit selected element properties
│   │   ├── Toolbar.tsx             # Symbol palette & actions
│   │   ├── ValidationIndicator.tsx # Real-time validation status
│   │   ├── nodes/                  # Custom P&ID symbol nodes
│   │   │   ├── VesselNode.tsx
│   │   │   ├── PumpNode.tsx
│   │   │   ├── ValveNode.tsx
│   │   │   ├── InstrumentNode.tsx
│   │   │   ├── HeatExchangerNode.tsx
│   │   │   ├── ColumnNode.tsx
│   │   │   ├── TankNode.tsx
│   │   │   └── index.ts
│   │   └── edges/                  # Custom edge components
│   │       ├── ProcessLineEdge.tsx
│   │       ├── SignalLineEdge.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useDiagramValidation.ts
│   ├── store/
│   │   └── diagramStore.ts         # Zustand state management
│   ├── types/
│   │   └── schema.ts               # P&ID data model (DEXPI-inspired)
│   ├── utils/
│   │   ├── validation.ts           # Diagram validation rules
│   │   ├── serialization.ts        # Save/load helpers
│   │   └── export.ts               # SVG/PNG export utilities
│   ├── App.tsx
│   └── main.tsx
├── examples/
│   └── sample-feed-system.json
├── public/
├── BLUEPRINT.md                     # Development guide
├── CONTRIBUTING.md
└── package.json
```

## Data Model

The schema is inspired by DEXPI (Data Exchange in Process Industries) but simplified for MVP. Key entities:

- **Equipment**: Vessels, columns, heat exchangers, pumps, etc.
- **PipingComponent**: Valves, fittings, reducers
- **Instrument**: Sensors, transmitters, controllers
- **ProcessLine**: Pipes connecting components
- **Nozzle**: Connection points on equipment

Each entity has:
- Unique ID
- Tag number
- Position/dimensions
- Type-specific attributes
- Connection handles (nozzles/ports)

## Tech Stack

- React 18 + TypeScript
- React Flow (@xyflow/react)
- Zustand (state management)
- Tailwind CSS (styling)
- Vite (build tool)

## License

MIT
