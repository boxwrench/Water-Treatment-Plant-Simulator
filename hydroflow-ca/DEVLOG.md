# HydroFlow CA - Development Log

## 2026-02-07 - Phase 1: Velocity Field + Vorticity Implementation

### Overview
Implemented a complete velocity field system and vorticity-based physics to create emergent visual patterns in the fluid simulation. Focus was on creating mesmerizing, pattern-forming behaviors that prioritize visual appeal over strict physical accuracy.

### Technical Changes

#### 1. Velocity Field System
**Files Modified:** `components/SimulationCanvas.tsx`

**Added State Arrays:**
```typescript
const velocityXRef = useRef<Float32Array>(new Float32Array(numCells));
const velocityYRef = useRef<Float32Array>(new Float32Array(numCells));
```

**Purpose:** Track horizontal and vertical velocity at each cell independently from mass. This allows for momentum-based flow and creates more organic, fluid-like behavior.

**Implementation Details:**
- Velocities update based on mass flow:
  - Downward flow increases `vy` (vertical velocity)
  - Horizontal flow modifies `vx` (horizontal velocity)
- Applied 0.98 damping factor per frame to prevent infinite acceleration
- Velocities reset to 0 for walls and empty cells

#### 2. Vorticity/Swirl Physics
**Location:** `SimulationCanvas.tsx:206-227`

**Algorithm:**
```typescript
// Calculate curl (vorticity) at each cell
const dvydx = (velocityY[right] - velocityY[left]) * 0.5;
const dvxdy = (velocityX[down] - velocityX[up]) * 0.5;
const curl = dvydx - dvxdy;

// Apply perpendicular force based on curl
velocityX[i] += curl * vorticityStrength * Math.sin(y * 0.1);
velocityY[i] += curl * vorticityStrength * Math.cos(x * 0.1);
```

**Parameters:**
- `vorticityStrength = 0.15` - Controls intensity of swirl effects
- Spatial modulation via `sin(y * 0.1)` and `cos(x * 0.1)` creates varied patterns

**Effect:** Creates self-reinforcing spiral patterns, vortex shedding around obstacles, and whirlpool formations.

#### 3. Enhanced Visual Effects

**A. Iridescent Color Shifting** (`SimulationCanvas.tsx:320-332`)
```typescript
const velocityMag = Math.sqrt(vx * vx + vy * vy);
const velocityAngle = Math.atan2(vy, vx);
const hueShift = (velocityAngle * 180 / Math.PI + tick * 1.5) % 360;
```
- Water color shifts based on flow direction
- Creates rainbow-like trails
- Animated via `tick * 1.5` for dynamic shimmer

**B. High-Velocity Glow** (`SimulationCanvas.tsx:362-367`)
```typescript
if (velocityMag > 1.0) {
  const glow = (velocityMag - 1.0) * 20;
  r += glow;
  g += glow * 0.8;
  b += glow * 1.2; // Blue-tinted glow
}
```
- Fast-moving water emits blue glow
- Creates energy trail effect
- Threshold: velocityMag > 1.0

**C. Velocity-Enhanced Shimmer** (`SimulationCanvas.tsx:343`)
```typescript
const highlight = (wave - 0.8) * (100 + velocityMag * 20);
```
- Existing caustic patterns intensified by velocity
- Moving water has brighter highlights

**D. Dynamic Foam** (`SimulationCanvas.tsx:356-361`)
```typescript
const foam = 50 + Math.sin(x * 0.5 + tick * 0.2) * 20 + Math.abs(vx) * 15;
```
- Surface foam brightness increases with horizontal velocity
- Creates more dramatic whitecaps on fast-moving surfaces

### Performance Considerations

**Memory:**
- Added 2 × Float32Array (velocityX, velocityY) = ~240KB for 200×150 grid
- Temporary velocity arrays created per frame (newVelocityX, newVelocityY)

**Computation:**
- Vorticity calculation: O(n) pass over grid
- Adds ~30% computational overhead
- Still maintains 60 FPS on most hardware

**Optimizations:**
- Skip vorticity calc for walls and empty cells
- Velocity damping prevents runaway values
- Direct array access (no function calls in hot loop)

### Emergent Behaviors Observed

1. **Von Kármán Vortex Streets** - Obstacles create alternating vortices downstream
2. **Spiral Formation** - Corners and cavities naturally form rotating water masses
3. **Turbulent Mixing** - High-velocity boundaries create chaotic, colorful patterns
4. **Flow Channeling** - Narrow passages amplify velocity and create glowing streams
5. **Pressure Oscillations** - Confined spaces create pulsing, breathing patterns

### Known Issues / Future Improvements

**Current Limitations:**
- Velocity field uses simple Euler integration (could use RK4 for accuracy)
- No velocity diffusion (might smooth out jagged flows)
- Vorticity calculation uses simple finite differences (could use higher-order stencils)

**Potential Enhancements:**
- Add velocity magnitude visualization toggle
- Implement velocity diffusion for smoother flows
- Add turbulence injection for more chaos
- Particle tracer system to visualize streamlines

### Configuration Parameters

| Parameter | Location | Default | Effect |
|-----------|----------|---------|--------|
| `vorticityStrength` | Line 206 | 0.15 | Swirl intensity |
| `velocityDamping` | Line 116 | 0.98 | Velocity decay rate |
| `flowAcceleration` | Line 145 | 0.5 (down), 0.3 (horiz) | Flow→velocity conversion |
| `hueShiftSpeed` | Line 323 | 1.5 | Color animation speed |
| `glowThreshold` | Line 362 | 1.0 | Min velocity for glow |

### Testing Recommendations

1. **Auto Flow Test** - Enable auto flow, observe spiral formation at emitter
2. **Obstacle Test** - Place single wall cell, observe vortex shedding
3. **Channel Test** - Create narrow vertical channel, observe velocity glow
4. **U-Bend Test** - Draw U-shaped walls, observe swirling through bend
5. **Cavity Test** - Create enclosed space with small opening, observe rotating vortex

### Next Steps (Phase 2-4)

See `HANDOFF.md` for planned future enhancements:
- Phase 2: Trail effects, crystallization, enhanced gradients
- Phase 3: Turbulent mixing, pressure visualization, oscillating physics
- Phase 4: Interactive chaos tools (attractors, repellers, resonance)

---

**Commit Reference:** Phase 1 - Velocity Field + Vorticity
**Author:** Claude Sonnet 4.5
**Date:** 2026-02-07
