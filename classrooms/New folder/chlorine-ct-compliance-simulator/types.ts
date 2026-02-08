
export interface SimulationParams {
  flowRate: number;      // MGD
  tankVolume: number;    // Gallons
  baffleFactor: number;  // 0.1 to 1.0
  freeChlorine: number;  // mg/L
  temperature: number;   // °C
  pH: number;            // 6.0 to 11.0
}

export interface SimulationResult {
  theoreticalT: number;  // minutes
  t10: number;           // minutes
  ctActual: number;      // mg/L-min
  ctRequired: number;    // mg/L-min
  ratio: number;         // ctActual / ctRequired
  isCompliant: boolean;
}
