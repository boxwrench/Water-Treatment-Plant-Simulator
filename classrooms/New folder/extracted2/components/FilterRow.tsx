
import React from 'react';
import { Filter, FilterStatus } from '../types';

interface FilterRowProps {
  filter: Filter;
  onToggle: () => void;
}

const FilterRow: React.FC<FilterRowProps> = ({ filter, onToggle }) => {
  const getStatusColor = () => {
    switch (filter.status) {
      case FilterStatus.ONLINE: return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
      case FilterStatus.BACKWASHING: return 'status-flash';
      case FilterStatus.OFFLINE_QUEUED:
      case FilterStatus.OFFLINE_MANUAL: return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const isYellowHL = filter.headloss > 9.0;
  const isYellowTurb = filter.turbidity > 0.08;
  const isYellowTime = filter.runtime > 65;

  return (
    <div className="grid grid-cols-6 items-center py-3 border-b border-[#333] hover:bg-white/5 transition-colors group">
      {/* Status Box */}
      <div className="flex items-center gap-3 pl-4">
        <div className={`w-8 h-8 flex-shrink-0 border border-black/20 ${getStatusColor()}`}></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-300">FILTER {filter.id.toString().padStart(2, '0')}</span>
          <span className={`text-[8px] font-bold uppercase ${filter.status === FilterStatus.ONLINE ? 'text-green-500' : 'text-red-500'}`}>
            {filter.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Flow */}
      <div className="text-right font-bold text-lg">
        {filter.flow.toFixed(1)}
      </div>

      {/* Headloss */}
      <div className={`text-right font-bold ${isYellowHL ? 'text-yellow-500' : 'text-blue-300'}`}>
        {filter.headloss.toFixed(2)}
        <span className="text-[10px] ml-1 text-gray-500 font-normal">FT</span>
      </div>

      {/* Turbidity */}
      <div className={`text-right font-bold ${isYellowTurb ? 'text-yellow-500' : 'text-cyan-400'}`}>
        {filter.turbidity.toFixed(3)}
        <span className="text-[10px] ml-1 text-gray-500 font-normal">NTU</span>
      </div>

      {/* Runtime */}
      <div className={`text-right font-bold ${isYellowTime ? 'text-yellow-500' : 'text-gray-300'}`}>
        {filter.runtime.toFixed(1)}
        <span className="text-[10px] ml-1 text-gray-500 font-normal">HRS</span>
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        <button 
          onClick={onToggle}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#333] border border-[#555] px-2 py-1 text-[8px] font-bold uppercase hover:bg-[#444] active:bg-blue-600"
        >
          Toggle PMP
        </button>
      </div>
    </div>
  );
};

export default FilterRow;
