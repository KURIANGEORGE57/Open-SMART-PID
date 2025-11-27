/**
 * Export utilities for P&ID diagrams
 *
 * Supports exporting diagrams to:
 * - SVG (vector format)
 * - PNG (raster format)
 * - DEXPI XML (future)
 */

import { PIDDiagram } from '../types/schema';

/**
 * Export the React Flow canvas to SVG
 * @param filename - Name of the file to download
 */
export async function exportToSVG(filename: string = 'diagram.svg'): Promise<void> {
  try {
    // Get the React Flow viewport element
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) {
      throw new Error('React Flow viewport not found');
    }

    // Clone the viewport to avoid modifying the original
    const clone = viewport.cloneNode(true) as SVGElement;

    // Get the bounding box of all elements
    const bbox = (viewport as SVGGraphicsElement).getBBox();

    // Create SVG wrapper
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `${bbox.x - 20} ${bbox.y - 20} ${bbox.width + 40} ${bbox.height + 40}`);
    svg.setAttribute('width', String(bbox.width + 40));
    svg.setAttribute('height', String(bbox.height + 40));

    // Add white background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', String(bbox.x - 20));
    background.setAttribute('y', String(bbox.y - 20));
    background.setAttribute('width', String(bbox.width + 40));
    background.setAttribute('height', String(bbox.height + 40));
    background.setAttribute('fill', 'white');
    svg.appendChild(background);

    // Append the cloned viewport content
    svg.appendChild(clone);

    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // Add XML declaration and styling
    const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>
${svgString}`;

    // Download the file
    const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Failed to export SVG:', error);
    throw error;
  }
}

/**
 * Export the React Flow canvas to PNG
 * @param filename - Name of the file to download
 * @param scale - Scale factor for higher resolution (default: 2)
 */
export async function exportToPNG(filename: string = 'diagram.png', scale: number = 2): Promise<void> {
  try {
    // Get the React Flow viewport element
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) {
      throw new Error('React Flow viewport not found');
    }

    // Get the bounding box
    const bbox = (viewport as SVGGraphicsElement).getBBox();
    const width = bbox.width + 40;
    const height = bbox.height + 40;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Scale the context for higher resolution
    ctx.scale(scale, scale);

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Convert SVG to data URL
    const svgString = await getSVGString();
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, -bbox.x + 20, -bbox.y + 20);
        resolve();
      };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    });

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, filename);
      } else {
        throw new Error('Failed to create blob from canvas');
      }
    }, 'image/png');
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw error;
  }
}

/**
 * Get the SVG content as a string
 */
async function getSVGString(): Promise<string> {
  const viewport = document.querySelector('.react-flow__viewport');
  if (!viewport) {
    throw new Error('React Flow viewport not found');
  }

  const clone = viewport.cloneNode(true) as SVGElement;
  const bbox = (viewport as SVGGraphicsElement).getBBox();

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', `${bbox.x - 20} ${bbox.y - 20} ${bbox.width + 40} ${bbox.height + 40}`);
  svg.setAttribute('width', String(bbox.width + 40));
  svg.setAttribute('height', String(bbox.height + 40));

  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  background.setAttribute('x', String(bbox.x - 20));
  background.setAttribute('y', String(bbox.y - 20));
  background.setAttribute('width', String(bbox.width + 40));
  background.setAttribute('height', String(bbox.height + 40));
  background.setAttribute('fill', 'white');
  svg.appendChild(background);

  svg.appendChild(clone);

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
}

/**
 * Helper function to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export diagram to DEXPI XML format (placeholder for future implementation)
 * @param diagram - The P&ID diagram to export
 * @param filename - Name of the file to download
 */
export function exportToDEXPI(diagram: PIDDiagram, filename: string = 'diagram.xml'): void {
  // TODO: Implement DEXPI XML export
  // This requires mapping our schema to DEXPI/ISO 15926 format
  console.warn('DEXPI export not yet implemented');

  // Placeholder XML structure
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PlantModel xmlns="http://www.dexpi.org/schema">
  <Equipment>
    <!-- Equipment elements would go here -->
  </Equipment>
  <PipingNetworkSystem>
    <!-- Piping network would go here -->
  </PipingNetworkSystem>
</PlantModel>`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  downloadBlob(blob, filename);
}
