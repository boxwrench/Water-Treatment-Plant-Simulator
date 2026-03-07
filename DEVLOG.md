# Development Log

This file tracks development sessions, decisions, and context for continuity across time and collaborators.

---

## Project Status

Current State: Phase 1 foundation and core systems
Primary Goal: WTP operator training simulator with scenario-driven learning
Tech Stack: HTML, CSS, JavaScript

---

## Quick Context for New Sessions

- Core loop: Control Room hub with scenario spokes and simulator labs
- Scenarios are data-driven decision trees
- Visual style: 16-bit pixel art

---

## Conceptual Model (Initial)

System Model:
- Hub-and-spokes flow with scenario objects that drive scenes and choices

Inputs (expected):
- Scenario definitions (title, root causes, scenes, choices)
- SCADA parameters per scene
- Asset list per scenario

Outputs (expected):
- Branching learning experience with correct/incorrect feedback
- Replayable scenario outcomes

Constraints and Rules to Confirm:
- Scenario schema and required fields
- How state is stored across scenes
- Minimum assets to render a scenario

Failure Modes / Breakpoints:
- Broken scene links
- Missing SCADA data
- Missing assets

Optimization Levers:
- Clear scenario authoring template
- Reusable scene components
- Rapid scenario iteration

---

## Initial Tasks (Model-First)

- Locate and document the scenario schema used by the engine
- Define minimum required fields for a valid scenario
- Add one complete scenario using the template and validate flow
- Create a checklist for scenario QA (links, SCADA, feedback)
- Document how to add assets and wire them into scenes

---

## Session Notes

- None yet
