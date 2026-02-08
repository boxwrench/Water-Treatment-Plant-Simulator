
import React from 'react';
import { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  return (
    <div className="flex-1 scada-border bg-[#222] p-4 flex flex-col min-h-0">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-[#444] pb-1">Event Log</h3>
      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {logs.length === 0 && <div className="text-[10px] text-gray-600 italic">No system events...</div>}
        {logs.map(log => (
          <div key={log.id} className="text-[10px] font-mono leading-tight flex gap-2">
            <span className={`flex-shrink-0 ${
              log.type === 'CRITICAL' ? 'text-red-500 font-bold' : 
              log.type === 'WARNING' ? 'text-yellow-500' : 
              'text-blue-400'
            }`}>
              {log.type.padEnd(8, ' ')}
            </span>
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;
