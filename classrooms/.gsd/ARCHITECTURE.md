# ARCHITECTURE.md

## System Overview
The Water Treatment Plant Simulator is a suite of decoupled, single-file HTML5 simulations. Each module implements its own physics (Matter.js) and rendering (p5.js) logic while adhering to a global design system and coding standard.

## Tech Stack
- **Structure**: Semantic HTML5
- **Visuals**: p5.js (CDN)
- **Physics**: Matter.js (CDN)
- **Logic**: Vanilla JavaScript
- **Styling**: Vanilla CSS (Dark theme: #1a1a2e)

## Component Mapping (Pre-GSD)
- `module1_coagulation.html`: Prototype/Initial build for Coagulation process.
- `module2_sedimentation.html`: Prototype/Initial build for Sedimentation process.
- `module3_filtration.html`: Prototype/Initial build for Filtration process.
- `module4_disinfection.html`: Prototype/Initial build for Disinfection process.
- `module5_distribution.html`: Prototype/Initial build for Distribution process.

## Shared Standards
- Single-file delivery (all assets inline or CDN).
- Left Panel (40%): Controls & Data.
- Right Panel (60%): Physics Visualization.
- Global `CONFIG`, `state`, `calculatePhysics()`, `draw()` structure.
