# Changelog

All notable changes to Smart P&ID will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned (Phase 3)
- DEXPI XML export (full implementation)
- DXF export for CAD interoperability
- Line numbering with spec parsing
- Instrument loop diagrams
- Multi-sheet support
- Revision management

---

## [0.2.0] - 2025-01-XX

### Added - Phase 2: Core Features
- **New Symbol Nodes**:
  - Heat Exchanger Node with shell & tube representation
  - Distillation Column Node with internal trays
  - Storage Tank Node with multiple nozzle connections
- **Keyboard Shortcuts**:
  - Global shortcuts for undo/redo (Ctrl+Z/Y)
  - Delete key for removing selected elements
  - Ctrl+S for quick save
  - Ctrl+A for select all
  - Escape for deselection
  - Mac support with Command key detection
- **Validation Engine**:
  - Real-time diagram validation with visual feedback
  - Duplicate tag number detection
  - Orphan line detection (references to non-existent elements)
  - Disconnected equipment warnings
  - Missing tag warnings
  - Color-coded severity indicator in header
- **Export Functionality**:
  - SVG export with proper viewBox and white background
  - PNG export with high-resolution support (2x scaling)
  - DEXPI XML export placeholder structure
  - Export buttons in toolbar with error handling
- **Custom Edge Components**:
  - ProcessLineEdge with insulation/tracing indicators
  - SignalLineEdge with color coding by signal type
  - Dashed line styles for different line types
  - Custom labels with line numbers and specifications
- **New Utilities**:
  - Serialization module for save/load operations
  - Export utilities for SVG/PNG generation
  - Validation hook for real-time feedback
  - Keyboard shortcuts hook

### Changed
- Updated Canvas component to support new node and edge types
- Enhanced Toolbar with new symbol buttons and export options
- Refactored save/load to use shared serialization utilities
- Improved type mapping for equipment categories

### Technical
- Added hooks directory with useKeyboardShortcuts and useDiagramValidation
- Added edges directory with custom edge components
- Extended node library from 4 to 7 symbol types
- 15 files changed, ~1,400 lines added
- Full TypeScript type safety maintained

---

## [0.1.0] - 2025-01-XX

### Added
- Initial project scaffold
- React Flow canvas with pan, zoom, and grid
- Custom symbol nodes:
  - Vertical vessel
  - Centrifugal pump
  - Valves (gate, globe, ball, butterfly, check, control, relief)
  - Instruments (ISA S5.1 style bubbles)
- Zustand state management with undo/redo (50 levels)
- Property panel for editing selected elements
- Toolbar with symbol palette
- JSON save/load functionality
- DEXPI-inspired data schema
- TypeScript throughout
- Tailwind CSS styling

### Technical
- React 18 + TypeScript
- Vite build system
- @xyflow/react for canvas
- Zustand for state
- Tailwind CSS for styling

---

## Version History Format

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing functionality

#### Deprecated
- Features to be removed in future

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security improvements

---

[Unreleased]: https://github.com/ORG/smart-pid/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ORG/smart-pid/releases/tag/v0.1.0
