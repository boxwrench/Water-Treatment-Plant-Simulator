import { SimulationConfig } from './types';

export const DEFAULT_CONFIG: SimulationConfig = {
  gridWidth: 200, // Resolution
  gridHeight: 150, // Resolution
  gravity: 0.8, // Downward bias
  flowSpeed: 0.5, // Horizontal spreading speed
  evaporation: 0.000, // Slowly remove water (optional)
};

export const MAX_FPS = 60;
export const BRUSH_SIZES = [1, 3, 5, 9, 15];

// Colors
export const COLOR_WALL = { r: 100, g: 116, b: 139 }; // Slate-500
export const COLOR_BG = { r: 15, g: 23, b: 42 }; // Slate-900
export const COLOR_WATER_DEEP = { r: 29, g: 78, b: 216 }; // Blue-700
export const COLOR_WATER_SHALLOW = { r: 96, g: 165, b: 250 }; // Blue-400
export const COLOR_FOAM = { r: 224, g: 242, b: 254 }; // Sky-100
