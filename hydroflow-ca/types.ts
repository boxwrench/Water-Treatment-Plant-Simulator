export enum BrushType {
  WATER = 'WATER',
  WALL = 'WALL',
  ERASER = 'ERASER',
  DRAIN = 'DRAIN'
}

export interface SimulationConfig {
  gridWidth: number;
  gridHeight: number;
  gravity: number;
  flowSpeed: number;
  evaporation: number;
}

export interface CellState {
  mass: number;
  isWall: boolean;
}

// Simple color representation for manual pixel manipulation
export interface RGB {
  r: number;
  g: number;
  b: number;
}
