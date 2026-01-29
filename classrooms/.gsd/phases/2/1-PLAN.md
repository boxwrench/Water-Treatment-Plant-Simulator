---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Base System & UI Framework

## Objective
Standardize the visual and functional foundations for all 5 simulations. This involves defining the global design system (CSS) and shared utility logic (JS) to ensure consistency and speed up the development of the remaining modules.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- water-treatment-classroom-master-prompt.md
- module1_coagulation.html (current prototype)

## Tasks

<task type="auto">
  <name>Create Global UI/UX Foundation</name>
  <files>
    [.gsd/templates/base_styles.css](file:///c:/GitHub/Water-Treatment-Plant-Simulator/classrooms/.gsd/templates/base_styles.css),
    [.gsd/templates/base_utils.js](file:///c:/GitHub/Water-Treatment-Plant-Simulator/classrooms/.gsd/templates/base_utils.js)
  </files>
  <action>
    Extract the design system from the Master Prompt into a template CSS file.
    - Define CSS variables for the color palette (#1a1a2e, #16213e, #00ff88, etc.).
    - Implement the 40/60 split-screen grid layout including Header and Footer areas.
    - Create shared JS utility for:
      - Water viscosity calculation (temperature-dependent).
      - Tooltip event handling.
      - Alarm/Failure state triggers.
  </action>
  <verify>Check file contents against SPEC layout requirements.</verify>
  <done>Templates contain all colors, fonts, and core functions defined in LAYER 1.3/1.2 of the Master Prompt.</done>
</task>

<task type="auto">
  <name>Standardize Module Layout</name>
  <files>
    [module1_coagulation.html](file:///c:/GitHub/Water-Treatment-Plant-Simulator/classrooms/module1_coagulation.html),
    [module2_sedimentation.html](file:///c:/GitHub/Water-Treatment-Plant-Simulator/classrooms/module2_sedimentation.html)
  </files>
  <action>
    Refactor existing modules to use the standardized structure:
    - Add 100% width Header with Title/Subtitle.
    - Move Analogy Box to Footer.
    - Implement a "Reset" button in the footer.
    - Integrate the new CSS variables and layout container.
  </action>
  <verify>Manual browser check of refactored modules.</verify>
  <done>Modules 1 & 2 match the Visual Design System layout pattern exactly.</done>
</task>

## Success Criteria
- [ ] Shared CSS and JS templates exist in `.gsd/templates/`.
- [ ] Existing modules 1 & 2 are visually consistent with the new layout.
- [ ] Tooltip system and Reset functionality are operational in both modules.
