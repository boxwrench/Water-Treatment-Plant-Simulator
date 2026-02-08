import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrushType, SimulationConfig } from '../types';
import { DEFAULT_CONFIG, COLOR_BG, COLOR_WALL, MAX_FPS } from '../constants';

interface SimulationCanvasProps {
  isRunning: boolean;
  isAutoFlow: boolean;
  brushType: BrushType;
  brushSize: number;
  config: SimulationConfig;
  onStatsUpdate: (stats: { cells: number; fps: number }) => void;
  resetTrigger: number; // Increment to reset
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  isRunning,
  isAutoFlow,
  brushType,
  brushSize,
  config,
  onStatsUpdate,
  resetTrigger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation State Refs (Mutable for performance)
  const width = config.gridWidth;
  const height = config.gridHeight;
  const numCells = width * height;

  // Double Buffering: Mass Arrays
  const massRef = useRef<Float32Array>(new Float32Array(numCells));
  const newMassRef = useRef<Float32Array>(new Float32Array(numCells));

  // Velocity Fields (for emergent patterns and vorticity)
  const velocityXRef = useRef<Float32Array>(new Float32Array(numCells));
  const velocityYRef = useRef<Float32Array>(new Float32Array(numCells));

  // Wall Array (Static, usually doesn't need double buffering unless moving walls)
  const wallRef = useRef<Uint8Array>(new Uint8Array(numCells));

  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; isDown: boolean }>({ x: 0, y: 0, isDown: false });

  // Reset function
  const resetSimulation = useCallback(() => {
    massRef.current.fill(0);
    newMassRef.current.fill(0);
    velocityXRef.current.fill(0);
    velocityYRef.current.fill(0);
    wallRef.current.fill(0);

    // Create a border wall
    for (let x = 0; x < width; x++) {
      wallRef.current[x] = 1; // Top
      wallRef.current[(height - 1) * width + x] = 1; // Bottom
    }
    for (let y = 0; y < height; y++) {
      wallRef.current[y * width] = 1; // Left
      wallRef.current[y * width + (width - 1)] = 1; // Right
    }
  }, [width, height]);

  // Handle Reset Prop
  useEffect(() => {
    resetSimulation();
  }, [resetTrigger, resetSimulation]);

  // The Physics Loop
  const simulate = () => {
    const mass = massRef.current;
    const newMass = newMassRef.current;
    const wall = wallRef.current;
    const velocityX = velocityXRef.current;
    const velocityY = velocityYRef.current;

    // Auto Emitter Logic
    // Must occur BEFORE newMass.set(mass) so the added mass is included in the state copy
    if (isAutoFlow) {
      const centerX = Math.floor(width / 2);
      const startY = 2;
      const emitterWidth = 4;

      for (let x = centerX - emitterWidth; x <= centerX + emitterWidth; x++) {
        const i = startY * width + x;
        if (wall[i] === 0) {
          // Add mass, cap at 5.0 to prevent infinite pressure explosion
          mass[i] = Math.min(mass[i] + 0.8, 5.0);
          // Add some initial downward velocity
          velocityY[i] = 0.5;
        }
      }
    }

    // Reset newMass to 0 before accumulating (Strict Double Buffering with Accumulation)
    newMass.set(mass);

    // Pre-calculate flow rate multiplier based on config
    // Default flowSpeed is 0.5. Standard multiplier is 0.25 (div 4).
    // So multiplier = flowSpeed * 0.5.
    const flowRateMult = config.flowSpeed * 0.5;

    // Temporary velocity arrays for next frame
    const newVelocityX = new Float32Array(numCells);
    const newVelocityY = new Float32Array(numCells);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;

        // Skip walls and empty cells (optimization)
        if (wall[i] === 1 || mass[i] <= 0.001) {
          newVelocityX[i] = 0;
          newVelocityY[i] = 0;
          continue;
        }

        let remainingMass = mass[i];
        let vx = velocityX[i];
        let vy = velocityY[i];

        // Apply velocity damping (for stability)
        vx *= 0.98;
        vy *= 0.98;

        // 1. Flow Down (with velocity tracking)
        if (y < height - 1) {
          const down = i + width;
          if (wall[down] === 0) {
            const targetMass = mass[down];

            // How much mass we WANT to move
            let flow = getStableFlow(remainingMass + targetMass) - targetMass;
            // Constrain
            if (flow > remainingMass) flow = remainingMass;
            // Apply flow (Update NEXT buffer only)
            if (flow > 0) {
              newMass[i] -= flow;
              newMass[down] += flow;

              // Update vertical velocity based on flow
              vy += flow * 0.5; // Accelerate downward

              remainingMass -= flow;
            }
          }
        }

        if (remainingMass <= 0) {
          newVelocityX[i] = vx;
          newVelocityY[i] = vy;
          continue;
        }

        // 2. Flow Left/Right (with velocity tracking)
        if (remainingMass > 0) {
          const left = i - 1;
          const right = i + 1;

          let flowLeft = 0;
          let flowRight = 0;

          // Check Left
          if (x > 0 && wall[left] === 0) {
            flowLeft = (remainingMass - mass[left]) * flowRateMult;
            if (flowLeft < 0) flowLeft = 0;
          }

          // Check Right
          if (x < width - 1 && wall[right] === 0) {
             flowRight = (remainingMass - mass[right]) * flowRateMult;
             if (flowRight < 0) flowRight = 0;
          }

          // Scale down if total flow exceeds remaining
          const totalFlow = flowLeft + flowRight;
          if (totalFlow > remainingMass) {
             const scale = remainingMass / totalFlow;
             flowLeft *= scale;
             flowRight *= scale;
          }

          // Apply with velocity tracking
          if (flowLeft > 0) {
            newMass[i] -= flowLeft;
            newMass[left] += flowLeft;
            vx -= flowLeft * 0.3; // Leftward velocity
          }
          if (flowRight > 0) {
            newMass[i] -= flowRight;
            newMass[right] += flowRight;
            vx += flowRight * 0.3; // Rightward velocity
          }
        }

        // Store updated velocity
        newVelocityX[i] = vx;
        newVelocityY[i] = vy;
      }
    }

    // Apply vorticity (swirl forces) - creates emergent patterns!
    const vorticityStrength = 0.15; // Adjust for more/less swirl
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;

        if (wall[i] === 1 || mass[i] <= 0.001) continue;

        // Calculate curl (vorticity) at this cell
        const right = i + 1;
        const left = i - 1;
        const up = i - width;
        const down = i + width;

        // Curl = dVy/dx - dVx/dy
        const dvydx = (newVelocityY[right] - newVelocityY[left]) * 0.5;
        const dvxdy = (newVelocityX[down] - newVelocityX[up]) * 0.5;
        const curl = dvydx - dvxdy;

        // Apply perpendicular force based on curl (creates swirls)
        // High curl = spinning motion, so we reinforce it
        newVelocityX[i] += curl * vorticityStrength * Math.sin(y * 0.1);
        newVelocityY[i] += curl * vorticityStrength * Math.cos(x * 0.1);
      }
    }

    // Copy velocities back
    velocityXRef.current.set(newVelocityX);
    velocityYRef.current.set(newVelocityY);

    // Double Buffer Swap
    const temp = massRef.current;
    massRef.current = newMassRef.current;
    newMassRef.current = temp;
  };

  // Helper for stable vertical flow (avoids flickering)
  const getStableFlow = (totalMass: number) => {
    if (totalMass <= 1.0) return 1.0; // If total < 1, all goes to bottom
    if (totalMass < 2.0 + config.gravity) return 1.0 + (totalMass * 0.1); // Compress slightly
    return (totalMass + config.gravity) / 2; // Split
  };

  // Rendering Loop
  const render = (tick: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mass = massRef.current;
    const wall = wallRef.current;
    const velocityX = velocityXRef.current;
    const velocityY = velocityYRef.current;

    // Create ImageData buffer
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    let x = 0;
    let y = 0;

    for (let i = 0; i < numCells; i++) {
      const idx = i * 4;

      // Track coordinates for noise functions
      if (x >= width) {
        x = 0;
        y++;
      }

      if (wall[i] === 1) {
        data[idx] = COLOR_WALL.r;
        data[idx + 1] = COLOR_WALL.g;
        data[idx + 2] = COLOR_WALL.b;
        data[idx + 3] = 255;
      } else if (mass[i] > 0.01) {
        const m = mass[i];
        const vx = velocityX[i];
        const vy = velocityY[i];

        // Calculate velocity magnitude and angle
        const velocityMag = Math.sqrt(vx * vx + vy * vy);
        const velocityAngle = Math.atan2(vy, vx);

        let r, g, b;

        // Gradient Logic
        // 0.0 - 0.5: Sparse/Spray (Slate-900 to Cyan-500)
        // 0.5 - 1.0: Body (Cyan-500 to Blue-600)
        // 1.0 - 2.0: Deep/Compressed (Blue-600 to Indigo-900)

        // Colors
        // BG: 15, 23, 42
        // C1 (Cyan-500): 6, 182, 212
        // C2 (Blue-600): 37, 99, 235
        // C3 (Indigo-900): 30, 58, 138

        if (m < 0.5) {
            const t = m / 0.5;
            r = 15 + t * (6 - 15);
            g = 23 + t * (182 - 23);
            b = 42 + t * (212 - 42);
        } else if (m < 1.0) {
            const t = (m - 0.5) / 0.5;
            r = 6 + t * (37 - 6);
            g = 182 + t * (99 - 182);
            b = 212 + t * (235 - 212);
        } else {
            const t = Math.min((m - 1.0) / 1.5, 1.0);
            r = 37 + t * (30 - 37);
            g = 99 + t * (58 - 99);
            b = 235 + t * (138 - 235);
        }

        // Iridescent color shift based on velocity direction
        if (velocityMag > 0.1) {
          // Convert velocity angle to hue shift (-180 to 180 degrees)
          const hueShift = (velocityAngle * 180 / Math.PI + tick * 1.5) % 360;
          const hueInfluence = Math.min(velocityMag * 0.3, 0.5); // Cap influence

          // Apply color shift based on direction
          const hueRad = (hueShift * Math.PI) / 180;
          const colorShiftR = Math.cos(hueRad) * 30 * hueInfluence;
          const colorShiftG = Math.cos(hueRad + 2.09) * 30 * hueInfluence; // 120 degrees offset
          const colorShiftB = Math.cos(hueRad + 4.19) * 30 * hueInfluence; // 240 degrees offset

          r += colorShiftR;
          g += colorShiftG;
          b += colorShiftB;
        }

        // Apply Shimmer/Noise
        // Create a diagonal wave pattern
        const wave = Math.sin((x * 0.15) + (y * 0.1) - (tick * 0.15)); // -1 to 1

        // Highlight logic (caustics feel) - enhanced by velocity
        if (wave > 0.8 && m > 0.2) {
            const highlight = (wave - 0.8) * (100 + velocityMag * 20); // Velocity enhances shimmer
            r += highlight;
            g += highlight;
            b += highlight;
        }

        // Surface Foam Logic
        const up = i - width;
        const isSurface = i >= width && mass[up] < 0.05;

        if (isSurface) {
             // Oscillating foam brightness - enhanced by horizontal velocity
             const foam = 50 + Math.sin(x * 0.5 + tick * 0.2) * 20 + Math.abs(vx) * 15;
             r += foam;
             g += foam;
             b += foam;
        }

        // High-velocity glow effect (creates energy trails)
        if (velocityMag > 1.0) {
          const glow = (velocityMag - 1.0) * 20;
          r += glow;
          g += glow * 0.8;
          b += glow * 1.2; // Slightly blue glow
        }

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      } else {
        // Background
        data[idx] = COLOR_BG.r;
        data[idx + 1] = COLOR_BG.g;
        data[idx + 2] = COLOR_BG.b;
        data[idx + 3] = 255;
      }

      x++;
    }

    ctx.putImageData(imgData, 0, 0);
  };

  // Interaction Handler
  const handleInteraction = () => {
    if (!mouseRef.current.isDown) return;

    const { x, y } = mouseRef.current;
    const mass = massRef.current;
    const wall = wallRef.current;

    const radius = brushSize;
    const radiusSq = radius * radius;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radiusSq) {
          const px = x + dx;
          const py = y + dy;

          if (px >= 1 && px < width - 1 && py >= 1 && py < height - 1) {
            const idx = py * width + px;
            
            if (brushType === BrushType.WATER) {
              if (wall[idx] === 0) mass[idx] = Math.min(mass[idx] + 0.5, 5.0); // Add water
            } else if (brushType === BrushType.WALL) {
              wall[idx] = 1;
              mass[idx] = 0; // Remove water in wall
            } else if (brushType === BrushType.ERASER) {
              wall[idx] = 0;
              mass[idx] = 0;
            } else if (brushType === BrushType.DRAIN) {
               mass[idx] = 0;
            }
          }
        }
      }
    }
  };

  // Main Loop
  useEffect(() => {
    const loop = (time: number) => {
      const delta = time - lastTimeRef.current;
      
      if (delta >= 1000 / MAX_FPS) {
        lastTimeRef.current = time;
        tickRef.current += 1; // Increment animation tick

        handleInteraction();
        if (isRunning) {
          simulate();
        }
        render(tickRef.current);
        
        // Report stats occasionally
        if (Math.random() < 0.05) {
            onStatsUpdate({ cells: width * height, fps: Math.round(1000/delta) });
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isAutoFlow, brushType, brushSize, config]);

  // Mouse Events
  const getGridPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    return {
      x: Math.floor((clientX - rect.left) * scaleX),
      y: Math.floor((clientY - rect.top) * scaleY)
    };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    mouseRef.current.isDown = true;
    const pos = getGridPos(e);
    mouseRef.current.x = pos.x;
    mouseRef.current.y = pos.y;
    // Prevent scrolling on mobile
    if ('touches' in e) {
      // Don't prevent default on non-canvas touches if possible, but for drawing we often need to.
      // e.preventDefault(); 
      // Handled in JSX prop 'touch-none'
    }
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getGridPos(e);
    mouseRef.current.x = pos.x;
    mouseRef.current.y = pos.y;
  };

  const onPointerUp = () => {
    mouseRef.current.isDown = false;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden shadow-2xl border border-slate-800 rounded-lg">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain cursor-crosshair touch-none"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      />
      
      {/* Overlay Helper Text */}
       {!isRunning && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 text-xs rounded pointer-events-none">
          PAUSED
        </div>
      )}
       {isAutoFlow && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500/80 text-white px-2 py-1 text-xs rounded pointer-events-none animate-pulse">
          AUTO FLOW
        </div>
      )}
    </div>
  );
};