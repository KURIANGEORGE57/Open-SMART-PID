import { create } from 'zustand';
import { ZoomLevel } from '../types/schema';

/**
 * ViewportStore - Manages canvas viewport state and semantic zoom levels
 *
 * Semantic Zoom Levels:
 * - L0 (Eagle View): 0% - 10% zoom - Complex/Plant level blocks
 * - L1 (Outline View): 11% - 40% zoom - Simplified P&ID with main flow
 * - L3 (Detail View): 41% - 100% zoom - Full detailed P&ID
 */

// Zoom thresholds (percentage values)
const ZOOM_THRESHOLDS = {
  L0_MIN: 0,
  L0_MAX: 0.10,
  L1_MIN: 0.11,
  L1_MAX: 0.40,
  L3_MIN: 0.41,
  L3_MAX: 3.0, // Allow up to 300% zoom
} as const;

export interface ViewportState {
  // Viewport position
  x: number;
  y: number;

  // Zoom level (0.01 to 3.0, where 1.0 = 100%)
  zoom: number;

  // Current semantic zoom level
  currentLevel: ZoomLevel;

  // Is transitioning between levels
  isTransitioning: boolean;

  // Grid settings
  gridVisible: boolean;
  gridSize: number; // in pixels
  snapToGrid: boolean;

  // Actions
  setViewport: (x: number, y: number, zoom: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetViewport: () => void;

  // Zoom level management
  getCurrentLevel: (zoom: number) => ZoomLevel;
  setCurrentLevel: (level: ZoomLevel) => void;
  zoomToLevel: (level: ZoomLevel) => void;

  // Grid management
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnapToGrid: () => void;

  // Utility
  snapPositionToGrid: (x: number, y: number) => { x: number; y: number };
}

/**
 * Determines the semantic zoom level based on zoom percentage
 */
function getZoomLevel(zoom: number): ZoomLevel {
  if (zoom <= ZOOM_THRESHOLDS.L0_MAX) {
    return 'L0';
  } else if (zoom <= ZOOM_THRESHOLDS.L1_MAX) {
    return 'L1';
  } else {
    return 'L3';
  }
}

/**
 * Get target zoom value for a given semantic level
 */
function getTargetZoomForLevel(level: ZoomLevel): number {
  switch (level) {
    case 'L0':
      return 0.05; // 5% - middle of L0 range
    case 'L1':
      return 0.25; // 25% - middle of L1 range
    case 'L3':
      return 1.0; // 100% - default detail view
  }
}

export const useViewportStore = create<ViewportState>((set, get) => ({
  // Initial state - start at Detail View (L3)
  x: 0,
  y: 0,
  zoom: 1.0,
  currentLevel: 'L3',
  isTransitioning: false,
  gridVisible: true,
  gridSize: 10, // 10px grid
  snapToGrid: false,

  // Viewport actions
  setViewport: (x, y, zoom) => {
    const newLevel = getZoomLevel(zoom);
    const oldLevel = get().currentLevel;

    set({
      x,
      y,
      zoom,
      currentLevel: newLevel,
      isTransitioning: newLevel !== oldLevel,
    });

    // Clear transition flag after animation duration
    if (newLevel !== oldLevel) {
      setTimeout(() => {
        set({ isTransitioning: false });
      }, 300); // Match transition duration
    }
  },

  setZoom: (zoom) => {
    const clamped = Math.max(
      ZOOM_THRESHOLDS.L0_MIN,
      Math.min(ZOOM_THRESHOLDS.L3_MAX, zoom)
    );
    const { x, y } = get();
    get().setViewport(x, y, clamped);
  },

  setPan: (x, y) => {
    const { zoom } = get();
    get().setViewport(x, y, zoom);
  },

  resetViewport: () => {
    set({
      x: 0,
      y: 0,
      zoom: 1.0,
      currentLevel: 'L3',
      isTransitioning: false,
    });
  },

  // Zoom level management
  getCurrentLevel: (zoom) => getZoomLevel(zoom),

  setCurrentLevel: (level) => {
    const targetZoom = getTargetZoomForLevel(level);
    const { x, y } = get();
    get().setViewport(x, y, targetZoom);
  },

  zoomToLevel: (level) => {
    get().setCurrentLevel(level);
  },

  // Grid management
  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),

  setGridSize: (size) => set({ gridSize: size }),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  // Utility
  snapPositionToGrid: (x, y) => {
    const { gridSize, snapToGrid } = get();

    if (!snapToGrid) {
      return { x, y };
    }

    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  },
}));

// Selectors for performance
export const selectZoom = (state: ViewportState) => state.zoom;
export const selectCurrentLevel = (state: ViewportState) => state.currentLevel;
export const selectIsTransitioning = (state: ViewportState) => state.isTransitioning;
export const selectGridVisible = (state: ViewportState) => state.gridVisible;
export const selectSnapToGrid = (state: ViewportState) => state.snapToGrid;

// Export thresholds for use in other components
export { ZOOM_THRESHOLDS };
