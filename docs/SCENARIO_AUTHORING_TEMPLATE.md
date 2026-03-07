# Scenario Authoring Template

Use this when you have a reference book example, SOP note, or operator story and want to turn it into a playable troubleshooting scenario.

## Step 1: Fill In The Worksheet

Copy this block and replace the placeholders.

```md
# Scenario Title

Alarm id: shortCamelCaseId
Alarm title: Human Readable Alarm Title
Scenario summary: One sentence explaining what the operator is trying to diagnose.

## Opening State

Location: control_room
SCADA text:
- KEY PARAMETER: value
- KEY PARAMETER: value
- OPERATOR NOTE: note

Colleague prompt:
- What is happening?
- Why is this worth investigating?
- What is the operator trying to figure out?

## Root Cause 1

Cause id: causeOneId
Alarm menu choice:
- What suspicion should the player click first from the opening screen?

Investigation location: control_room
Investigation SCADA text:
- evidence line
- evidence line

Investigation prompt:
- What clue is visible?
- Why does this clue matter?

Confirm choice:
- What check confirms this cause?

Bad choice:
- Wrong action text
- Coaching feedback text

Confirmed evidence location: labs
Confirmed evidence text:
- result line
- result line

Confirmed prompt:
- What was confirmed?
- What does the operator need to do now?

Resolution choice:
- The correct action button text

Confirmed bad choice:
- Wrong action text
- Coaching feedback text

Ruled-out evidence:
- What the player sees if this is not the true cause

Jump-to cause id:
- Which cause should the "next best check" button lead to?

Resolution debrief:
- What did the operator do right?
- What is the learning point?

## Root Cause 2

Repeat the same fields.
```

## Step 2: Map The Worksheet Into The Registry Format

Each scenario becomes one module built with:

```js
window.WTPSim.createInvestigationScenario({
  id,
  title,
  summary,
  start: { ... },
  rootCauses: [{ ... }],
});
```

### Field Mapping

- `Alarm id` -> `id`
- `Alarm title` -> `title`
- `Scenario summary` -> `summary`
- `Opening State` -> `start`
- each root cause section -> one item inside `rootCauses`
- `Alarm menu choice` -> `startChoiceText`
- `Investigation ...` -> `investigation`
- `Confirmed ...` -> `confirmed`
- `Ruled-out evidence` and `Jump-to cause id` -> `ruledOut`
- `Resolution debrief` -> `resolution`

## Step 3: Use The Starter File

Start from [investigationScenario.template.js](/C:/Github/Water-Treatment-Plant-Simulator/js/scenarios/investigationScenario.template.js) and replace every placeholder.

## Step 4: Verify

After wiring the file into `index.html`, verify:

1. the alarm appears in the control room
2. the start scene loads
3. one confirmed scene loads with URL debug state
4. one solution scene loads cleanly

Useful URLs:

- `/?scenario=yourScenarioId`
- `/?scenario=yourScenarioId&cause=yourCauseId`
- `/?scenario=yourScenarioId&cause=yourCauseId&scene=yourScenarioId_yourCauseId_confirmed`

## Example Conversion

Reference the live example here:

- worksheet-like content: [issue7_weakChemicalStrength_registry.js](/C:/Github/Water-Treatment-Plant-Simulator/js/scenarios/issue7_weakChemicalStrength_registry.js)
- system notes: [SCENARIO_SYSTEM.md](/C:/Github/Water-Treatment-Plant-Simulator/docs/SCENARIO_SYSTEM.md)

If you want the shortest path, write the worksheet first in plain language and let the code mirror it. Do not start by inventing scene ids.
