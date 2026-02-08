
import React from 'react';
import { Filter, FilterState, CONSTANTS } from '../types';

interface FilterRowProps {
  filter: Filter;
  isQueued: boolean;
  onToggle: () => void;
  onWash: () => void;
}

export const FilterRow: React.FC<FilterRowProps> = ({ filter, isQueued, onToggle, onWash }) => {
  const getStatusColor = () => {
    switch (filter.state) {
      case FilterState.ONLINE: return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]';
      case FilterState.BACKWASHING: return 'bg-red-400 animate-pulse';
      case FilterState.OFFLINE_MANUAL: return 'bg-red-600 grayscale opacity-50';
      case FilterState.OFFLINE_QUEUED: return 'bg-red-700 shadow-[0_0_15px_rgba(185,28,28,0.5)]';
      default: return 'bg-neutral-700';
    }
  };

  const hlPercent = Math.min(100, (filter.headlossFt / CONSTANTS.LIMIT_HEADLOSS) * 100);
  const isHighHl = filter.headlossFt > 8;
  const isHighTurbidity = filter.turbidityNtu > 0.08;

  return (
    <div className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg border transition-all ${
      filter.state === FilterState.ONLINE ? 'bg-neutral-800/40 border-neutral-800' : 'bg-neutral-900/60 border-neutral-800 grayscale-[0.5]'
    }`}>
      {/* ID & Status */}
      <div className="col-span-1 font-black text-xl text-neutral-600">
        #{filter.id.toString().padStart(2, '0')}
      </div>
      
      <div className="col-span-1 flex justify-center">
        <div className={`w-8 h-8 rounded border-2 border-black/20 ${getStatusColor()}`} title={filter.state}></div>
      </div>

      {/* Flow */}
      <div className="col-span-2">
        <div className="text-xs text-neutral-500 mb-1">EFFLUENT</div>
        <div className={`text-2xl font-bold leading-none ${filter.flowMgd > 15 ? 'text-orange-400' : 'text-blue-400'}`}>
          {filter.flowMgd.toFixed(1)} <span className="text-[10px]">MGD</span>
        </div>
      </div>

      {/* Headloss Progress */}
      <div className="col-span-3">
        <div className="flex justify-between items-end mb-1">
           <span className="text-[10px] text-neutral-500">HEADLOSS</span>
           <span className={`text-sm font-bold ${isHighHl ? 'text-red-500' : 'text-neutral-300'}`}>
             {filter.headlossFt.toFixed(2)} FT
           </span>
        </div>
        <div className="h-3 bg-neutral-900 border border-neutral-700 rounded-full overflow-hidden relative">
          <div 
            className={`h-full transition-all duration-300 rounded-full ${isHighHl ? 'bg-red-600' : 'bg-blue-600'}`}
            style={{ width: `${hlPercent}%` }}
          />
        </div>
      </div>

      {/* Turbidity */}
      <div className="col-span-1 text-right">
        <div className="text-[10px] text-neutral-500 mb-1">TURB</div>
        <div className={`text-lg font-bold leading-none ${isHighTurbidity ? 'text-red-500 animate-pulse' : 'text-neutral-300'}`}>
          {filter.turbidityNtu.toFixed(3)}
        </div>
      </div>

      {/* Runtime */}
      <div className="col-span-1 text-right">
        <div className="text-[10px] text-neutral-500 mb-1">RUNTIME</div>
        <div className={`text-lg font-bold leading-none ${filter.runtimeHrs > 60 ? 'text-orange-500' : 'text-neutral-300'}`}>
          {Math.floor(filter.runtimeHrs)}H
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-3 flex justify-center gap-2">
        <button
          disabled={filter.state === FilterState.BACKWASHING || isQueued || filter.state === FilterState.OFFLINE_QUEUED}
          onClick={onWash}
          className={`flex-1 px-2 py-2 text-[10px] font-black border-2 transition-all ${
            isQueued || filter.state === FilterState.OFFLINE_QUEUED
              ? 'bg-neutral-800 border-orange-500 text-orange-500 cursor-not-allowed'
              : filter.state === FilterState.BACKWASHING
                ? 'bg-red-900 border-red-700 text-red-300 cursor-wait'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          {isQueued || filter.state === FilterState.OFFLINE_QUEUED ? 'QUEUED' : filter.state === FilterState.BACKWASHING ? 'WASHING' : 'WASH'}
        </button>

        <button
          disabled={filter.state === FilterState.BACKWASHING || isQueued}
          onClick={onToggle}
          className={`flex-1 px-2 py-2 text-[10px] font-black border-2 transition-all ${
            filter.state === FilterState.OFFLINE_MANUAL
              ? 'bg-green-900 border-green-700 text-green-300 hover:bg-green-800'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
          }`}
        >
          {filter.state === FilterState.OFFLINE_MANUAL ? 'SET ON' : 'SET OFF'}
        </button>
      </div>
    </div>
  );
};
