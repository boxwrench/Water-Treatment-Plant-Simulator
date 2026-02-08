
import { SimulationParams, SimulationResult } from '../types';

/**
 * Calculates CT required for Giardia 3-log inactivation.
 * Based on empirical formula approximating EPA Table data:
 * CT = 0.2828 * Logs * (C^0.0658) * 10^(0.0097 * pH) * 10^(0.0293 * (20 - T))
 * Note: This formula provides a continuous approximation of the discrete EPA tables.
 */
export const calculateCompliance = (params: SimulationParams): SimulationResult => {
  const { flowRate, tankVolume, baffleFactor, freeChlorine, temperature, pH } = params;

  // 1. Conversion: MGD to GPM
  // 1,000,000 gallons / 1,440 minutes
  const flowGPM = (flowRate * 1000000) / 1440;

  // 2. T_theoretical (minutes) = Volume (gal) / Flow (gpm)
  const theoreticalT = tankVolume / flowGPM;

  // 3. T10 = T_theoretical * Baffle Factor
  const t10 = theoreticalT * baffleFactor;

  // 4. CT_Actual = Chlorine Residual * T10
  const ctActual = freeChlorine * t10;

  // 5. CT_Required (Giardia 3-log Inactivation)
  // Empirical approximation of EPA 1991 guidance tables
  const logInactivation = 3;
  
  // Correction factors:
  // - Temperature: Required CT doubles for every 10C drop roughly, 
  //   represented by 10^(0.0293 * (20 - T))
  // - pH: CT increases as pH increases.
  // - Concentration: CT increases slightly as Free Chlorine increases.
  
  const ctRequired = 0.2828 * 
    logInactivation * 
    Math.pow(freeChlorine, 0.0658) * 
    Math.pow(10, 0.0097 * pH) * 
    Math.pow(10, 0.0293 * (20 - temperature));

  const ratio = ctActual / ctRequired;
  const isCompliant = ratio >= 1.0;

  return {
    theoreticalT,
    t10,
    ctActual,
    ctRequired,
    ratio,
    isCompliant
  };
};
