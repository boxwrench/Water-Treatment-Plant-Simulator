---
phase: 6
level: 2
researched_at: 2026-01-27
---

# Phase 6 Research: Vivid Realism & 100 MGD Scaling

## Questions Investigated
1. **How does a 100 MGD plant operate differently from small-scale prototypes?**
   - Requires multiple parallel trains (e.g., 14 clarifiers, 14 filters).
   - High-inertia physics — small changes in flow have massive hydraulic impact.
2. **What visual elements distinguish "abstract" from "classroom-worthy"?**
   - Semantic textures (real sand/anthracite colors).
   - Realistic fluid movement (p5.js flow fields instead of random jitter).
   - Professional SCADA UI borders and labels.
3. **What are the specific 100 MGD constants for each module?**
   - Clarified in the findings below.

## Findings

### 1. 100 MGD Hydraulic Metrics
To move from "abstract" to "Grade 3 Operator" worthy, we must use these real-world constants:
- **Total Flow (Q)**: 100,000,000 Gallons Per Day (GPD).
- **Basin Logic**: Instead of "a basin," we visualize "Train A" representing 1/14th of the total plant flow (~7.1 MGD per train).
- **Clarifier Size**: 100ft Diameter, 12ft Depth.
- **Filter Area**: 827 ft² per cell (approx 20' x 40').

### 2. Advanced Visualization Patterns (p5.js & Matter.js)
- **Fluid Surface**: Use perlin noise (Worley noise) for the "water surface" in the microscopic view to show agitation vs. calm.
- **Floc Realism**: Use Matter.js constraints to create "agglomerates" that actually look like snowflake-like floc, which can be sheared (constraints broken) by velocity gradients.
- **Dynamic Turbidity**: Instead of dots, use a background "haze" layer whose alpha is mapped to NTU, making the water look "thick" or "crisp".

### 3. SCADA Authenticity
- **Units**: Use Gallons, MGD, Feet, and Seconds exclusively. No "scaled units".
- **Precision**: Match the decimal precision seen on real industrial HMI (Human Machine Interface) screens.

### 4. Ideal UI/UX Design Patterns (SCADA-Grade)
To achieve "Classroom Excellence" and "Industrial Authenticity":
- **High-Performance HMI (HPHMI)**: Prioritize simplicity. Use color *only* to convey status or alarms (e.g., #00ff88 for safe, #ff4444 for violation). Use dark gray (#1a1a2e) backgrounds to reduce eye strain.
- **Glassmorphism & Depth**: Apply subtle translucency and background blurs to control panels to create a modern, high-tech "Glass Cockpit" feel.
- **Micro-Animations**: Animate paddle-wheels, pumps, and water surface ripples directly tied to simulation physics (RPM = animation speed).
- **Data Densification**: Show trends alongside values (e.g., a small sparkline for Turbidity Out over time).

## Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Unit System | Standard US Imperial | Standard for US Grade 3-5 certification exams and common in Large US Plants. |
| Visual Style | Realistic Textures | Moves away from dots to structured "Plant View" cross-sections. |
| Physics Engine | Matter.js Constraints | To simulate "Floc Strength" and "Shear" with physical integrity. |
| UI Framework | Glassmorphic SCADA | Combines industrial clarity with modern "wow factor" aesthetics. |

## Patterns to Follow
- **The "Representative Train" Pattern**: When show 100 MGD, show 1 Train (7.1 MGD) and indicate total plant capacity in the header.
- **Unit Conversions**: Use a global `CONVERT` object to handle MGD -> GPM -> CFS for internal physics.

## Anti-Patterns to Avoid
- **Random Jitter**: Do not use `p.random()` for movement; use velocity vectors derived from flow rate and mixing G.
- **Floating Text**: Keep all readouts in defined "Glassmorphism" or "SCADA" style boxes.

## Ready for Planning
- [x] Questions answered
- [x] 100 MGD Constants defined
- [x] Visual strategy selected
