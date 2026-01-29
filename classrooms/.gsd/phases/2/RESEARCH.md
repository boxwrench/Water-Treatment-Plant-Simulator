# Audit Report & Improvement Plan — Water Treatment Simulations

This document audits the 5 existing simulation modules against the [Master Prompt](file:///c:/GitHub/Water-Treatment-Plant-Simulator/classrooms/water-treatment-classroom-master-prompt.md) and outlines the path to full compliance and "North Star" quality.

## Global Discrepancies (Affecting All Modules)

| Feature | Requirement | Current State | Improvement Needed |
| :--- | :--- | :--- | :--- |
| **Header** | Module Title + Subtitle | Missing or simple H1 | Add standard header with consistent styling |
| **Footer** | Analogy Box, Reset, Wikipedia Link | Scattered or missing | Create unified footer layout |
| **CSS System** | Unified variables/standard classes | Ad-hoc per file | Extract to shared template |
| **Code Structure** | `CONFIG`, `state`, `calculatePhysics()`, `draw()` | Varied function names | Refactor to standard architecture |
| **Tooltips** | Hover "?" system explaining IS/MATTERS/RANGE | Basic title attributes | Implement custom interactive tooltip system |
| **Alarms** | Visual/Audio failure cues | Simple status text | Add persistent "ALARM" dashboard indicators |
| **Physics** | Authoritative formulas from Spec | Simplified/Scaled versions | Implement exact physical equations from Master Prompt |

## Module-Specific Audits

### Module 1: Coagulation
- **Gap**: G-value calculation is simplified. Brownian motion/clustering logic is decent but lacks rigorous Debye Length visualization.
- **Action**: Align `calculatePhysics` with exact G-value formula including temperature-dependent viscosity. Add Debye Length readout.

### Module 2: Sedimentation
- **Gap**: SOR (Surface Overflow Rate) and Detention Time are "scaled" and don't use real-world gallons/area units correctly.
- **Action**: Implement Stokes' Law rigorously. Use real MGD and Square Footage logic for SOR.

### Module 3: Filtration
- **Gap**: Layout doesn't cleanly separate Filter/Backwash controls. Exponential head loss is indicated but could be clearer.
- **Action**: Improve visual feedback for bed expansion. Ensure media loss warning is prominent.

### Module 4: Disinfection
- **Gap**: Breakpoint curve is a static shape with a marker.
- **Action**: Ensure the species bars (mono/di/free) are dynamic and scientifically accurate to the dose/ammonia ratio.

### Module 5: Distribution
- **Gap**: LSI balance beam is effective but pipe cross-section visualization is basic.
- **Action**: Enhance Coronation/Scaling visuals. Implement Water Age decay more prominently in the UI.

## Systematic Improvement Path

1. **Step 1: The Foundation**
   - Create `.gsd/templates/base.css` and `.gsd/templates/base.js`.
   - Implement the Global Title, Footer, and Tooltip system.

2. **Step 2: The Architecture Refactor**
   - Refactor each module to follow the `calculatePhysics() -> draw()` loop.
   - Move all tunable parameters to a standard `CONFIG` object.

3. **Step 3: The Science Audit**
   - Drop in the exact formulas from the Reference Library in the Master Prompt.
   - Replace "scaled" readouts with unit-accurate calculations.

4. **Step 4: The Final Polish**
   - Add the Wikipedia links and "Sticky" analogy boxes.
   - Verify all 4 stress tests per module using the Commissioning Inspector persona requirements.
