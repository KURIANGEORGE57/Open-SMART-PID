# Changelog

All notable changes to Smart P&ID will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Heat exchanger symbol
- Column/tower symbol
- Horizontal vessel symbol
- Validation engine
- SVG/PNG export
- Keyboard shortcuts

---

## [0.1.0] - 2025-XX-XX

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
