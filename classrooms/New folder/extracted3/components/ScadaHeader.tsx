
import React from 'react';

interface HeaderProps {
  simTime: string;
  onlineCount: number;
  isWashing: boolean;
  activeBackwashId: number | null;
  speed: number;
  onSetSpeed: (speed: number) => void;
}

export const ScadaHeader: React.FC<HeaderProps> = ({ 
  simTime, 
  onlineCount, 
  isWashing, 
  activeBackwashId, 
  speed, 
  onSetSpeed 
}) => {
  return (
    <div className="bg-neutral-900 border-b border-neutral-800 p-4 grid grid-cols-4 items-center shadow-lg">
      <div className="flex flex-col">
        <span className="text-neutral-500 text-xs">SIMULATION CLOCK</span>
        <span className="text-3xl font-bold text-blue-400 leading-none">{simTime}</span>
      </div>

      <div className="flex flex-col border-l border-neutral-800 pl-4">
        <span className="text-neutral-500 text-xs">ONLINE FILTERS</span>
        <span className={`text-3xl font-bold leading-none ${onlineCount < 6 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
          {onlineCount} / 10
        </span>
      </div>

      <div className="flex flex-col border-l border-neutral-800 pl-4">
        <span className="text-neutral-500 text-xs">BACKWASH SYSTEM</span>
        <div className="flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${isWashing ? 'bg-red-500 animate-ping' : 'bg-neutral-700'}`}></div>
           <span className={`text-xl font-bold leading-none ${isWashing ? 'text-red-400' : 'text-neutral-500'}`}>
             {isWashing ? `WASHING ID: ${activeBackwashId}` : 'IDLE'}
           </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-neutral-500 text-xs">SIM SPEED</span>
        <div className="flex gap-1">
          {[0, 1, 5, 20].map(s => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-3 py-1 text-xs font-bold transition-all border ${
                speed === s 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              {s}X
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
