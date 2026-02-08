import React, { useState } from 'react';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ControlPanel } from './components/ControlPanel';
import { BrushType, SimulationConfig } from './types';
import { DEFAULT_CONFIG } from './constants';

const App: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [isAutoFlow, setIsAutoFlow] = useState(false);
  const [brushType, setBrushType] = useState<BrushType>(BrushType.WATER);
  const [brushSize, setBrushSize] = useState(5);
  const [flowSpeed, setFlowSpeed] = useState(DEFAULT_CONFIG.flowSpeed);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [stats, setStats] = useState({ cells: 0, fps: 0 });

  // Merge default config with dynamic state
  const config: SimulationConfig = {
    ...DEFAULT_CONFIG,
    flowSpeed: flowSpeed
  };

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
  };

  return (
    // Use dvh for mobile browser bar compatibility
    <div className="flex flex-col md:flex-row h-[100dvh] w-screen bg-slate-950 overflow-hidden font-sans">
      
      {/* Simulation Area - Flex 1 to take available space */}
      <div className="flex-1 relative h-full flex items-center justify-center bg-black/20 p-2 md:p-8 overflow-hidden">
         {/* Container limited by height to ensure it fits with controls on mobile */}
         <div className="w-full h-full max-w-5xl shadow-2xl rounded-xl overflow-hidden ring-1 ring-slate-800 bg-slate-950">
            <SimulationCanvas 
                isRunning={isRunning}
                isAutoFlow={isAutoFlow}
                brushType={brushType}
                brushSize={brushSize}
                config={config}
                onStatsUpdate={setStats}
                resetTrigger={resetTrigger}
            />
         </div>
      </div>

      {/* Sidebar Controls - Fixed height on mobile, full height on desktop */}
      <div className="h-auto shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-20 md:h-full md:shadow-2xl">
        <ControlPanel 
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            isAutoFlow={isAutoFlow}
            setIsAutoFlow={setIsAutoFlow}
            brushType={brushType}
            setBrushType={setBrushType}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            flowSpeed={flowSpeed}
            setFlowSpeed={setFlowSpeed}
            onReset={handleReset}
            stats={stats}
        />
      </div>
    </div>
  );
};

export default App;