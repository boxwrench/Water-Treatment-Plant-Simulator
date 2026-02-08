
import React from 'react';
import { PlantStats } from '../types';

interface DashboardProps {
  stats: PlantStats;
  simTime: number;
  onRestart: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, simTime, onRestart }) => {
  return (
    <div className="scada-border bg-[#222] p-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
      <div className="col-span-1">
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Plant Runtime</div>
        <div className="text-2xl font-bold text-blue-400">{simTime.toFixed(2)} hrs</div>
      </div>
      
      <div>
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Plant Flow</div>
        <div className="text-2xl font-bold">
          <span className={stats.actualFlow > stats.targetFlow ? 'text-red-500' : 'text-green-500'}>
            {stats.actualFlow.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 ml-1">/ {stats.targetFlow} MGD</span>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Avg Turbidity</div>
        <div className="text-2xl font-bold">
          <span className={stats.avgTurbidity > 0.08 ? 'text-yellow-500' : 'text-green-400'}>
            {stats.avgTurbidity.toFixed(3)}
          </span>
          <span className="text-sm text-gray-500 ml-1">NTU</span>
        </div>
      </div>

      <div>
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Backwash Status</div>
        <div className="text-sm font-bold">
          {stats.currentBackwashingId ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-red-400">WASHING F#{stats.currentBackwashingId}</span>
            </div>
          ) : (
            <span className="text-green-500">SYSTEM IDLE</span>
          )}
          <div className="text-[10px] text-gray-400 mt-0.5">QUEUE: {stats.backwashQueueSize} FILTERS</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={onRestart}
          className="px-4 py-2 bg-[#333] border border-[#444] text-xs font-bold hover:bg-[#444] transition-colors uppercase tracking-widest"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
