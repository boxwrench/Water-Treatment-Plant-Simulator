# Next Session

## Highest Priority

- Build a second modeling lab to prove the lab system is real and reusable.
- Best candidates:
  - Applied channel level control
  - Chloramination ratio model
- Keep the lab grounded in operator tools and process relationships, not arcade mechanics.

## Lab Ideas

- Add a reusable lab template, similar to the investigation scenario template.
- Support multiple control types beyond sliders if needed:
  - numeric inputs
  - toggles
  - dropdown operating modes
- Add a simple chart or trend panel once a second lab exists.
- Consider a shared "bench calculator" utility area for derived values and conversions.

## Scoring Direction

- Keep scoring unserious for now.
- Good answers and tuned lab states should trigger absurd praise and inflated points.
- Mistakes should continue to redirect with coaching instead of punishing the player.
- Do not build a serious certification-style grading system yet.

## Scenario System

- Convert one fresh scenario from the worksheet/template path end to end.
- Remove old legacy scenario files once the new registry path is fully trusted.
- Consider whether all future troubleshooting scenarios fit the current investigation archetype or whether a second scenario archetype is needed.

## UI / UX

- Add real background art for `chemical-storage-area` and `labs`.
- Improve readability of dense SCADA text and lab outputs if more complex models are added.
- Consider a dedicated top-level navigation/status strip once labs and scenarios both expand.

## Persistence / State

- Decide whether shift progress should persist between sessions.
- If yes, add lightweight local save state for:
  - solved alarms
  - lab presets or last-used settings
  - unlocked modules, if that becomes part of progression

## Technical Cleanup

- Decide whether to commit or remove legacy files that are no longer in the active path:
  - `js/scenarios/issue7_weakChemicalStrength_v2.js`
  - `js/scenarios/issue7_weakChemicalStrength.js`
  - `js/scenarios/senarios.js`
- Add more validation around lab module definitions, similar to scenario validation.
- Add a quick regression checklist for:
  - control room load
  - one scenario start scene
  - one confirmed scene
  - one lab load

## Suggested First Move Next Time

- Build the chloramination ratio lab.
- Reason: it fits the modeling-lab direction better than another narrative scenario and will test whether the current lab architecture can carry more realistic operator math.
