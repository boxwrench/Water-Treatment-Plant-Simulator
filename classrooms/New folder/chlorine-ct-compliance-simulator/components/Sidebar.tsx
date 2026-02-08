
import React from 'react';
import { SimulationParams } from '../types';
import { Droplets, Thermometer, FlaskConical, Wind, Activity, Maximize } from 'lucide-react';

interface SidebarProps {
  params: SimulationParams;
  onChange: (newParams: SimulationParams) => void;
}

const SliderItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (val: number) => void;
  colorClass?: string;
}> = ({ label, icon, value, min, max, step, unit, onChange, colorClass = "accent-blue-500" }) => (
  <div className="mb-6 group">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-white mono leading-none">{value.toLocaleString()}</span>
        <span className="text-[10px] text-slate-500 font-bold uppercase">{unit}</span>
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer ${colorClass}`}
    />
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ params, onChange }) => {
  return (
    <aside className="w-80 h-full bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto scrollbar-hide">
      <div className="mb-8 pt-2">
        <h1 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
          <Activity className="text-blue-500" /> CT SIMULATOR
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Giardia 3-Log Compliance 2.0</p>
      </div>

      <div className="mb-8 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
        <span className="text-blue-400 text-[10px] font-black uppercase block mb-1">Peak Flow Rate</span>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white mono">{params.flowRate.toFixed(1)}</span>
          <span className="text-blue-400 font-bold text-sm">MGD</span>
        </div>
      </div>

      <div className="space-y-2">
        <SliderItem
          label="Flow Rate"
          icon={<Wind size={14} />}
          value={params.flowRate}
          min={1}
          max={50}
          step={0.5}
          unit="MGD"
          onChange={(v) => onChange({ ...params, flowRate: v })}
        />

        <SliderItem
          label="Tank Volume"
          icon={<Maximize size={14} />}
          value={params.tankVolume}
          min={10000}
          max={1000000}
          step={10000}
          unit="Gal"
          onChange={(v) => onChange({ ...params, tankVolume: v })}
        />

        <SliderItem
          label="Baffle Factor"
          icon={<Droplets size={14} />}
          value={params.baffleFactor}
          min={0.1}
          max={1.0}
          step={0.1}
          unit="T10/T"
          onChange={(v) => onChange({ ...params, baffleFactor: v })}
        />

        <div className="h-px bg-slate-800 my-8" />

        <SliderItem
          label="Free Chlorine"
          icon={<FlaskConical size={14} />}
          value={params.freeChlorine}
          min={0.2}
          max={4.0}
          step={0.1}
          unit="mg/L"
          onChange={(v) => onChange({ ...params, freeChlorine: v })}
          colorClass="accent-yellow-500"
        />

        <SliderItem
          label="Temperature"
          icon={<Thermometer size={14} />}
          value={params.temperature}
          min={0.5}
          max={25}
          step={0.5}
          unit="°C"
          onChange={(v) => onChange({ ...params, temperature: v })}
          colorClass="accent-cyan-500"
        />

        <SliderItem
          label="Water pH"
          icon={<Activity size={14} />}
          value={params.pH}
          min={6.0}
          max={11.0}
          step={0.1}
          unit="pH"
          onChange={(v) => onChange({ ...params, pH: v })}
          colorClass="accent-purple-500"
        />
      </div>

      <div className="mt-12 p-4 bg-slate-950 rounded-xl border border-slate-800/50">
        <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Compliance Engine</h4>
        <p className="text-slate-400 text-xs leading-relaxed">
          Logic derived from <span className="text-slate-200">EPA Surface Water Treatment Rules</span>. 
          Assumes Giardia 3-log inactivation target for free chlorine disinfection.
        </p>
      </div>
    </aside>
  );
};
