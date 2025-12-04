#!/bin/bash

# Fix schema.ts factory functions - move ...partial to the beginning

# Create backup
cp src/types/schema.ts src/types/schema.ts.bak

# Fix createEquipment
sed -i '354,363s/.*//' src/types/schema.ts
sed -i '354i\  return {\
    ...partial,\
    id: partial.id || crypto.randomUUID(),\
    type: '\''equipment'\'',\
    category: partial.category,\
    position: partial.position || { x: 0, y: 0 },\
    dimensions: partial.dimensions || { width: 80, height: 120 },\
    nozzles: partial.nozzles || [],\
    attributes: partial.attributes || {},\
  };' src/types/schema.ts

echo "TypeScript error fixes applied"
