---
phase: 5
level: 1
researched_at: 2026-01-27
---

# Phase 5 Research: Verification & Certification

## Questions Investigated
1. **What are the non-negotiable stress tests for each module?**
   - Identified in Master Prompt Layer 3 for each specific module.
2. **Who is the final authority for certification?**
   - Director Patricia "Pat" Yamamoto.
3. **What format is required for test reporting?**
   - "Structured PASS/FAIL format with evidence" (Evidence to include screenshots/readouts).

## Findings

### 1. Mandatory Stress Test Suite
All 5 modules must pass the following specific scenarios to be considered "Certified":

| Module | Test Case | Expected Behavioral Result |
| :--- | :--- | :--- |
| **1: Coagulation** | Overdose (50 mg/L) | Particles re-stabilize/repel; Alarm: "CHARGE REVERSAL" |
| | Shear Test (Max RPM) | Floc breakage; Alarm: "HIGH SHEAR" |
| **2: Sedimentation**| Flow vs Settling | Max flow causes carryover; Alarm: "TURBIDITY CARRYOVER" |
| | Cold Water (5°C) | Higher carryover compared to 25°C at same flow |
| **3: Filtration** | Head Loss (48h) | Exponential increase in hl readout; Alarm: "TERMINAL HEAD LOSS" |
| | Media Loss (BW > 20) | Warning at high BW rates in cold water; Alarm: "MEDIA LOSS" |
| **4: Disinfection** | Violation Mode | CT Achieved < Req; Alarm: "VIOLATION" |
| | Breakpoint Shape | Visual confirmation of the "hump and dip" curve |
| **5: Distribution** | Heater Shift (60°C) | LSI shift from 0 to >0.5; Alarm: "SCALING WARNING" |
| | Nitrification Risk | Water Age > 7 days; Alarm: "NITRIFICATION RISK" |

### 2. Certification Requirements
- **Inspector's Role**: Dr. Sarah Okonkwo must see evidence for EVERY test above.
- **Chief's Role**: Marcus Thompson must approve the analogies and "plant feel".
- **Director's Role**: Final stamp of approval for deployment.

## Decisions Made
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Verification Format | Comprehensive Walkthrough | Walkthrough.md will serve as the "Inspector's Report" with embedded evidence. |
| Compliance Tooling | Integrated Alarms | Alarms must be hard-coded to trigger on these exact physics thresholds. |

## Patterns to Follow
- Use the **Inspector's Voice** for the final verification report.
- Ensure all screenshots capture the "Alarm" states as proof of failure mode accessibility.

## Dependencies Identified
- **Browser Subagent**: Needed to capture visual evidence of animations and alarms.

## Ready for Planning
- [x] Questions answered
- [x] Approach selected
- [x] Dependencies identified
