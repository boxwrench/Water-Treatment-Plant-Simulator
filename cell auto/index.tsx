import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types ---

type Mode = '1D' | '2D';
type ColorMode = 'Classic' | 'Age' | 'Density' | 'Cycle';

interface Config {
  mode: Mode;
  rule1D: number;
  birth2D: number[];
  survival2D: number[];
  resolution: number;
  speed: number;
  hue: number;
  colorMode: ColorMode;
  trails: number; 
}

// --- Constants & Presets ---

const PRESETS: Record<string, { name: string; mode: Mode; birth?: number[]; survival?: number[]; rule?: number; desc: string }> = {
  GOL: { name: 'Game of Life', mode: '2D', birth: [3], survival: [2, 3], desc: 'Classic Conway. Stable structures appear Magenta in Age mode, while gliders fly in Cyan.' },
  HIGHLIFE: { name: 'HighLife', mode: '2D', birth: [3, 6], survival: [2, 3], desc: 'Life with Replicators. A single small seed can grow into a massive repeating complex.' },
  MAZE: { name: 'Maze Generator', mode: '2D', birth: [3], survival: [1, 2, 3, 4, 5], desc: 'A variation that creates organic, winding labyrinthine structures.' },
  RULE30: { name: 'Rule 30 (Chaos)', mode: '1D', rule: 30, desc: 'Stephen Wolfram’s favorite. Simple local rules producing deep, nested chaos.' },
  RULE110: { name: 'Rule 110 (Logic)', mode: '1D', rule: 110, desc: 'Proven to be Turing Complete. This 1D universe can compute any logic gate.' },
  RULE90: { name: 'Rule 90 (Fractal)', mode: '1D', rule: 90, desc: 'Mathematical Sierpinski perfection. Every cell is a XOR gate of its neighbors.' },
};

// --- Utilities ---

const getRuleBits = (rule: number) => {
  return rule.toString(2).padStart(8, '0').split('').reverse().map(Number);
};

// --- Components ---

const CellularAutomata: React.FC = () => {
  const [config, setConfig] = useState<Config>({
    mode: '2D',
    rule1D: 110,
    birth2D: [3],
    survival2D: [2, 3],
    resolution: 8,
    speed: 15,
    hue: 180, 
    colorMode: 'Age',
    trails: 0.3,
  });

  const [activePreset, setActivePreset] = useState<string | null>('GOL');
  const [isRunning, setIsRunning] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<number[][]>([]); 
  const historyRef = useRef<number[][]>([]); 
  const requestRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const cycleHueRef = useRef<number>(0);

  // Initialize Grid
  const initGrid = (mode: Mode, res: number) => {
    const cols = Math.ceil(window.innerWidth / res);
    const rows = Math.ceil(window.innerHeight / res);
    
    if (mode === '2D') {
      gridRef.current = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => (Math.random() > 0.85 ? 1 : 0))
      );
    } else {
      const firstRow = new Array(cols).fill(0);
      firstRow[Math.floor(cols / 2)] = 1;
      historyRef.current = [firstRow];
    }
    setGeneration(0);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  };

  useEffect(() => {
    initGrid(config.mode, config.resolution);
    const handleResize = () => initGrid(config.mode, config.resolution);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.mode, config.resolution]);

  // Simulation Logic
  const step = () => {
    if (config.mode === '2D') {
      const rows = gridRef.current.length;
      if (rows === 0) return;
      const cols = gridRef.current[0].length;
      
      const nextGrid = gridRef.current.map((row, y) =>
        row.map((age, x) => {
          let neighbors = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (i === 0 && j === 0) continue;
              const ny = (y + i + rows) % rows;
              const nx = (x + j + cols) % cols;
              if (gridRef.current[ny][nx] > 0) neighbors++;
            }
          }

          if (age > 0) {
            return config.survival2D.includes(neighbors) ? Math.min(age + 1, 100) : 0;
          } else {
            return config.birth2D.includes(neighbors) ? 1 : 0;
          }
        })
      );
      gridRef.current = nextGrid;
    } else {
      const bits = getRuleBits(config.rule1D);
      const current = historyRef.current[historyRef.current.length - 1];
      const cols = current.length;
      const next = current.map((_, i) => {
        const left = current[(i - 1 + cols) % cols];
        const center = current[i];
        const right = current[(i + 1) % cols];
        const patternIndex = (left << 2) | (center << 1) | right;
        return bits[patternIndex];
      });
      historyRef.current.push(next);
      const maxRows = Math.ceil(window.innerHeight / config.resolution);
      if (historyRef.current.length > maxRows) historyRef.current.shift();
    }
    setGeneration(g => g + 1);
    cycleHueRef.current = (cycleHueRef.current + 1) % 360;
  };

  const getCellColor = (age: number, neighbors: number = 0) => {
    let h = config.hue;
    let s = 80;
    let l = 60;

    switch (config.colorMode) {
      case 'Age':
        h = (config.hue + age * 8) % 360;
        l = age === 1 ? 85 : Math.max(40, 70 - age);
        break;
      case 'Density':
        h = (config.hue - (neighbors * 25)) % 360;
        l = 40 + (neighbors * 5);
        break;
      case 'Cycle':
        h = cycleHueRef.current;
        break;
      default:
        break;
    }
    return `hsla(${h}, ${s}%, ${l}%, 0.9)`;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = `rgba(0, 0, 0, ${1 - config.trails})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const res = config.resolution;

    if (config.mode === '2D') {
      gridRef.current.forEach((row, y) => {
        row.forEach((age, x) => {
          if (age > 0) {
            let neighbors = 0;
            if (config.colorMode === 'Density') {
              for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const ny = (y + i + gridRef.current.length) % gridRef.current.length;
                const nx = (x + j + row.length) % row.length;
                if (gridRef.current[ny][nx] > 0) neighbors++;
              }
            }
            ctx.fillStyle = getCellColor(age, neighbors);
            ctx.fillRect(x * res, y * res, res - 1, res - 1);
          }
        });
      });
    } else {
      historyRef.current.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            const alpha = y / historyRef.current.length;
            ctx.fillStyle = `hsla(${config.hue + (y * 0.2)}, 80%, 60%, ${alpha})`;
            ctx.fillRect(x * res, y * res, res - 1, res - 1);
          }
        });
      });
    }
  };

  const animate = (time: number) => {
    const threshold = 1000 / (config.speed + 1);
    if (isRunning && time - lastUpdateRef.current > threshold) {
      step();
      lastUpdateRef.current = time;
    }
    draw();
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isRunning, config]);

  const handleCanvasInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || config.mode === '1D') return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = Math.floor((clientX - rect.left) / config.resolution);
    const y = Math.floor((clientY - rect.top) / config.resolution);

    if (gridRef.current[y] && gridRef.current[y][x] !== undefined) {
      const newGrid = [...gridRef.current];
      newGrid[y][x] = newGrid[y][x] > 0 ? 0 : 1; 
      gridRef.current = newGrid;
      setActivePreset(null); // Manual touch breaks preset
    }
  };

  const selectPreset = (key: string) => {
    const p = PRESETS[key];
    const newCfg = { ...config, mode: p.mode };
    if (p.mode === '2D' && p.birth && p.survival) {
      newCfg.birth2D = p.birth;
      newCfg.survival2D = p.survival;
    } else if (p.mode === '1D' && p.rule !== undefined) {
      newCfg.rule1D = p.rule;
    }
    setConfig(newCfg);
    setActivePreset(key);
    initGrid(p.mode, config.resolution);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col select-none bg-black">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleCanvasInteraction}
        onMouseMove={(e) => e.buttons === 1 && handleCanvasInteraction(e)}
        onTouchStart={handleCanvasInteraction}
        onTouchMove={handleCanvasInteraction}
        className="absolute inset-0 z-0 cursor-crosshair"
      />

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl">
        <h1 className="text-lg font-black italic tracking-tighter text-white">EMERGENCE.v2</h1>
        <div className="flex gap-3 text-[9px] font-mono text-white/50 uppercase mt-1">
          <span>Gen: {generation}</span>
          <span>Res: {config.resolution}px</span>
          <span className="text-cyan-400">{activePreset ? PRESETS[activePreset].name : 'CUSTOM'}</span>
        </div>
      </div>

      {/* UI Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 glass border-t border-white/10 transition-transform duration-500 ease-in-out ${showControls ? 'translate-y-0' : 'translate-y-[calc(100%-48px)]'}`}>
        
        {/* Toggle / Playback Bar */}
        <div 
          className="h-12 flex items-center justify-between px-6 cursor-pointer hover:bg-white/5"
          onClick={() => setShowControls(!showControls)}
        >
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">Simulation Parameters</span>
            <div className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsRunning(!isRunning); }}
              className={`px-4 py-1 rounded text-[10px] font-bold transition-all border ${isRunning ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
            >
              {isRunning ? 'FREEZE' : 'EVOLVE'}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); initGrid(config.mode, config.resolution); }}
              className="text-[10px] font-bold opacity-60 hover:opacity-100 uppercase tracking-tighter"
            >
              Reset Seed
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Simulation Column */}
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold opacity-40 block mb-3 uppercase tracking-widest">Logic Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => selectPreset(key)}
                    className={`py-2 px-3 rounded text-[9px] font-bold text-left border transition-all truncate ${activePreset === key ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 opacity-60 hover:opacity-100 hover:bg-white/10'}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Resolution</label>
                <span className="text-[10px] font-mono">{config.resolution}px</span>
              </div>
              <input 
                type="range" min="2" max="32" step="1" 
                value={config.resolution}
                onChange={(e) => {
                    setConfig({ ...config, resolution: parseInt(e.target.value) });
                    // Changing res resets the grid so it's technically a new manual state
                    initGrid(config.mode, parseInt(e.target.value));
                }}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
              
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Speed (Hz)</label>
                <span className="text-[10px] font-mono">{config.speed}</span>
              </div>
              <input 
                type="range" min="1" max="60" step="1" 
                value={config.speed}
                onChange={(e) => setConfig({ ...config, speed: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            <div className="pt-2">
               <label className="text-[10px] font-bold opacity-40 block mb-2 uppercase tracking-widest">Space Dimensions</label>
               <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                {['1D', '2D'].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                        setConfig({ ...config, mode: m as Mode });
                        setActivePreset(null);
                        initGrid(m as Mode, config.resolution);
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${config.mode === m ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}
                  >
                    {m} MODE
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aesthetics Column */}
          <div className="space-y-6 md:border-l border-white/5 md:pl-8">
            <div>
              <label className="text-[10px] font-bold opacity-40 block mb-3 uppercase tracking-widest">Visual Engine</label>
              <div className="grid grid-cols-2 gap-2">
                {['Classic', 'Age', 'Density', 'Cycle'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setConfig({ ...config, colorMode: mode as ColorMode })}
                    className={`py-1.5 px-2 rounded text-[9px] font-bold border transition-all ${config.colorMode === mode ? 'bg-white/15 border-white/30 text-white' : 'border-white/5 text-white/30 hover:text-white/60'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Base Hue</label>
                <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: `hsl(${config.hue}, 80%, 60%)` }}></div>
              </div>
              <input 
                type="range" min="0" max="360" step="1" 
                value={config.hue}
                onChange={(e) => setConfig({ ...config, hue: parseInt(e.target.value) })}
                className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
              />
              
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Persistence (Trails)</label>
                <span className="text-[10px] font-mono">{Math.round(config.trails * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="0.95" step="0.05" 
                value={config.trails}
                onChange={(e) => setConfig({ ...config, trails: parseFloat(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>

            {config.mode === '1D' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Rule (0-255)</label>
                  <span className="text-[10px] font-mono">#{config.rule1D}</span>
                </div>
                <input 
                  type="range" min="0" max="255" step="1" 
                  value={config.rule1D}
                  onChange={(e) => {
                      setConfig({ ...config, rule1D: parseInt(e.target.value) });
                      setActivePreset(null);
                  }}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="flex-1">
                   <label className="text-[10px] font-bold opacity-40 block mb-2 uppercase tracking-widest">Birth (B)</label>
                   <div className="flex flex-wrap gap-1">
                     {[1,2,3,4,5,6,7,8].map(n => (
                       <button key={n} onClick={() => {
                           setConfig({...config, birth2D: config.birth2D.includes(n) ? config.birth2D.filter(x => x !== n) : [...config.birth2D, n]});
                           setActivePreset(null);
                       }}
                         className={`w-5 h-5 text-[9px] rounded flex items-center justify-center font-bold transition-all ${config.birth2D.includes(n) ? 'bg-cyan-500 text-white' : 'bg-white/5 opacity-30 hover:opacity-60'}`}>{n}</button>
                     ))}
                   </div>
                </div>
                <div className="flex-1">
                   <label className="text-[10px] font-bold opacity-40 block mb-2 uppercase tracking-widest">Stay (S)</label>
                   <div className="flex flex-wrap gap-1">
                     {[1,2,3,4,5,6,7,8].map(n => (
                       <button key={n} onClick={() => {
                           setConfig({...config, survival2D: config.survival2D.includes(n) ? config.survival2D.filter(x => x !== n) : [...config.survival2D, n]});
                           setActivePreset(null);
                       }}
                         className={`w-5 h-5 text-[9px] rounded flex items-center justify-center font-bold transition-all ${config.survival2D.includes(n) ? 'bg-emerald-500 text-white' : 'bg-white/5 opacity-30 hover:opacity-60'}`}>{n}</button>
                     ))}
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Explainer Column */}
          <div className="md:border-l border-white/5 md:pl-8">
             <div className="bg-white/5 rounded-xl p-5 border border-white/10 h-full flex flex-col justify-between">
                <div className="space-y-4">
                    {activePreset ? (
                        <div className="space-y-2">
                             <h3 className="text-[10px] font-black uppercase text-cyan-400 tracking-tighter">{PRESETS[activePreset].name}</h3>
                             <p className="text-[11px] leading-relaxed text-white/70 italic">"{PRESETS[activePreset].desc}"</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                             <h3 className="text-[10px] font-black uppercase text-white tracking-tighter">Manual Exploration</h3>
                             <p className="text-[11px] leading-relaxed text-white/50">Modify the birth/survival counts or rules to discover unique mathematical properties.</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[10px] font-mono text-white/40 uppercase mb-2">Neighborhood Rules</p>
                        {config.mode === '2D' ? (
                            <p className="text-[11px] text-white/60 leading-relaxed">
                                Each cell checks its 8 neighbors. If it's empty and has {config.birth2D.join(', ')} neighbors, it becomes alive. If it's alive and has {config.survival2D.join(', ')}, it stays.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-[11px] text-white/60 leading-relaxed">Each cell looks at its neighbors and self to determine the next state based on the bits of Rule {config.rule1D}.</p>
                                <div className="flex gap-1 py-1">
                                    {getRuleBits(config.rule1D).map((b, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full ${b ? 'bg-white' : 'bg-white/5'}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-[10px] leading-relaxed opacity-30 font-mono">
                    Complexity is not designed; it is grown. v2.1.0
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<CellularAutomata />);