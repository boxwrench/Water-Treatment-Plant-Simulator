
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Filter, FilterState, SimState, CONSTANTS, SimLog } from './types';
import { ScadaHeader } from './components/ScadaHeader';
import { FilterRow } from './components/FilterRow';
import { LogPanel } from './components/LogPanel';

const App: React.FC = () => {
  // --- Initialization ---
  const initialFilters: Filter[] = Array.from({ length: CONSTANTS.TOTAL_FILTERS }, (_, i) => ({
    id: i + 1,
    state: FilterState.ONLINE,
    runtimeHrs: i * CONSTANTS.INITIAL_STAGGER_HRS,
    headlossFt: 1.0 + (i * 0.5), // Slight variation for better visual
    turbidityNtu: 0.02,
    flowMgd: 10,
    backwashProgress: 0,
    isBreakthrough: false,
  }));

  const [state, setState] = useState<SimState>({
    filters: initialFilters,
    simTimeHrs: 0,
    speed: 1,
    isPaused: false,
    backwashQueue: [],
    activeBackwashId: null,
    logs: [{ timestamp: '00:00', message: 'System Initialized. Flow Target: 100 MGD', type: 'info' }],
    isFailed: false,
    failureReason: '',
  });

  const stateRef = useRef<SimState>(state);
  stateRef.current = state;

  const lastTimeRef = useRef<number>(0);

  // --- Helpers ---
  const formatTime = (totalHrs: number) => {
    const hrs = Math.floor(totalHrs) % 24;
    const mins = Math.floor((totalHrs * 60) % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const addLog = useCallback((message: string, type: SimLog['type'] = 'info') => {
    setState(prev => ({
      ...prev,
      logs: [{ timestamp: formatTime(prev.simTimeHrs), message, type }, ...prev.logs].slice(0, 100)
    }));
  }, []);

  const toggleFilter = (id: number) => {
    setState(prev => {
      const filters = prev.filters.map(f => {
        if (f.id === id) {
          if (f.state === FilterState.ONLINE) {
            addLog(`Filter ${id} manually taken OFFLINE`, 'warn');
            return { ...f, state: FilterState.OFFLINE_MANUAL, flowMgd: 0 };
          } else if (f.state === FilterState.OFFLINE_MANUAL) {
            addLog(`Filter ${id} manually returned ONLINE`, 'info');
            return { ...f, state: FilterState.ONLINE };
          }
        }
        return f;
      });
      return { ...prev, filters };
    });
  };

  const queueWash = (id: number) => {
    setState(prev => {
      if (prev.backwashQueue.includes(id) || prev.activeBackwashId === id) return prev;
      addLog(`Filter ${id} queued for Backwash`, 'info');
      return {
        ...prev,
        backwashQueue: [...prev.backwashQueue, id]
      };
    });
  };

  const setSpeed = (speed: number) => setState(prev => ({ ...prev, speed, isPaused: speed === 0 }));

  // --- Simulation Loop ---
  const tick = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const realDeltaSec = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;

    const s = stateRef.current;
    if (s.isPaused || s.isFailed) {
      requestAnimationFrame(tick);
      return;
    }

    // 1 real second = 1 sim hour at 1x speed
    const simDeltaHrs = realDeltaSec * s.speed;
    const newSimTime = s.simTimeHrs + simDeltaHrs;

    // 1. Calculate Hydraulic Load
    const onlineFilters = s.filters.filter(f => f.state === FilterState.ONLINE);
    const onlineCount = onlineFilters.length;
    
    if (onlineCount === 0 || (CONSTANTS.TOTAL_FLOW_TARGET / onlineCount) > CONSTANTS.MAX_HYDRAULIC_CAP) {
      setState(prev => ({
        ...prev,
        isFailed: true,
        failureReason: onlineCount === 0 ? 'CRITICAL FAILURE: NO FILTERS ONLINE' : 'CRITICAL FAILURE: HYDRAULIC OVERLOAD (>20 MGD/Filter)'
      }));
      return;
    }

    const flowPerFilter = CONSTANTS.TOTAL_FLOW_TARGET / onlineCount;

    // 2. Manage Backwash State Machine
    let newActiveBackwashId = s.activeBackwashId;
    let newQueue = [...s.backwashQueue];
    let justFinishedId: number | null = null;

    if (newActiveBackwashId !== null) {
      const filter = s.filters.find(f => f.id === newActiveBackwashId)!;
      const progressAdded = simDeltaHrs / CONSTANTS.BACKWASH_DURATION_HRS;
      const newProgress = filter.backwashProgress + progressAdded;

      if (newProgress >= 1) {
        justFinishedId = newActiveBackwashId;
        newActiveBackwashId = null;
      }
    }

    if (newActiveBackwashId === null && newQueue.length > 0) {
      newActiveBackwashId = newQueue.shift()!;
    }

    // 3. Update Individual Filters
    let logBuffer: { msg: string; type: SimLog['type'] }[] = [];

    const newFilters = s.filters.map(f => {
      const isWashing = f.id === newActiveBackwashId;
      const finishedWashing = f.id === justFinishedId;

      if (finishedWashing) {
        logBuffer.push({ msg: `Filter ${f.id} backwash complete. Online.`, type: 'success' });
        return {
          ...f,
          state: FilterState.ONLINE,
          runtimeHrs: 0,
          headlossFt: 1.0,
          turbidityNtu: 0.02,
          backwashProgress: 0,
          isBreakthrough: false
        };
      }

      if (isWashing) {
        return {
          ...f,
          state: FilterState.BACKWASHING,
          backwashProgress: f.backwashProgress + (simDeltaHrs / CONSTANTS.BACKWASH_DURATION_HRS),
          flowMgd: 0
        };
      }

      // Check if filter just entered queue from auto-fail
      const isAutoQueued = s.backwashQueue.includes(f.id) || (newActiveBackwashId === f.id);
      
      if (f.state === FilterState.ONLINE) {
        // Accumulate Stats
        const headlossRate = CONSTANTS.BASE_HEADLOSS_RATE * (flowPerFilter / 10);
        const newHeadloss = f.headlossFt + (headlossRate * simDeltaHrs);
        const newRuntime = f.runtimeHrs + simDeltaHrs;
        let newTurbidity = f.turbidityNtu;
        let isBreakthrough = f.isBreakthrough;

        // Turbidity Physics
        if (flowPerFilter > CONSTANTS.BREAKTHROUGH_THRESHOLD_MGD && newRuntime > CONSTANTS.BREAKTHROUGH_THRESHOLD_HRS) {
          if (!isBreakthrough) {
            isBreakthrough = true;
            logBuffer.push({ msg: `Filter ${f.id} TURBIDITY BREAKTHROUGH detected!`, type: 'error' });
          }
          // Exponential rise to 0.15 over 30 mins
          newTurbidity = Math.min(0.15, newTurbidity + (0.26 * simDeltaHrs));
        }

        // Auto-Fail Conditions
        const hitHeadloss = newHeadloss >= CONSTANTS.LIMIT_HEADLOSS;
        const hitTurbidity = newTurbidity >= CONSTANTS.LIMIT_TURBIDITY;
        const hitRuntime = newRuntime >= CONSTANTS.LIMIT_RUNTIME;

        if (hitHeadloss || hitTurbidity || hitRuntime) {
          const reason = hitHeadloss ? 'HEADLOSS' : hitTurbidity ? 'TURBIDITY' : 'RUNTIME';
          logBuffer.push({ msg: `Filter ${f.id} reached ${reason} limit. AUTO-QUEUING.`, type: 'warn' });
          
          // Move to queued state
          newQueue.push(f.id);
          return {
            ...f,
            state: FilterState.OFFLINE_QUEUED,
            headlossFt: newHeadloss,
            runtimeHrs: newRuntime,
            turbidityNtu: newTurbidity,
            flowMgd: 0,
            isBreakthrough
          };
        }

        return {
          ...f,
          flowMgd: flowPerFilter,
          headlossFt: newHeadloss,
          runtimeHrs: newRuntime,
          turbidityNtu: newTurbidity,
          isBreakthrough
        };
      }

      return { ...f, flowMgd: 0 };
    });

    // Bulk state update
    setState(prev => {
      const finalLogs = [...prev.logs];
      logBuffer.forEach(l => {
        finalLogs.unshift({ timestamp: formatTime(newSimTime), message: l.msg, type: l.type });
      });

      return {
        ...prev,
        simTimeHrs: newSimTime,
        filters: newFilters,
        activeBackwashId: newActiveBackwashId,
        backwashQueue: Array.from(new Set(newQueue)), // Dedupe
        logs: finalLogs.slice(0, 100)
      };
    });

    requestAnimationFrame(tick);
  }, [addLog]);

  useEffect(() => {
    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [tick]);

  const restart = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden text-sm uppercase">
      {/* Simulation Failure Overlay */}
      {state.isFailed && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="p-10 text-center border-4 border-red-600 bg-neutral-900 rounded-xl shadow-2xl">
            <h1 className="text-6xl font-black text-red-600 mb-6 tracking-tighter">DEATH SPIRAL</h1>
            <p className="text-2xl text-white mb-8 max-w-lg mx-auto">{state.failureReason}</p>
            <button 
              onClick={restart}
              className="px-8 py-4 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors border-2 border-red-500 shadow-lg"
            >
              RESET PLANT
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <ScadaHeader 
        simTime={formatTime(state.simTimeHrs)} 
        onlineCount={state.filters.filter(f => f.state === FilterState.ONLINE).length}
        isWashing={state.activeBackwashId !== null}
        activeBackwashId={state.activeBackwashId}
        speed={state.speed}
        onSetSpeed={setSpeed}
      />

      {/* Filter Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-[#1a1a1a]">
        <div className="grid grid-cols-12 gap-4 px-4 py-2 font-bold text-neutral-500 sticky top-0 bg-[#1a1a1a] border-b border-neutral-800 z-10">
          <div className="col-span-1">ID</div>
          <div className="col-span-1">STATUS</div>
          <div className="col-span-2">FLOW (MGD)</div>
          <div className="col-span-3">HEADLOSS (FT)</div>
          <div className="col-span-1 text-right">NTU</div>
          <div className="col-span-1 text-right">HOURS</div>
          <div className="col-span-3 text-center">CONTROLS</div>
        </div>
        
        {state.filters.map(filter => (
          <FilterRow 
            key={filter.id} 
            filter={filter} 
            isQueued={state.backwashQueue.includes(filter.id)}
            onToggle={() => toggleFilter(filter.id)}
            onWash={() => queueWash(filter.id)}
          />
        ))}
      </div>

      {/* Notifications */}
      <LogPanel logs={state.logs} />
    </div>
  );
};

export default App;
