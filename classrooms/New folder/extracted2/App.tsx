
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Filter, FilterStatus, LogEntry, PlantStats } from './types';
import FilterRow from './components/FilterRow';
import Dashboard from './components/Dashboard';
import LogPanel from './components/LogPanel';

const TOTAL_FILTERS = 10;
const TARGET_PLANT_FLOW = 100; // MGD
const MAX_HYDRAULIC_CAPACITY = 20; // MGD per filter
const BACKWASH_DURATION = 0.5; // Hours
const HEADLOSS_LIMIT = 10.0;
const TURBIDITY_LIMIT = 0.10;
const RUNTIME_LIMIT = 72.0;

const App: React.FC = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [simTime, setSimTime] = useState(0); // Simulated hours
  const [timeScale, setTimeScale] = useState(1); // 1x to 1000x
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [backwashQueue, setBackwashQueue] = useState<number[]>([]);
  const [currentBackwashId, setCurrentBackwashId] = useState<number | null>(null);
  const [backwashTimer, setBackwashTimer] = useState(0);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const requestRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  // Initialize filters with staggered runtimes
  useEffect(() => {
    const initialFilters: Filter[] = Array.from({ length: TOTAL_FILTERS }, (_, i) => ({
      id: i + 1,
      status: FilterStatus.ONLINE,
      flow: TARGET_PLANT_FLOW / TOTAL_FILTERS,
      headloss: 1.0,
      turbidity: 0.02,
      runtime: i * 6.0, // 6-hour stagger
      isBreakingThrough: false,
      breakthroughTime: 0
    }));
    setFilters(initialFilters);
  }, []);

  const addLog = useCallback((message: string, type: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO', t: number) => {
    const timestamp = t.toFixed(2);
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      simTime: t,
      message: `[T=${timestamp}] ${message}`,
      type
    }, ...prev].slice(0, 50));
  }, []);

  const updateModel = useCallback((dt: number) => {
    if (failureMessage || isPaused) return;

    setSimTime(prevTime => {
      const nextTime = prevTime + dt;
      
      setFilters(prevFilters => {
        const onlineFilters = prevFilters.filter(f => f.status === FilterStatus.ONLINE);
        const onlineCount = onlineFilters.length;
        
        if (onlineCount === 0) {
           setFailureMessage("CRITICAL FAILURE: TOTAL PLANT SHUTDOWN");
           return prevFilters;
        }

        const flowPerFilter = TARGET_PLANT_FLOW / onlineCount;

        // Hydraulic Overload Check
        if (flowPerFilter > MAX_HYDRAULIC_CAPACITY) {
          setFailureMessage(`CRITICAL FAILURE: HYDRAULIC OVERLOAD (${flowPerFilter.toFixed(1)} MGD/filter)`);
          return prevFilters;
        }

        const newFilters = prevFilters.map(f => {
          if (f.status !== FilterStatus.ONLINE) {
            return { ...f, flow: 0 };
          }

          // 1. Update Runtime
          const newRuntime = f.runtime + dt;

          // 2. Update Headloss
          // Rate = 0.125 ft/hr at 10 MGD. Formula: Rate = 0.125 * (Current_Filter_Flow / 10)
          const headlossRate = 0.125 * (flowPerFilter / 10);
          const newHeadloss = f.headloss + (headlossRate * dt);

          // 3. Update Turbidity
          let newTurbidity = f.turbidity;
          let isBreakingThrough = f.isBreakingThrough;
          let breakthroughTime = f.breakthroughTime;

          if (!isBreakingThrough && flowPerFilter > 15 && newRuntime > 40) {
            isBreakingThrough = true;
            addLog(`Filter ${f.id} Breakthrough Started (High Flow + Age)`, 'WARNING', nextTime);
          }

          if (isBreakingThrough) {
            breakthroughTime += dt;
            // Exponential rise to 0.15 NTU over 0.5 hours
            // Using a simple lerp logic for the sim
            const progress = Math.min(breakthroughTime / 0.5, 1);
            newTurbidity = 0.02 + (Math.pow(progress, 2) * 0.13); 
          }

          return {
            ...f,
            flow: flowPerFilter,
            runtime: newRuntime,
            headloss: newHeadloss,
            turbidity: newTurbidity,
            isBreakingThrough,
            breakthroughTime
          };
        });

        // Check for Failures/Queueing
        const filtersToQueue: number[] = [];
        const processedFilters = newFilters.map(f => {
          if (f.status === FilterStatus.ONLINE) {
            let failed = false;
            let reason = '';

            if (f.headloss >= HEADLOSS_LIMIT) { failed = true; reason = 'Headloss Limit'; }
            else if (f.turbidity >= TURBIDITY_LIMIT) { failed = true; reason = 'Turbidity Limit'; }
            else if (f.runtime >= RUNTIME_LIMIT) { failed = true; reason = 'Runtime Limit'; }

            if (failed) {
              filtersToQueue.push(f.id);
              addLog(`Filter ${f.id} OFFLINE (${reason})`, 'WARNING', nextTime);
              return { ...f, status: FilterStatus.OFFLINE_QUEUED, flow: 0 };
            }
          }
          return f;
        });

        if (filtersToQueue.length > 0) {
          setBackwashQueue(prev => [...prev, ...filtersToQueue]);
        }

        return processedFilters;
      });

      // Handle Backwashing State Machine
      setBackwashTimer(prevTimer => {
        let currentId = currentBackwashId;
        let queue = [...backwashQueue];
        let timer = prevTimer;

        // If nothing is washing and queue has items
        if (currentId === null && queue.length > 0) {
          currentId = queue.shift() || null;
          timer = BACKWASH_DURATION;
          setCurrentBackwashId(currentId);
          setBackwashQueue(queue);
          
          if (currentId !== null) {
            addLog(`Filter ${currentId} started BACKWASH`, 'INFO', nextTime);
            setFilters(prev => prev.map(f => f.id === currentId ? { ...f, status: FilterStatus.BACKWASHING, flow: 0 } : f));
          }
        }

        // Progress current wash
        if (currentId !== null) {
          timer -= dt;
          if (timer <= 0) {
            // Wash complete
            addLog(`Filter ${currentId} BACKWASH COMPLETE`, 'INFO', nextTime);
            setFilters(prev => prev.map(f => f.id === currentId ? {
              ...f,
              status: FilterStatus.ONLINE,
              headloss: 1.0,
              turbidity: 0.02,
              runtime: 0,
              isBreakingThrough: false,
              breakthroughTime: 0
            } : f));
            setCurrentBackwashId(null);
            return 0;
          }
        }

        return timer;
      });

      return nextTime;
    });
  }, [currentBackwashId, backwashQueue, failureMessage, isPaused, addLog]);

  const animate = useCallback((time: number) => {
    if (lastUpdateRef.current !== undefined) {
      const deltaTimeMs = time - lastUpdateRef.current;
      // Convert real ms to simulated hours
      // 1 real second = 1 sim hour at 3600x, but prompt implies a slider.
      // Let's say at 1x, 1 real second = 0.01 sim hours (stretching time for visibility)
      const simDelta = (deltaTimeMs / 1000) * (timeScale / 100); 
      updateModel(simDelta);
    }
    lastUpdateRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [timeScale, updateModel]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const handleToggleManual = (id: number) => {
    setFilters(prev => prev.map(f => {
      if (f.id === id) {
        const newStatus = f.status === FilterStatus.OFFLINE_MANUAL ? FilterStatus.ONLINE : FilterStatus.OFFLINE_MANUAL;
        addLog(`Filter ${id} toggled ${newStatus}`, 'INFO', simTime);
        return { ...f, status: newStatus };
      }
      return f;
    }));
  };

  const restartSim = () => {
    setSimTime(0);
    setFailureMessage(null);
    setLogs([]);
    setBackwashQueue([]);
    setCurrentBackwashId(null);
    setBackwashTimer(0);
    const initialFilters: Filter[] = Array.from({ length: TOTAL_FILTERS }, (_, i) => ({
      id: i + 1,
      status: FilterStatus.ONLINE,
      flow: TARGET_PLANT_FLOW / TOTAL_FILTERS,
      headloss: 1.0,
      turbidity: 0.02,
      runtime: i * 6.0,
      isBreakingThrough: false,
      breakthroughTime: 0
    }));
    setFilters(initialFilters);
  };

  const plantStats: PlantStats = {
    targetFlow: TARGET_PLANT_FLOW,
    actualFlow: filters.reduce((acc, f) => acc + (f.status === FilterStatus.ONLINE ? f.flow : 0), 0),
    avgTurbidity: filters.filter(f => f.status === FilterStatus.ONLINE).length > 0 
      ? filters.filter(f => f.status === FilterStatus.ONLINE).reduce((acc, f) => acc + f.turbidity, 0) / filters.filter(f => f.status === FilterStatus.ONLINE).length
      : 0,
    activeCount: filters.filter(f => f.status === FilterStatus.ONLINE).length,
    backwashQueueSize: backwashQueue.length,
    currentBackwashingId: currentBackwashId,
    failureMessage
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      {/* Header / Dashboard */}
      <Dashboard stats={plantStats} simTime={simTime} onRestart={restartSim} />

      {/* Main Simulation Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <div className="lg:col-span-3 scada-border bg-[#222] p-4 flex flex-col min-h-0 overflow-auto">
          <div className="grid grid-cols-6 border-b border-[#444] pb-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <div className="pl-4">Status</div>
            <div className="text-right">Flow (MGD)</div>
            <div className="text-right">Headloss (ft)</div>
            <div className="text-right">Turbidity (NTU)</div>
            <div className="text-right">Runtime (hrs)</div>
            <div className="text-center">Control</div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {filters.map(filter => (
              <FilterRow 
                key={filter.id} 
                filter={filter} 
                onToggle={() => handleToggleManual(filter.id)} 
              />
            ))}
          </div>
        </div>

        {/* Sidebar Controls & Log */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="scada-border bg-[#222] p-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Simulation Control</h3>
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400">Time Compression: {timeScale}x</label>
              <input 
                type="range" 
                min="1" 
                max="1000" 
                value={timeScale} 
                onChange={(e) => setTimeScale(parseInt(e.target.value))}
                className="w-full h-1 bg-[#444] rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`w-full py-1 text-xs font-bold uppercase border transition-colors ${isPaused ? 'border-green-500 text-green-500 hover:bg-green-500/10' : 'border-yellow-500 text-yellow-500 hover:bg-yellow-500/10'}`}
              >
                {isPaused ? 'Resume Simulation' : 'Pause Simulation'}
              </button>
            </div>
          </div>

          <LogPanel logs={logs} />
        </div>
      </div>

      {/* Failure Overlay */}
      {failureMessage && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="scada-border bg-[#1a1a1a] p-12 text-center max-w-xl border-red-600 border-2">
            <h1 className="text-4xl font-bold text-red-600 mb-4 animate-pulse">SYSTEM HALTED</h1>
            <p className="text-xl text-gray-300 mb-8">{failureMessage}</p>
            <button 
              onClick={restartSim}
              className="px-8 py-3 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors uppercase"
            >
              Reset Plant Environment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
