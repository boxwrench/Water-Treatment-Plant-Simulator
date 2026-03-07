Original prompt: i really want to get the water treatment plant simulator going as a good learning game. take a look make an assessemnt and let see where to take it

# Assessment Notes

- Repo is a static HTML/CSS/JS prototype with a strong landing screen and a simple hub-to-scenario flow.
- Live browser capture taken from `http://127.0.0.1:4173` and saved to `output/web-game/landing.png`.
- Current playable content is limited to `weakChemicalStrength`; other listed scenarios are placeholders or empty.
- `main.js` expects SOP/end-shift modal DOM nodes that are not present in the current `index.html`, so those interactions are unsafe.
- Scenario locations reference backgrounds that do not exist yet (`chemical-storage-area`, `labs`), so some scenes will render without intended art.
- Layout is fixed at `1024x768` with `overflow: hidden`, which will not scale to smaller screens.

# March 7 Build Pass

- Restored SOP and end-shift modal markup in `index.html`.
- Added safe background fallbacks, playable-vs-coming-soon alarm handling, end-shift summary text, `render_game_to_text`, `advanceTime`, and URL debug scene loading in `js/main.js`.
- Added placeholder data for the fifth alarm in `js/scenarios/issue10_finishedWaterQuality.js`.
- Replaced the live scenario wiring with `js/scenarios/issue7_weakChemicalStrength_v2.js`, expanding the module to five root causes with evidence checks, incorrect-choice coaching, and solution debriefs.
- Tightened scenario typography/layout in `css/style.css` after screenshot review.

# March 7 Bones Refactor

- Added `js/scenarioSystem.js` with a central scenario registry and two authoring helpers:
- `createPlaceholderModule(...)`
- `createInvestigationScenario(...)`
- Switched `js/main.js` to read registered modules instead of hard-coded per-issue globals.
- Migrated placeholder alarms to registry modules.
- Added a registry-backed live scenario at `js/scenarios/issue7_weakChemicalStrength_registry.js`.
- Added authoring notes at `docs/SCENARIO_SYSTEM.md`.

# March 7 Authoring Workflow

- Added a plain-language worksheet at `docs/SCENARIO_AUTHORING_TEMPLATE.md`.
- Added a copy-and-fill starter module at `js/scenarios/investigationScenario.template.js`.
- Updated `docs/SCENARIO_SYSTEM.md` to point to the worksheet and starter file.
- Goal of this pass: future scenarios should start as structured notes first, then be mapped into the registry format with minimal custom wiring.

# March 7 Lab Pass

- Added lab registration support in `js/scenarioSystem.js` via `registerLabModule(...)` and `createModelingLab(...)`.
- Added a dedicated lab view in `index.html` and supporting layout in `css/style.css`.
- Added the first real modeling lab in `js/labs/chemicalFeedDosingLab.js`.
- `SIMULATOR LABS` now opens a live chemical feed dosing model instead of an alert.
- The lab includes intentionally ridiculous praise text/points when the operator lands near target, matching the current scoring direction.

# Verification

- Browser screenshots captured with Playwright CLI:
- `output/web-game/control-room-v3.png`
- `output/web-game/scenario-recipe-confirmed-v5.png`
- `output/web-game/scenario-solution-recipe-v5.png`
- `output/web-game/registry-control-room.png`
- `output/web-game/registry-confirmed-scene.png`
- `output/web-game/lab-chemical-feed-default-v2.png`
- Verified that the rebuilt scenario scenes render via URL debug state:
- `/?scenario=weakChemicalStrength&cause=mixStrengthMismatch&scene=weakChemicalStrength_recipeConfirmed`
- `/?scenario=weakChemicalStrength&cause=mixStrengthMismatch&scene=weakChemicalStrength_solution_recipe`
- `/?scenario=weakChemicalStrength&cause=weakDelivery&scene=weakChemicalStrength_weakDelivery_confirmed`
- Verified that the lab loads directly with `/?lab=chemicalFeedDosing`

# Suggested Next Steps

- Restore or rebuild the SOP/end-shift modal flow so menu buttons are safe to click.
- Choose one full learning loop as the vertical slice and finish it end-to-end before adding more scenario files.
- Define a stable scenario schema and move all scenario content into one consistent data shape.
- Add a text-state/debug hook so scenarios can be regression-tested without relying only on screenshots.

# TODO

- Exercise live click-throughs for each of the five `weakChemicalStrength` causes once a fuller browser automation path is in place.
- Add real background art for `chemical-storage-area` and `labs` so debug fallbacks can be removed.
- Implement at least one more complete scenario to validate the authoring workflow and shift pacing.
- Decide whether future scenarios should stay inside the current investigation archetype or whether a second archetype is needed for labs/sandbox exercises.
- Convert one brand-new scenario from the worksheet into a live registry module to prove the new authoring path end to end.
- Add a second modeling lab so the lab list becomes a real menu rather than a single-item proof of concept.
