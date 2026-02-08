
import React from 'react';
import { SimulationResult } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

interface DashboardProps {
  result: SimulationResult;
}

const MetricCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down';
  colorClass?: string;
}> = ({ label, value, subValue, colorClass = "text-white" }) => (
  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
    <div className={`text-2xl font-black mono ${colorClass}`}>{value}</div>
    {subValue && <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{subValue}</div>}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ result }) => {
  const complianceColor = result.isCompliant ? 'text-emerald-400' : 'text-rose-400';
  const ratioColor = result.ratio > 1.2 ? 'text-emerald-400' : result.ratio >= 1.0 ? 'text-yellow-400' : 'text-rose-400';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <div className={`col-span-1 lg:col-span-1 flex flex-col justify-center bg-slate-800/60 border-2 ${result.isCompliant ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'} rounded-xl p-6`}>
        <div className="flex items-center gap-3 mb-2">
          {result.isCompliant ? (
            <CheckCircle2 className="text-emerald-400" size={32} />
          ) : (
            <XCircle className="text-rose-400" size={32} />
          )}
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Status</span>
            <span className={`text-2xl font-black ${complianceColor} uppercase`}>
              {result.isCompliant ? 'Compliant' : 'Failing'}
            </span>
          </div>
        </div>
        {!result.isCompliant && (
          <div className="mt-2 flex items-start gap-2 text-rose-300 text-[10px] font-bold uppercase leading-tight">
            <AlertTriangle size={12} className="shrink-0" />
            <span>Increase Chlorine or Volume to achieve target CT.</span>
          </div>
        )}
      </div>

      <MetricCard 
        label="CT Ratio (Actual/Required)"
        value={result.ratio.toFixed(2)}
        subValue={result.isCompliant ? "Safe Operating Margin" : "Critically Below Limit"}
        colorClass={ratioColor}
      />

      <MetricCard 
        label="Actual CT"
        value={result.ctActual.toFixed(1)}
        subValue="mg/L-min"
      />

      <MetricCard 
        label="Required CT (EPA)"
        value={result.ctRequired.toFixed(1)}
        subValue="mg/L-min"
      />

      <div className="col-span-full grid grid-cols-2 lg:grid-cols-3 gap-4 border-t border-slate-800 pt-4">
        <div className="bg-slate-800/20 p-3 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Info className="text-blue-400" size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Theor. Residence Time</span>
            <span className="text-sm font-bold text-slate-200 mono">{result.theoreticalT.toFixed(1)} <span className="text-[10px] text-slate-500">min</span></span>
          </div>
        </div>
        <div className="bg-slate-800/20 p-3 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Info className="text-purple-400" size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">T10 (Effective Time)</span>
            <span className="text-sm font-bold text-slate-200 mono">{result.t10.toFixed(1)} <span className="text-[10px] text-slate-500">min</span></span>
          </div>
        </div>
        <div className="bg-slate-800/20 p-3 rounded-lg flex items-center gap-3 hidden lg:flex">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Info className="text-cyan-400" size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Log Target</span>
            <span className="text-sm font-bold text-slate-200 mono">3.00 <span className="text-[10px] text-slate-500">Log Giardia</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
