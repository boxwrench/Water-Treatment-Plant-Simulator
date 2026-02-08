# HydroFlow CA - Project Handoff

## Project Overview

**HydroFlow CA** is a grid-based fluid dynamics simulation using cellular automata principles, built with React, TypeScript, and Canvas. The simulation prioritizes **emergent visual patterns** and artistic appeal over strict physical accuracy, creating mesmerizing, colorful water flow visualizations.

## Current Status: Phase 1 Complete ✓

### Implemented Features

#### Core Simulation
- **Double-buffered cellular automata** (200×150 grid, configurable)
- **Gravity-driven flow** with stable vertical distribution
- **Pressure-based horizontal spreading**
- **Velocity field system** tracking momentum at each cell
- **Vorticity physics** creating swirling, spiral patterns

#### Visual Effects
- **Iridescent color shifting** - Water changes color based on flow direction
- **High-velocity glow** - Fast-moving water emits blue light
- **Wave shimmer effects** - Diagonal caustic patterns
- **Dynamic foam** - Surface highlights that pulse with velocity
- **Color gradients** - Depth-based coloring (sparse → body → deep)

#### Interactive Tools
- **Water Brush** - Add water (mass up to 5.0)
- **Wall Brush** - Create obstacles
- **Eraser** - Remove both water and walls
- **Drain** - Remove only water

#### Controls
- **Play/Pause** - Start/stop simulation
- **Auto Flow** - Continuous water emission from top-center
- **Brush Size** - Adjustable radius (1-20 pixels)
- **Flow Speed** - Horizontal spreading rate (10%-100%)
- **Reset** - Clear grid and restore border walls

## Quick Start

### Prerequisites
- Node.js 18+ (with npm)
- Modern web browser

### Installation & Running
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Default URL
http://localhost:3002 (or next available port)

## Project Structure

```
hydroflow-ca/
├── components/
│   ├── SimulationCanvas.tsx    # Main simulation logic & rendering
│   └── ControlPanel.tsx         # UI controls
├── App.tsx                      # Root component, state management
├── index.tsx                    # React entry point
├── types.ts                     # TypeScript interfaces
├── constants.ts                 # Configuration constants
├── vite.config.ts              # Vite build configuration
├── DEVLOG.md                    # Technical development log
└── HANDOFF.md                   # This file
```

## Key Files

### `components/SimulationCanvas.tsx`
**Lines of Interest:**
- **37-38**: Velocity field arrays
- **48-61**: Reset function (initialization)
- **71-235**: Physics simulation loop
  - **206-227**: Vorticity calculation
- **240-379**: Rendering loop
  - **287-332**: Velocity-based visual effects
- **383-425**: Mouse/touch interaction handling

### Configuration Parameters

**Grid Size** (constants.ts):
```typescript
gridWidth: 200
gridHeight: 150
```

**Physics** (SimulationCanvas.tsx):
```typescript
vorticityStrength: 0.15      // Line 206
velocityDamping: 0.98        // Line 116
gravity: 1.0                 // constants.ts
flowSpeed: 0.5 (default)     // User-adjustable
```

**Visual** (SimulationCanvas.tsx):
```typescript
hueShiftSpeed: 1.5           // Line 323
glowThreshold: 1.0           // Line 362
waveSpeed: 0.15              // Line 341
```

## Technical Architecture

### Simulation Loop (60 FPS)
```
1. Handle user interaction (brush strokes)
2. Physics step (if running):
   a. Auto emitter (if enabled)
   b. Copy mass to newMass buffer
   c. Calculate flows (down, left, right)
   d. Update velocities based on flow
   e. Apply vorticity forces
   f. Swap mass buffers
3. Render frame:
   a. Calculate colors based on mass + velocity
   b. Apply visual effects (shimmer, foam, glow)
   c. Write to ImageData
   d. Draw to canvas
```

### Data Structures
```typescript
mass: Float32Array           // Water mass per cell (0-5+)
newMass: Float32Array        // Double buffer for stable updates
velocityX: Float32Array      // Horizontal velocity
velocityY: Float32Array      // Vertical velocity
wall: Uint8Array             // Static obstacles (0 or 1)
```

### Performance Profile
- **Memory**: ~2MB for 200×150 grid (arrays + Canvas)
- **CPU**: ~30-40% of single core at 60 FPS
- **Bottleneck**: Rendering (ImageData pixel manipulation)
- **Optimization**: Skip empty cells, direct array access

## Future Enhancements (Roadmap)

### Phase 2: Enhanced Visuals (Estimated: 2-3 hours)
- [ ] **Trail/history effects** - Cells remember flow direction
- [ ] **Crystallization patterns** - Fractal formations in still water
- [ ] **Particle effects** - Spray/splash sprites
- [ ] **Improved depth perception** - Lighting/shadows
- [ ] **Velocity visualization mode** - Toggle to show velocity vectors

### Phase 3: Emergent Pattern Systems (Estimated: 3-4 hours)
- [ ] **Oscillating flow** - Wave patterns and sloshing
- [ ] **Turbulent mixing** - Controlled chaos at boundaries
- [ ] **Explosive interactions** - Burst patterns at high velocity differences
- [ ] **Pressure visualization** - Heatmap overlay mode
- [ ] **Reaction-diffusion overlay** - Turing patterns
- [ ] **Harmonic resonance** - Self-reinforcing wave patterns

### Phase 4: Interactive Chaos (Estimated: 2-3 hours)
- [ ] **Attractor/Repeller brushes** - Create vortex points
- [ ] **Resonance tool** - "Strum" water surface
- [ ] **Source/Void brushes** - Continuous emitters/drains
- [ ] **Chaos injection tool** - Add turbulence on demand
- [ ] **Adjustable gravity** - Slider control
- [ ] **Multiple fluid types** - Oil, lava, acid with different properties

### Polish & Features (Ongoing)
- [ ] Save/load scenarios (localStorage)
- [ ] Procedural terrain generation
- [ ] Undo/redo stack
- [ ] Statistics panel (volume, pressure, energy)
- [ ] Grid size options (100×75, 200×150, 400×300)
- [ ] Export animation as GIF/video
- [ ] Preset scenarios (waterfall, whirlpool, fountain)

## Known Issues

### Current Limitations
1. **No velocity diffusion** - Flows can be jagged/pixelated
2. **Simple Euler integration** - Could use RK4 for better accuracy
3. **No boundary layer physics** - Water sticks to walls unnaturally
4. **Fixed time step** - Physics tied to frame rate
5. **No spatial hashing** - Updates entire grid even when sparse

### Browser Compatibility
- **Chrome/Edge**: ✓ Full support
- **Firefox**: ✓ Full support
- **Safari**: ⚠️ Touch events may need testing
- **Mobile**: ⚠️ Performance varies, may need optimization

## Tuning Guide

### For More Swirls
```typescript
vorticityStrength: 0.25      // Increase from 0.15
velocityDamping: 0.99        // Increase from 0.98 (less damping)
```

### For Calmer Flow
```typescript
vorticityStrength: 0.05      // Decrease from 0.15
velocityDamping: 0.95        // Decrease from 0.98 (more damping)
```

### For More Dramatic Colors
```typescript
hueShiftSpeed: 3.0           // Increase from 1.5
hueInfluence: 0.8            // Increase from 0.5 (line 324)
```

### For Performance Boost
```typescript
gridWidth: 150               // Reduce from 200
gridHeight: 112              // Reduce from 150
maxFPS: 30                   // Reduce from 60 (constants.ts)
```

## Development Tips

### Hot Reload
Vite provides instant hot module replacement. Changes to code will reflect immediately without losing simulation state (usually).

### Debugging
```typescript
// Add to render loop for per-cell inspection:
if (x === mouseX && y === mouseY) {
  console.log({ mass: m, vx, vy, velocityMag });
}
```

### Adding New Brush Types
1. Add enum to `types.ts`:
   ```typescript
   export enum BrushType {
     // ... existing
     ATTRACTOR = 'ATTRACTOR'
   }
   ```

2. Add button to `ControlPanel.tsx`

3. Handle in `SimulationCanvas.tsx` interaction handler (line 387+)

### Adding New Visual Effects
Modify the render loop (line 240-379) where colors are calculated. All effects use per-pixel manipulation via ImageData.

## Contact & Resources

**Original Implementation:** Claude Sonnet 4.5
**Date:** 2026-02-07
**License:** (Add your license here)

**References:**
- Cellular Automata: https://en.wikipedia.org/wiki/Cellular_automaton
- Navier-Stokes Equations: https://en.wikipedia.org/wiki/Navier%E2%80%93Stokes_equations
- Vorticity: https://en.wikipedia.org/wiki/Vorticity
- Turing Patterns: https://en.wikipedia.org/wiki/Turing_pattern

**Similar Projects:**
- PixiJS Fluid: https://github.com/pixijs/pixijs
- WebGL Water: https://madebyevan.com/webgl-water/
- Smoothed Particle Hydrodynamics: Various implementations

---

## Quick Checklist for New Developers

- [ ] Read this document
- [ ] Read DEVLOG.md for technical details
- [ ] Run simulation locally
- [ ] Try all brush types
- [ ] Experiment with vorticity strength
- [ ] Review SimulationCanvas.tsx (main logic)
- [ ] Understand double buffering pattern
- [ ] Test on mobile device
- [ ] Check performance profiler
- [ ] Ready to implement Phase 2!

**Questions?** Check the code comments or create an issue in the repository.

Happy coding! 🌊✨
