# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
The "Water Treatment Operator Digital Classroom" is a suite of 5 scientifically rigorous, browser-based simulations designed to train water treatment operators (T1-T5) on the physical and chemical processes of drinking water safety through interactive modeling and visible consequence.

## Goals
1. Provide intuitive yet technically accurate simulations of 5 core water treatment processes (Coagulation, Sedimentation, Filtration, Disinfection, Distribution).
2. Mirror real-world industrial SCADA authenticity and operational controls.
3. Teach through failure by showing clear consequences of bad operational decisions.
4. Ensure offline-capability and zero-installation deployment (single-file HTML).

## Non-Goals (Out of Scope)
- High-fidelity 3D graphics or complex animations (focus is on process physics).
- Multi-user collaboration or online real-time leaderboards.
- Native mobile applications (browser-based only).
- Training for wastewater or industrial-only treatment (drinking water focus).

## Users
- **T1-T2 Operators**: Gaining intuitive understanding of basic concepts.
- **T3-T5 Operators**: Preparing for certification and mastering rigorous technical details.
- **Training Directors**: Deploying consistent training materials across utilities.

## Constraints
- **Stack**: Single-file HTML5, p5.js (Visuals), Matter.js (Physics).
- **Deployment**: Must run from local file system (`file://`) or localhost.
- **Styling**: Unified visual design system (dark navy theme, neon accents).

## Success Criteria
- [ ] 5 interactive modules completed and certified by the Training Director.
- [ ] Each module passes the Chief Engineer's "biology safety" check.
- [ ] Each module passes the Commissioning Inspector's 4+ stress tests.
- [ ] All simulations maintain consistent UI/UX and physics standards.
