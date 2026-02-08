
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Visualizer } from './components/Visualizer';
import { calculateCompliance } from './services/calcService';
import { SimulationParams } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    flowRate: 5.0,
    tankVolume: 250000,
    baffleFactor: 0.5,
    freeChlorine: 1.0,
    temperature: 15.0,
    pH: 7.5,
  });

  const result = useMemo(() => calculateCompliance(params), [params]);

  const isExtremeConditions = params.temperature <= 1 || params.pH >= 10;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar params={params} onChange={setParams} />

      <main className="flex-1 flex flex-col p-8 overflow-hidden">
        {/* Header Warning */}
        {isExtremeConditions && (
          <div className="mb-4 bg-rose-500/20 border border-rose-500/50 p-3 rounded-xl flex items-center gap-3 animate-pulse">
            <AlertCircle className="text-rose-500" />
            <span className="text-rose-200 text-xs font-bold uppercase tracking-wider">
              Extreme Conditions Warning: High pH or Low Temp significantly increases required CT.
            </span>
          </div>
        )}

        {/* Dashboard Top Area */}
        <section className="mb-8 shrink-0">
          <Dashboard result={result} />
        </section>

        {/* 3D Simulation Space */}
        <section className="flex-1 min-h-0">
          <Visualizer params={params} result={result} />
        </section>

        {/* Footer/Meta Info */}
        <footer className="mt-6 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest shrink-0">
          <div className="flex gap-6">
            <span>Model: EPA-GIARDIA-3L-1991</span>
            <span>Calc Mode: Empirical Lookup Approximation</span>
          </div>
          <div>
            TRACER STUDY 2.0 SIMULATOR
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
