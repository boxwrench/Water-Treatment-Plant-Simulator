# Scenario System

The simulator now uses a registry-based scenario system. `main.js` no longer knows individual issue file names or globals like `issue7_data`.

## Core Pieces

- `js/scenarioSystem.js`
  - exposes `window.WTPSim.registerScenarioModule(module)`
  - exposes `window.WTPSim.createPlaceholderModule(definition)`
  - exposes `window.WTPSim.createInvestigationScenario(definition)`
  - exposes `window.WTPSim.registerLabModule(module)`
  - exposes `window.WTPSim.createModelingLab(definition)`
- `js/scenarios/*.js`
  - each file registers exactly one scenario module
- `js/main.js`
  - reads registered modules from `window.WTPSim.getScenarioModules()`

## Current Archetypes

### Placeholder Module

Use this when the alarm should appear in the control room but the scenario is not authored yet.

```js
window.WTPSim.registerScenarioModule(
  window.WTPSim.createPlaceholderModule({
    id: "chloraminationImbalance",
    title: "Chloramination Ratio Imbalance",
    causes: ["excessChlorine", "excessAmmonia"],
  })
);
```

### Investigation Scenario

Use this for the standard troubleshooting loop:

1. start with the alarm context
2. choose a suspected cause
3. run one evidence check
4. either confirm or rule out that cause
5. apply the correct resolution

See [issue7_weakChemicalStrength_registry.js](/C:/Github/Water-Treatment-Plant-Simulator/js/scenarios/issue7_weakChemicalStrength_registry.js) for the live example.
For a fill-in worksheet, see [SCENARIO_AUTHORING_TEMPLATE.md](/C:/Github/Water-Treatment-Plant-Simulator/docs/SCENARIO_AUTHORING_TEMPLATE.md).
For a code starter, see [investigationScenario.template.js](/C:/Github/Water-Treatment-Plant-Simulator/js/scenarios/investigationScenario.template.js).

### Modeling Lab

Use this for hands-on controls and process calculations rather than branching diagnosis.

Current live example:

- [chemicalFeedDosingLab.js](/C:/Github/Water-Treatment-Plant-Simulator/js/labs/chemicalFeedDosingLab.js)

Use modeling labs when the user should tune values, observe outputs, and learn how a relationship behaves over time or across operating conditions.

## Definition Shape

Top-level fields:

- `id`
- `title`
- `summary`
- `start`
- `rootCauses`

Each root cause should define:

- `id`
- `startChoiceText`
- `investigation`
- `confirmed`
- `ruledOut`
- `resolution`

Minimal authoring checklist:

- one operator-facing label for the suspicion
- one confirming evidence step
- one incorrect shortcut with feedback
- one ruled-out observation for when that cause is not true
- one resolution/debrief

## Why This Matters

This lets you build scenarios from text references instead of hand-coding scene wiring every time. A future scenario workflow can now be:

1. write the narrative/reference notes
2. map each root cause into the investigation schema
3. register the module
4. verify with URL debug scenes and screenshots

Recommended authoring path:

1. fill out the worksheet in [SCENARIO_AUTHORING_TEMPLATE.md](/C:/Github/Water-Treatment-Plant-Simulator/docs/SCENARIO_AUTHORING_TEMPLATE.md)
2. copy [investigationScenario.template.js](/C:/Github/Water-Treatment-Plant-Simulator/js/scenarios/investigationScenario.template.js)
3. replace placeholders with your scenario content
4. add the new script to `index.html`
5. verify start, confirmed, and solution scenes in-browser

## Debugging

Useful browser URLs:

- `/?scenario=weakChemicalStrength`
- `/?scenario=weakChemicalStrength&cause=mixStrengthMismatch`
- `/?scenario=weakChemicalStrength&cause=mixStrengthMismatch&scene=weakChemicalStrength_mixStrengthMismatch_confirmed`

Useful browser console helpers:

- `window.gameDebug.modules()`
- `window.gameDebug.startScenario("weakChemicalStrength", "weakDelivery")`
- `window.render_game_to_text()`
