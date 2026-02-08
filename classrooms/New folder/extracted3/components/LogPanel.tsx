
import React from 'react';
import { SimLog } from '../types';

interface LogPanelProps {
  logs: SimLog[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  return (
    <div className="h-40 bg-black border-t-2 border-neutral-800 flex flex-col font-mono">
      <div className="bg-neutral-900 px-4 py-1 flex justify-between items-center border-b border-neutral-800">
        <span className="text-[10px] font-bold text-neutral-500">EVENT LOG / NOTIFICATIONS</span>
        <span className="text-[10px] font-bold text-neutral-700">SCADA CONNECTED</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 scroll-smooth">
        {logs.length === 0 ? (
          <div className="text-neutral-700 italic text-center py-4">NO RECENT ACTIVITY</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`flex gap-4 border-b border-neutral-900 py-1 text-[11px] leading-tight ${
              log.type === 'error' ? 'text-red-500' :
              log.type === 'warn' ? 'text-orange-400' :
              log.type === 'success' ? 'text-green-400' : 'text-neutral-400'
            }`}>
              <span className="text-neutral-600 shrink-0">[{log.timestamp}]</span>
              <span className="font-bold shrink-0">{log.type.toUpperCase()}:</span>
              <span className="truncate">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
