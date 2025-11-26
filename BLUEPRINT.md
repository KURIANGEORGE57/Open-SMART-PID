# Smart P&ID Development Blueprint

> A comprehensive guide for developers contributing to the Smart P&ID open-source project.

---

## Table of Contents

1. [Vision & Goals](#vision--goals)
2. [Architecture Overview](#architecture-overview)
3. [Data Model](#data-model)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Symbol Library](#symbol-library)
7. [Development Workflow](#development-workflow)
8. [Coding Standards](#coding-standards)
9. [Testing Strategy](#testing-strategy)
10. [Performance Guidelines](#performance-guidelines)
11. [Accessibility](#accessibility)
12. [Roadmap](#roadmap)
13. [Future: AI Integration](#future-ai-integration)
14. [Future: Backend & Collaboration](#future-backend--collaboration)
15. [Contributing](#contributing)

---

## Vision & Goals

### What We're Building

Smart P&ID is an **open-source, web-based intelligent Piping and Instrumentation Diagram editor**. Unlike traditional CAD-based P&ID tools, every element in a Smart P&ID is a database object with embedded metadata, enabling:

- Automated generation of equipment lists, line lists, and instrument indexes
- Validation and consistency checking
- Integration with plant lifecycle systems
- Future AI-assisted diagram generation

### Why It Matters

Commercial Smart P&ID tools (Aveva, Hexagon, Bentley) cost $10,000+/seat/year and lock users into proprietary formats. There is no viable open-source alternative. Smart P&ID aims to fill this gap for:

- Small EPCs and engineering consultancies
- Academic institutions teaching process engineering
- Startups building plant automation software
- Process engineers who need quick, shareable diagrams

### Core Principles

1. **Data Model First** — The schema is the foundation. UI is just a view.
2. **Standards Compliant** — Follow ISA S5.1 for symbols, align with DEXPI for data exchange.
3. **Progressive Complexity** — Simple by default, powerful when needed.
4. **Offline First** — Work without internet, sync when available.
5. **Extensible** — Plugin architecture for custom symbols and integrations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────┐  ┌─────────────────────────┐  ┌─────────────────┐  │
│  │ Toolbar │  │    Canvas (React Flow)   │  │ Property Panel  │  │
│  │         │  │                          │  │                 │  │
│  │ Symbols │  │  ┌─────┐  ┌─────┐       │  │ Context-aware   │  │
│  │ Actions │  │  │Node │──│Node │       │  │ property editor │  │
│  │ File IO │  │  └─────┘  └─────┘       │  │                 │  │
│  └─────────┘  └─────────────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         STATE LAYER (Zustand)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DiagramStore                                             │   │
│  │  ├── diagram: PIDDiagram                                  │   │
│  │  ├── selectedIds: string[]                                │   │
│  │  ├── history: { past: [], future: [] }                    │   │
│  │  ├── activeTool: ToolType                                 │   │
│  │  └── actions: add/update/remove/undo/redo                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Schema (DEXPI-inspired)                                  │   │
│  │  ├── Equipment (vessels, pumps, exchangers...)           │   │
│  │  ├── Valves (gate, globe, control...)                    │   │
│  │  ├── Instruments (transmitters, controllers...)          │   │
│  │  ├── ProcessLines (pipes connecting elements)            │   │
│  │  └── Annotations (text, notes)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PERSISTENCE LAYER                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │ JSON File  │  │ IndexedDB  │  │ Cloud Sync │                 │
│  │ (MVP)      │  │ (Offline)  │  │ (Future)   │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| UI Framework | React 18 | Component model, ecosystem, TypeScript support |
| Canvas | React Flow (@xyflow/react) | Purpose-built for node-based UIs, handles pan/zoom/selection |
| State | Zustand | Minimal boilerplate, excellent TypeScript support, easy undo/redo |
| Styling | Tailwind CSS | Rapid prototyping, consistent design tokens |
| Build | Vite | Fast HMR, modern ESM-first approach |
| Language | TypeScript | Type safety critical for complex schema |

---

## Data Model

### Design Philosophy

The data model is inspired by **DEXPI (Data Exchange in Process Industries)**, the ISO 15926-based open standard for P&ID data. We simplify DEXPI for MVP while maintaining upgrade paths.

Key principles:
1. Every element has a unique `id` (UUID)
2. Tag numbers are optional but recommended
3. Connectivity is explicit (source/target references)
4. Attributes are type-specific but extensible via `metadata`

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   PIDDiagram    │       │    Equipment    │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ version         │──────<│ tag             │
│ metadata        │       │ category        │
│ viewport        │       │ position        │
└─────────────────┘       │ dimensions      │
        │                 │ nozzles[]       │
        │                 │ attributes      │
        │                 └────────┬────────┘
        │                          │
        ▼                          │ connects via
┌─────────────────┐               │
│  ProcessLine    │               │
├─────────────────┤               │
│ id              │               │
│ lineType        │◄──────────────┘
│ source {        │
│   elementId     │──────────────────┐
│   nozzleId      │                  │
│ }               │                  │
│ target {        │       ┌──────────▼──────┐
│   elementId     │       │     Valve       │
│   nozzleId      │       ├─────────────────┤
│ }               │       │ id              │
│ attributes      │       │ tag             │
└─────────────────┘       │ category        │
                          │ position        │
                          │ connectionPoints│
                          │ attributes      │
                          └─────────────────┘
                                   │
                                   │
                          ┌────────▼────────┐
                          │   Instrument    │
                          ├─────────────────┤
                          │ id              │
                          │ tag             │
                          │ function (F/L/P)│
                          │ types (I/C/T)   │
                          │ location        │
                          │ isInline        │
                          │ connectionPoints│
                          └─────────────────┘
```

### Schema Version Strategy

The `version` field in `PIDDiagram` enables schema migrations:

```typescript
// Current version
version: "1.0.0"

// Migration example (future)
if (diagram.version === "1.0.0") {
  // Migrate to 1.1.0
  diagram.equipment.forEach(eq => {
    eq.attributes.operatingConditions = eq.attributes.operatingConditions || {};
  });
  diagram.version = "1.1.0";
}
```

### Nozzle System

Nozzles are connection points on equipment. They enable:
- Proper piping connections (not just visual)
- Nozzle schedules generation
- P&ID to 3D model handoff

```typescript
interface Nozzle {
  id: string;
  name?: string;              // "N1", "Inlet", "Steam In"
  type: NozzleType;           // inlet, outlet, bidirectional, utility, vent, drain
  relativePosition: Position; // 0-1 normalized, relative to equipment bounds
  size?: string;              // "2\"", "DN50"
  rating?: string;            // "150#", "PN16"
  facing?: string;            // "RF", "RTJ"
}
```

---

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── Canvas.tsx              # Main React Flow wrapper
│   ├── Toolbar.tsx             # Left-side tool palette
│   ├── PropertyPanel.tsx       # Right-side property editor
│   ├── nodes/                  # Custom React Flow nodes
│   │   ├── index.ts            # Node type registry
│   │   ├── VesselNode.tsx      # Vertical vessel symbol
│   │   ├── PumpNode.tsx        # Centrifugal pump symbol
│   │   ├── ValveNode.tsx       # Multiple valve types
│   │   ├── InstrumentNode.tsx  # ISA instrument bubble
│   │   ├── HeatExchangerNode.tsx  # (TODO)
│   │   ├── ColumnNode.tsx         # (TODO)
│   │   └── TankNode.tsx           # (TODO)
│   ├── edges/                  # Custom React Flow edges (TODO)
│   │   ├── ProcessLineEdge.tsx
│   │   └── SignalLineEdge.tsx
│   ├── dialogs/                # Modal dialogs (TODO)
│   │   ├── ExportDialog.tsx
│   │   ├── SettingsDialog.tsx
│   │   └── NozzleEditor.tsx
│   └── shared/                 # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Select.tsx
├── store/
│   └── diagramStore.ts         # Zustand store
├── types/
│   └── schema.ts               # Core data types
├── utils/
│   ├── validation.ts           # Diagram validation rules
│   ├── serialization.ts        # Save/load helpers
│   ├── export.ts               # SVG/PNG/DEXPI export
│   └── geometry.ts             # Position/dimension helpers
├── hooks/
│   ├── useKeyboardShortcuts.ts
│   ├── useAutoSave.ts
│   └── useDiagramValidation.ts
├── constants/
│   ├── symbols.ts              # Symbol library definitions
│   └── defaults.ts             # Default values
└── App.tsx
```

### Node Component Pattern

Each custom node follows this pattern:

```tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Equipment } from '../../types/schema';

interface VesselNodeData {
  equipment: Equipment;
  selected?: boolean;
}

function VesselNode({ data, selected }: NodeProps<VesselNodeData>) {
  const { equipment } = data;
  
  return (
    <div className="relative" style={{ width: equipment.dimensions.width, height: equipment.dimensions.height }}>
      {/* SVG Symbol */}
      <svg>
        {/* ISA-compliant symbol geometry */}
      </svg>
      
      {/* Tag label */}
      {equipment.tag && (
        <div className="absolute -bottom-6 ...">
          {equipment.tag}
        </div>
      )}
      
      {/* Connection handles */}
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      {/* ... more handles for nozzles */}
    </div>
  );
}

export default memo(VesselNode);  // Memoize for performance
```

### Adding a New Symbol

1. Create `src/components/nodes/NewSymbolNode.tsx`
2. Follow the pattern above with ISA-compliant SVG
3. Register in `src/components/nodes/index.ts`:
   ```typescript
   import NewSymbolNode from './NewSymbolNode';
   export const nodeTypes = {
     // ...existing
     newSymbol: NewSymbolNode,
   };
   ```
4. Add toolbar button in `Toolbar.tsx`
5. Update schema if new entity type needed

---

## State Management

### Store Structure

```typescript
interface DiagramState {
  // Data
  diagram: PIDDiagram;
  selectedIds: string[];
  history: { past: PIDDiagram[], future: PIDDiagram[] };
  
  // UI State
  isDirty: boolean;
  activeTool: ToolType;
  
  // Actions (grouped by entity)
  // ... see diagramStore.ts for full API
}
```

### Undo/Redo Implementation

We use a simple snapshot-based approach:

```typescript
const MAX_HISTORY = 50;

saveToHistory: () => {
  set((state) => ({
    history: {
      past: [...state.history.past.slice(-MAX_HISTORY + 1), state.diagram],
      future: []  // Clear redo stack on new action
    }
  }));
}

undo: () => {
  const { history, diagram } = get();
  if (history.past.length === 0) return;
  
  const previous = history.past[history.past.length - 1];
  set({
    diagram: previous,
    history: {
      past: history.past.slice(0, -1),
      future: [diagram, ...history.future]
    }
  });
}
```

**Future optimization**: For large diagrams, consider operation-based undo (storing deltas instead of full snapshots).

### Selectors for Performance

Use selectors to prevent unnecessary re-renders:

```typescript
// In store
export const selectEquipment = (state: DiagramState) => state.diagram.equipment;
export const selectSelectedIds = (state: DiagramState) => state.selectedIds;

// In component
const equipment = useDiagramStore(selectEquipment);
const selectedIds = useDiagramStore(selectSelectedIds);
```

---

## Symbol Library

### ISA S5.1 Compliance

All symbols should follow **ISA S5.1** (Instrumentation Symbols and Identification) and **ISO 10628** (Diagrams for the Chemical and Petrochemical Industry).

### Symbol Categories

| Category | Examples | Priority |
|----------|----------|----------|
| Vessels | Vertical, Horizontal, Column, Drum | P0 (MVP) |
| Rotating Equipment | Pumps, Compressors, Blowers, Fans | P0 |
| Heat Transfer | Shell & Tube, Plate, Air Cooler | P1 |
| Valves | Gate, Globe, Ball, Butterfly, Check, Control, Relief | P0 |
| Instruments | All ISA function/type combinations | P0 |
| Piping | Lines, Reducers, Spec Breaks | P0 |
| Tanks | Atmospheric, Floating Roof, Cone Roof | P1 |
| Separators | 2-Phase, 3-Phase | P1 |
| Filters/Strainers | Y-Strainer, Duplex, Bag | P2 |
| Miscellaneous | Flare, Silencer, Ejector | P2 |

### Symbol SVG Guidelines

1. **Viewbox**: Use consistent viewbox, typically `0 0 width height`
2. **Stroke**: Default 2px, selected 2.5px, color `#1f2937` (gray-800)
3. **Fill**: Generally `none` for process equipment, filled for directional indicators
4. **Centerline**: Dashed line `strokeDasharray="4 2"` in gray
5. **Handles**: Positioned at nozzle locations, 12px diameter circles

```svg
<!-- Example: Gate Valve -->
<svg viewBox="0 0 40 40">
  <!-- Left triangle -->
  <path d="M 0 8 L 20 20 L 0 32 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
  <!-- Right triangle -->
  <path d="M 40 8 L 20 20 L 40 32 Z" fill="none" stroke="#1f2937" stroke-width="2"/>
  <!-- Stem -->
  <line x1="20" y1="20" x2="20" y2="4" stroke="#1f2937" stroke-width="2"/>
</svg>
```

---

## Development Workflow

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/smart-pid.git
cd smart-pid

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Branch Strategy

```
main              # Production-ready code
├── develop       # Integration branch
├── feature/*     # New features
├── bugfix/*      # Bug fixes
└── release/*     # Release preparation
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add heat exchanger symbol
fix: correct valve handle positions
docs: update BLUEPRINT with symbol guidelines
refactor: extract common node logic to hook
test: add validation engine tests
chore: update dependencies
```

### Pull Request Checklist

- [ ] Code follows project coding standards
- [ ] New features have tests
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Works in Chrome, Firefox, Safari
- [ ] Accessible (keyboard navigation, screen reader)
- [ ] Changelog updated

---

## Coding Standards

### TypeScript

```typescript
// ✅ Use explicit types for function parameters and returns
function calculateNozzlePosition(equipment: Equipment, nozzleId: string): Position {
  // ...
}

// ✅ Use interfaces for objects, types for unions/primitives
interface Equipment { ... }
type EquipmentCategory = 'vessel' | 'pump' | 'column';

// ✅ Use const assertions for literal types
const CATEGORIES = ['vessel', 'pump', 'column'] as const;

// ❌ Avoid `any`
function processData(data: any) { } // Bad
function processData(data: unknown) { } // Better
function processData(data: Equipment) { } // Best
```

### React

```tsx
// ✅ Use functional components with hooks
function MyComponent({ prop }: Props) {
  const [state, setState] = useState(initialState);
  // ...
}

// ✅ Memoize expensive computations
const expensiveValue = useMemo(() => compute(data), [data]);

// ✅ Memoize callbacks passed to children
const handleClick = useCallback(() => { ... }, [dependencies]);

// ✅ Memoize components that receive stable props
export default memo(MyComponent);

// ✅ Use semantic HTML
<button onClick={...}>Save</button>  // Not <div onClick={...}>

// ❌ Avoid inline styles (use Tailwind)
<div style={{ marginTop: 10 }}>  // Bad
<div className="mt-2.5">          // Good
```

### File Naming

```
ComponentName.tsx     # React components (PascalCase)
hookName.ts          # Custom hooks (camelCase with "use" prefix)
utilityName.ts       # Utility functions (camelCase)
CONSTANT_NAME.ts     # Constants (UPPER_SNAKE_CASE for values)
schema.ts            # Type definitions (camelCase)
```

---

## Testing Strategy

### Test Pyramid

```
        ┌─────────┐
        │   E2E   │  ← Few, critical user journeys
       ┌┴─────────┴┐
       │Integration│  ← Component + store interactions
      ┌┴───────────┴┐
      │    Unit     │  ← Schema, utils, validation logic
     └──────────────┘
```

### Unit Tests

Focus on pure logic:

```typescript
// src/utils/validation.test.ts
describe('validateDiagram', () => {
  it('detects duplicate tag numbers', () => {
    const diagram = createDiagram({
      equipment: [
        createEquipment({ tag: 'V-100', category: 'vessel' }),
        createEquipment({ tag: 'V-100', category: 'vessel' }),  // Duplicate
      ]
    });
    
    const errors = validateDiagram(diagram);
    expect(errors).toContainEqual({
      type: 'duplicate_tag',
      message: 'Duplicate tag: V-100',
      elementIds: [expect.any(String), expect.any(String)]
    });
  });
  
  it('detects orphan lines', () => {
    // Line references non-existent equipment
  });
});
```

### Integration Tests

Test component + store interactions:

```typescript
// src/components/Canvas.test.tsx
describe('Canvas', () => {
  it('adds equipment when clicking toolbar button', async () => {
    render(<App />);
    
    await userEvent.click(screen.getByLabelText('Add Vessel'));
    
    const { diagram } = useDiagramStore.getState();
    expect(diagram.equipment).toHaveLength(1);
    expect(diagram.equipment[0].category).toBe('vessel');
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/diagram-workflow.spec.ts
test('user can create and save a simple P&ID', async ({ page }) => {
  await page.goto('/');
  
  // Add equipment
  await page.click('[data-testid="tool-vessel"]');
  await page.click('[data-testid="tool-pump"]');
  
  // Connect them
  await page.dragAndDrop('[data-handleid="vessel-bottom"]', '[data-handleid="pump-suction"]');
  
  // Save
  await page.click('[data-testid="save-button"]');
  
  // Verify download triggered
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toMatch(/\.json$/);
});
```

---

## Performance Guidelines

### React Flow Optimization

1. **Memoize nodes**: All custom nodes use `memo()`
2. **Viewport culling**: React Flow only renders visible nodes
3. **Batch updates**: Group state updates to minimize re-renders

```typescript
// ❌ Multiple separate updates
addEquipment(eq1);
addEquipment(eq2);
addEquipment(eq3);

// ✅ Single batched update
addEquipmentBatch([eq1, eq2, eq3]);
```

### Large Diagram Handling

For diagrams with 500+ elements:

1. **Virtualization**: Already handled by React Flow
2. **Lazy property loading**: Only load full attributes when selected
3. **Progressive rendering**: Show simplified shapes when zoomed out
4. **Web Workers**: Offload validation to background thread

```typescript
// Simplified symbols at low zoom
function VesselNode({ data, zoom }) {
  if (zoom < 0.3) {
    return <SimpleVesselPlaceholder />;
  }
  return <FullVesselSymbol data={data} />;
}
```

### Bundle Size

Target: < 500KB initial JS bundle

```bash
# Analyze bundle
npm run build
npx vite-bundle-analyzer
```

Strategies:
- Tree-shake unused React Flow features
- Lazy load dialogs and settings
- Code-split symbol categories

---

## Accessibility

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus between elements |
| `Arrow keys` | Move selected element (when focused) |
| `Delete` / `Backspace` | Delete selected elements |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+A` | Select all |
| `Escape` | Deselect all / Cancel operation |
| `Ctrl+S` | Save diagram |

### Screen Reader Support

```tsx
// ✅ Provide accessible labels
<button aria-label="Add vertical vessel to diagram">
  <VesselIcon />
</button>

// ✅ Announce state changes
<div role="status" aria-live="polite">
  {message && <span>{message}</span>}
</div>

// ✅ Describe complex elements
<div 
  role="img" 
  aria-label={`Vessel ${equipment.tag}, ${equipment.description}`}
>
  <VesselSVG />
</div>
```

### Color Contrast

- All text: minimum 4.5:1 contrast ratio
- Interactive elements: minimum 3:1
- Don't rely on color alone (use patterns/icons)

---

## Roadmap

### Phase 1: Foundation (MVP) ✅
- [x] React Flow canvas with pan/zoom
- [x] Basic symbol nodes (vessel, pump, valve, instrument)
- [x] Property panel
- [x] Zustand state management with undo/redo
- [x] JSON save/load

### Phase 2: Core Features (Current)
- [ ] Expand symbol library (heat exchangers, columns, tanks)
- [ ] Custom edge types (process line with breaks, signal lines)
- [ ] Validation engine
  - [ ] Duplicate tag detection
  - [ ] Orphan connection detection
  - [ ] Spec break consistency
- [ ] SVG/PNG export
- [ ] Keyboard shortcuts

### Phase 3: Professional Features
- [ ] DEXPI XML export
- [ ] DXF export (for CAD interop)
- [ ] Line numbering with spec parsing
- [ ] Instrument loop diagrams
- [ ] Multi-sheet support
- [ ] Revision management
- [ ] Print-ready output (title block, drawing border)

### Phase 4: Collaboration
- [ ] IndexedDB for offline storage
- [ ] Cloud sync (optional backend)
- [ ] Real-time collaboration (CRDT-based)
- [ ] Comments and annotations
- [ ] Change tracking

### Phase 5: Intelligence
- [ ] AI-assisted symbol placement
- [ ] Natural language to P&ID generation
- [ ] P&ID reading/digitization
- [ ] Design rule checking (control loop completeness, etc.)

---

## Future: AI Integration

The architecture is designed to accommodate future AI features. The key integration point is the **data model**.

### AI Agent Interface

```typescript
interface PIDGenerationRequest {
  description: string;  // Natural language process description
  context?: {
    industry?: string;
    designBasis?: string;
    existingEquipment?: Equipment[];
  };
}

interface PIDGenerationResponse {
  diagram: PIDDiagram;
  confidence: number;
  suggestions: string[];
}

// Example usage
const response = await generatePID({
  description: `
    A feed pump takes crude oil from the storage tank and pumps it to 
    the atmospheric distillation column. The feed is preheated in a 
    heat exchanger using the column bottoms. Flow is controlled by 
    FIC-100 which adjusts the pump speed.
  `,
  context: {
    industry: 'refining',
  }
});

// Response contains a complete PIDDiagram that can be loaded into the editor
setDiagram(response.diagram);
```

### LLM Prompt Engineering

The schema's declarative nature makes it suitable for LLM generation:

```python
system_prompt = """
You are a process engineering assistant. Generate P&ID diagrams as JSON 
following this schema:

{schema_definition}

Rules:
1. Use ISA S5.1 tag naming conventions
2. Connect equipment via nozzles
3. Include appropriate control loops
4. Add isolation and check valves where needed
"""
```

### Synthetic Data Generation

Use pyDEXPI patterns for training data:

```python
from pydexpi import Pattern, RandomGeneratorFunction

# Generate synthetic P&IDs for fine-tuning
patterns = [
  PumpSystem(),
  HeatExchangerTrain(), 
  DistillationColumn(),
  # ...
]

generator = RandomGeneratorFunction(patterns)
for i in range(10000):
  diagram = generator.generate()
  save_as_training_example(diagram)
```

---

## Future: Backend & Collaboration

### API Design (Draft)

```typescript
// REST endpoints
GET    /api/diagrams              // List user's diagrams
POST   /api/diagrams              // Create new diagram
GET    /api/diagrams/:id          // Get diagram by ID
PUT    /api/diagrams/:id          // Update diagram
DELETE /api/diagrams/:id          // Delete diagram
GET    /api/diagrams/:id/history  // Get revision history

// WebSocket for real-time collaboration
ws://api/diagrams/:id/collaborate
  -> { type: 'join', userId: '...' }
  <- { type: 'state', diagram: {...}, users: [...] }
  -> { type: 'operation', op: {...} }
  <- { type: 'operation', op: {...}, userId: '...' }
```

### Database Schema (PostgreSQL)

```sql
CREATE TABLE diagrams (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  data JSONB NOT NULL,  -- The PIDDiagram
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE diagram_revisions (
  id UUID PRIMARY KEY,
  diagram_id UUID REFERENCES diagrams(id),
  data JSONB NOT NULL,
  message TEXT,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For real-time collaboration
CREATE TABLE diagram_operations (
  id UUID PRIMARY KEY,
  diagram_id UUID REFERENCES diagrams(id),
  operation JSONB NOT NULL,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### CRDT Consideration

For conflict-free real-time editing, consider:
- **Yjs**: Mature CRDT library with React bindings
- **Automerge**: JSON-like CRDT, good for our data model

---

## Contributing

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Questions and ideas
- **Discord**: Real-time chat (link TBD)

### First-Time Contributors

Look for issues labeled `good-first-issue`:
- Adding a new symbol
- Improving documentation
- Writing tests
- Fixing minor bugs

### Code Review Process

1. Open PR against `develop` branch
2. Automated checks run (lint, test, build)
3. At least one maintainer review required
4. Address feedback
5. Squash merge when approved

### Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md`
- Release notes
- README badges (for significant contributions)

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

*This blueprint is a living document. Update it as the project evolves.*

*Last updated: 2025*
