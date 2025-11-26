# Smart P&ID

An open-source intelligent Piping and Instrumentation Diagram editor.

## Features (Planned)

- [x] React Flow based canvas with pan/zoom
- [x] Custom P&ID symbol nodes (Equipment, Instruments, Valves)
- [x] Connection semantics (pipes know their endpoints)
- [x] Property panel for editing attributes
- [x] Save/Load to JSON
- [ ] Validation engine (orphan connections, duplicate tags)
- [ ] Symbol library expansion (ISA standard)
- [ ] SVG/PNG export
- [ ] DEXPI XML export
- [ ] AI agent integration (future)

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
│   │   ├── Canvas.tsx           # Main React Flow canvas
│   │   ├── PropertyPanel.tsx    # Edit selected element properties
│   │   ├── Toolbar.tsx          # Symbol palette & actions
│   │   └── nodes/               # Custom P&ID symbol nodes
│   │       ├── VesselNode.tsx
│   │       ├── PumpNode.tsx
│   │       ├── ValveNode.tsx
│   │       └── InstrumentNode.tsx
│   ├── store/
│   │   └── diagramStore.ts      # Zustand state management
│   ├── types/
│   │   └── schema.ts            # P&ID data model (DEXPI-inspired)
│   ├── utils/
│   │   ├── validation.ts        # Diagram validation rules
│   │   └── serialization.ts     # Save/load helpers
│   ├── App.tsx
│   └── main.tsx
├── public/
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
