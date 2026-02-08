import React from 'react';
import { BrushType } from '../types';

interface ControlPanelProps {
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  isAutoFlow: boolean;
  setIsAutoFlow: (v: boolean) => void;
  brushType: BrushType;
  setBrushType: (t: BrushType) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  flowSpeed: number;
  setFlowSpeed: (s: number) => void;
  onReset: () => void;
  stats: { cells: number; fps: number };
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  setIsRunning,
  isAutoFlow,
  setIsAutoFlow,
  brushType,
  setBrushType,
  brushSize,
  setBrushSize,
  flowSpeed,
  setFlowSpeed,
  onReset,
  stats,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 bg-slate-900 md:border-l border-t md:border-t-0 border-slate-800 w-full md:w-80 h-full overflow-y-auto text-slate-200 shadow-xl z-10">
      
      {/* Header - Hidden on small mobile to save space, or very compact */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            HydroFlow
          </h1>
          <p className="hidden md:block text-xs text-slate-500 mt-1">Grid-Based Fluid Automata</p>
        </div>
        
        {/* Mobile Stats (Compact) */}
        <div className="md:hidden flex gap-3 text-[10px] font-mono text-slate-500">
           <div>FPS: <span className="text-emerald-400">{stats.fps}</span></div>
           <div>C: <span className="text-blue-400">{Math.floor(stats.cells/1000)}k</span></div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`py-2 md:py-3 rounded-md font-semibold transition-all text-sm md:text-base ${
            isRunning 
              ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/50' 
              : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/50'
          }`}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => setIsAutoFlow(!isAutoFlow)}
          className={`py-2 md:py-3 rounded-md font-semibold transition-all text-sm md:text-base ${
            isAutoFlow
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          {isAutoFlow ? 'Auto: ON' : 'Auto: OFF'}
        </button>
      </div>

      {/* Tools Section */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tools</label>
        <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
          {[
            { id: BrushType.WATER, label: 'Water', color: 'bg-blue-600' },
            { id: BrushType.WALL, label: 'Wall', color: 'bg-slate-600' },
            { id: BrushType.ERASER, label: 'Erase', color: 'bg-red-900/50 border-red-500' },
            { id: BrushType.DRAIN, label: 'Drain', color: 'bg-purple-900/50 border-purple-500' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setBrushType(tool.id)}
              className={`px-1 md:px-4 py-2 md:py-3 rounded-md text-xs md:text-sm font-medium transition-all border flex flex-col md:flex-row items-center justify-center gap-2 ${
                brushType === tool.id
                  ? 'border-white ring-1 md:ring-2 ring-blue-500/50 scale-[1.02] shadow-lg bg-slate-800'
                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-400'
              }`}
            >
               <span className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${tool.color} shadow-sm`}></span>
               {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders Container */}
      <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-3">
        {/* Brush Size */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brush Size</label>
              <span className="text-xs text-blue-400 font-mono">{brushSize}px</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-4 md:h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 touch-pan-x"
          />
        </div>

        {/* Flow Speed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Flow Speed</label>
              <span className="text-xs text-cyan-400 font-mono">{Math.round(flowSpeed * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.1"
            value={flowSpeed} 
            onChange={(e) => setFlowSpeed(parseFloat(e.target.value))}
            className="w-full h-4 md:h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 touch-pan-x"
          />
        </div>
      </div>

      {/* Stats & Info - Hidden on very small screens, shown on desktop */}
      <div className="mt-auto space-y-4 pt-4 md:pt-6 border-t border-slate-800 hidden md:block">
         <button
          onClick={onReset}
          className="w-full py-2 rounded-md bg-slate-800 text-slate-400 text-sm hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
        >
          Reset Grid
        </button>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-500 bg-slate-950/50 p-3 rounded border border-slate-800">
           <div>
             <span className="block text-slate-600">FPS</span>
             <span className="text-emerald-400">{stats.fps}</span>
           </div>
           <div>
             <span className="block text-slate-600">Cells</span>
             <span className="text-blue-400">{stats.cells.toLocaleString()}</span>
           </div>
        </div>
      </div>
      
      {/* Mobile Reset Button */}
       <button
          onClick={onReset}
          className="md:hidden w-full py-3 rounded-md bg-slate-800 text-slate-400 text-sm active:bg-slate-700 active:text-white transition-colors border border-slate-700 mt-2"
        >
          Reset Grid
        </button>
    </div>
  );
};