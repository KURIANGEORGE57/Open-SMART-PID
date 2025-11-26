# Contributing to Smart P&ID

Thank you for your interest in contributing to Smart P&ID! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Style Guidelines](#style-guidelines)
- [Adding New Symbols](#adding-new-symbols)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). By participating, you agree to uphold this code. Please report unacceptable behavior to the maintainers.

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+ or pnpm
- Git
- A modern browser (Chrome, Firefox, Safari, Edge)

### First-Time Setup

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/smart-pid.git
cd smart-pid

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_ORG/smart-pid.git

# Install dependencies
npm install

# Start development server
npm run dev
```

### Finding Issues to Work On

- **`good-first-issue`**: Great for first-time contributors
- **`help-wanted`**: Issues where we need community help
- **`enhancement`**: New features
- **`bug`**: Bug fixes
- **`documentation`**: Documentation improvements

---

## Development Setup

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Environment Configuration

No environment variables required for basic development. For future features:

```bash
# .env.local (not committed)
VITE_API_URL=http://localhost:8000
VITE_ENABLE_ANALYTICS=false
```

### Project Structure Overview

```
smart-pid/
├── src/
│   ├── components/     # React components
│   │   ├── nodes/      # Custom P&ID symbol nodes
│   │   ├── edges/      # Custom line types (TODO)
│   │   └── ...
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── constants/      # Constants and defaults
├── public/             # Static assets
├── tests/              # Test files (TODO)
└── docs/               # Documentation
```

---

## Making Changes

### Branch Naming

```
feature/add-heat-exchanger-symbol
bugfix/fix-valve-handle-position
docs/update-readme
refactor/extract-node-utils
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build, dependencies, tooling

**Examples:**
```
feat(symbols): add shell and tube heat exchanger node

fix(canvas): correct handle positions on rotated valves

docs(blueprint): add performance guidelines section

refactor(store): extract history logic to separate slice
```

### Code Quality Checklist

Before committing:

- [ ] Code compiles without errors (`npm run build`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] New code has appropriate TypeScript types
- [ ] Complex logic is commented
- [ ] UI changes tested in multiple browsers

---

## Submitting Changes

### Pull Request Process

1. **Update your fork:**
   ```bash
   git fetch upstream
   git checkout develop
   git merge upstream/develop
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit them

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** against `develop` branch

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (describe)

## Related Issues
Fixes #123

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. Automated checks must pass (lint, build)
2. At least one maintainer approval required
3. All comments must be resolved
4. Branch must be up-to-date with `develop`

---

## Style Guidelines

### TypeScript

```typescript
// ✅ Explicit return types
function calculatePosition(element: Equipment): Position {
  return { x: element.position.x + 10, y: element.position.y };
}

// ✅ Use interface for object shapes
interface SymbolProps {
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
}

// ✅ Use type for unions
type ToolType = 'select' | 'pan' | 'connect';

// ✅ Prefer const assertions
const VALVE_TYPES = ['gate', 'globe', 'ball'] as const;

// ❌ Avoid any
function process(data: any) { }  // Bad

// ✅ Use unknown for truly unknown types
function process(data: unknown) {
  if (isEquipment(data)) {
    // Now TypeScript knows it's Equipment
  }
}
```

### React Components

```tsx
// ✅ Functional components with explicit types
interface Props {
  equipment: Equipment;
  onSelect: (id: string) => void;
}

function EquipmentCard({ equipment, onSelect }: Props) {
  // ✅ Destructure props
  const { tag, description } = equipment;
  
  // ✅ Use callbacks for event handlers
  const handleClick = useCallback(() => {
    onSelect(equipment.id);
  }, [equipment.id, onSelect]);
  
  return (
    <div onClick={handleClick}>
      {/* ✅ Use Tailwind for styling */}
      <h3 className="text-lg font-semibold">{tag}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

// ✅ Memoize components that receive stable props
export default memo(EquipmentCard);
```

### CSS/Tailwind

```tsx
// ✅ Use Tailwind utility classes
<div className="flex items-center gap-2 p-4 bg-white rounded-lg shadow">

// ✅ Use template literals for conditional classes
<div className={`p-2 rounded ${selected ? 'bg-blue-100' : 'bg-white'}`}>

// ✅ Group related utilities
<button className="
  px-4 py-2 
  bg-blue-600 hover:bg-blue-700 
  text-white font-medium 
  rounded-md transition-colors
">

// ❌ Avoid inline styles
<div style={{ marginTop: 10, padding: 20 }}>  // Bad
```

### File Organization

```typescript
// ✅ Order imports: external, internal, relative, types
import { useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

import { useDiagramStore } from '../../store/diagramStore';
import { validateTag } from '../../utils/validation';

import type { Equipment, Position as Pos } from '../../types/schema';

// ✅ Order within component file:
// 1. Type definitions
// 2. Constants
// 3. Helper functions
// 4. Main component
// 5. Sub-components
// 6. Export
```

---

## Adding New Symbols

### Step-by-Step Guide

#### 1. Research the Symbol

- Find ISA S5.1 or ISO 10628 reference
- Note required connection points
- Identify variations (subtypes)

#### 2. Create the Node Component

```tsx
// src/components/nodes/HeatExchangerNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Equipment } from '../../types/schema';

interface HeatExchangerNodeData {
  equipment: Equipment;
  selected?: boolean;
}

function HeatExchangerNode({ data, selected }: NodeProps<HeatExchangerNodeData>) {
  const { equipment } = data;
  const { dimensions, tag, subtype } = equipment;
  const { width, height } = dimensions;
  
  const strokeColor = selected ? '#2563eb' : '#1f2937';
  const strokeWidth = selected ? 2.5 : 2;
  
  return (
    <div className="relative" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Shell */}
        <ellipse 
          cx={width/2} cy={height*0.15} 
          rx={width*0.4} ry={height*0.12}
          fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
        />
        <rect 
          x={width*0.1} y={height*0.15} 
          width={width*0.8} height={height*0.7}
          fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
        />
        <ellipse 
          cx={width/2} cy={height*0.85} 
          rx={width*0.4} ry={height*0.12}
          fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
        />
        
        {/* Tube indication */}
        <line 
          x1={width*0.2} y1={height*0.3} 
          x2={width*0.2} y2={height*0.7}
          stroke={strokeColor} strokeWidth={strokeWidth}
        />
        <line 
          x1={width*0.8} y1={height*0.3} 
          x2={width*0.8} y2={height*0.7}
          stroke={strokeColor} strokeWidth={strokeWidth}
        />
      </svg>
      
      {/* Tag */}
      {tag && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 
                        text-xs font-mono font-semibold text-gray-800 bg-white px-1">
          {tag}
        </div>
      )}
      
      {/* Handles: Shell side */}
      <Handle type="target" position={Position.Left} id="shell-in" 
              style={{ top: '30%' }} className="!w-3 !h-3 !bg-green-500" />
      <Handle type="source" position={Position.Left} id="shell-out" 
              style={{ top: '70%' }} className="!w-3 !h-3 !bg-blue-500" />
      
      {/* Handles: Tube side */}
      <Handle type="target" position={Position.Top} id="tube-in" 
              className="!w-3 !h-3 !bg-green-500" />
      <Handle type="source" position={Position.Bottom} id="tube-out" 
              className="!w-3 !h-3 !bg-blue-500" />
    </div>
  );
}

export default memo(HeatExchangerNode);
```

#### 3. Register the Node Type

```typescript
// src/components/nodes/index.ts
import HeatExchangerNode from './HeatExchangerNode';

export const nodeTypes = {
  // ...existing
  heat_exchanger: HeatExchangerNode,
};
```

#### 4. Add to Toolbar

```tsx
// src/components/Toolbar.tsx
<ToolButton
  icon={<HeatExchangerIcon />}
  label="HX"
  onClick={() => handleAddEquipment('heat_exchanger', 'shell_tube')}
/>
```

#### 5. Update Schema (if needed)

If the new symbol requires new attributes, update `src/types/schema.ts`:

```typescript
export interface HeatExchangerAttributes extends EquipmentAttributes {
  shellSidePressure?: string;
  tubeSidePressure?: string;
  heatDuty?: string;
  numberOfPasses?: number;
}
```

#### 6. Add Property Panel Support

Update `PropertyPanel.tsx` to show relevant properties for the new type.

#### 7. Test

- Add symbol to canvas
- Connect to other equipment
- Edit properties
- Save and reload
- Test undo/redo

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- validation.test.ts

# Watch mode
npm run test:watch
```

### Writing Tests

```typescript
// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateDiagram, ValidationError } from './validation';
import { createDiagram, createEquipment } from '../types/schema';

describe('validateDiagram', () => {
  describe('duplicate tags', () => {
    it('should detect equipment with duplicate tags', () => {
      const diagram = createDiagram({
        equipment: [
          createEquipment({ tag: 'V-100', category: 'vessel' }),
          createEquipment({ tag: 'V-100', category: 'vessel' }),
        ],
      });
      
      const errors = validateDiagram(diagram);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('duplicate_tag');
      expect(errors[0].tag).toBe('V-100');
    });
    
    it('should allow same tag on different element types', () => {
      // V-100 (vessel) and V-100 (valve) might be allowed in some conventions
      // Test your specific business rules
    });
  });
});
```

---

## Documentation

### Where to Document

| What | Where |
|------|-------|
| Architecture, design decisions | `BLUEPRINT.md` |
| API reference | Inline TSDoc comments |
| Usage examples | `README.md` |
| Contributing process | `CONTRIBUTING.md` |
| Changelog | `CHANGELOG.md` |

### TSDoc Comments

```typescript
/**
 * Creates a new equipment entity with default values.
 * 
 * @param partial - Partial equipment data to override defaults
 * @returns A complete Equipment object with generated ID
 * 
 * @example
 * ```ts
 * const vessel = createEquipment({
 *   category: 'vessel',
 *   tag: 'V-100',
 *   position: { x: 100, y: 200 },
 * });
 * ```
 */
export function createEquipment(
  partial: Partial<Equipment> & { category: EquipmentCategory }
): Equipment {
  // ...
}
```

---

## Questions?

- Open a [Discussion](https://github.com/ORG/smart-pid/discussions) for questions
- Join our [Discord](https://discord.gg/...) (coming soon)
- Check existing issues before opening new ones

Thank you for contributing! 🎉
