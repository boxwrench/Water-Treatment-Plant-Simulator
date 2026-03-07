// Copy this file, rename it, fill in the placeholders, then add the new
// script tag to index.html.

const exampleScenarioModule = window.WTPSim.createInvestigationScenario({
  id: "replaceMeScenarioId",
  title: "Replace Me Scenario Title",
  summary:
    "One sentence explaining what the operator is diagnosing in this scenario.",
  start: {
    location: "control_room",
    scadaText:
      "KEY PARAMETER: value\nKEY PARAMETER: value\nOPERATOR NOTE: what changed",
    colleagueText:
      "Describe the opening problem, why it matters, and what the operator is trying to figure out.",
  },
  rootCauses: [
    {
      id: "replaceMeCauseOne",
      startChoiceText: "Suspicion the player should investigate first.",
      investigation: {
        location: "control_room",
        scadaText:
          "EVIDENCE LINE: value\nEVIDENCE LINE: value\nEVIDENCE LINE: value",
        colleagueText:
          "Describe the clue and why it makes this cause worth checking.",
        confirmChoiceText: "The evidence-gathering action that confirms this cause.",
        badChoices: [
          {
            text: "A tempting but wrong shortcut.",
            feedbackText:
              "Explain why that shortcut is unsafe, incorrect, or incomplete.",
          },
        ],
      },
      confirmed: {
        location: "labs",
        scadaText:
          "RESULT LINE: value\nRESULT LINE: value\nRESULT LINE: value",
        colleagueText:
          "Describe what was confirmed and what decision the operator now needs to make.",
        resolutionChoiceText: "The correct corrective action button text.",
        badChoices: [
          {
            text: "A wrong correction action.",
            feedbackText:
              "Explain why this correction would create a process or training problem.",
          },
        ],
      },
      ruledOut: {
        location: "labs",
        scadaText:
          "RULED OUT LINE: value\nRULED OUT LINE: value\nRULED OUT LINE: value",
        colleagueText:
          "Describe what the operator learned when this cause was checked and ruled out.",
        jumpToCauseId: "replaceMeCauseTwo",
      },
      resolution: {
        location: "control_room",
        colleagueText:
          "Explain what the operator did correctly and state the learning point for this root cause.",
      },
    },
    {
      id: "replaceMeCauseTwo",
      startChoiceText: "Second suspicion the player can investigate.",
      investigation: {
        location: "control_room",
        scadaText:
          "EVIDENCE LINE: value\nEVIDENCE LINE: value\nEVIDENCE LINE: value",
        colleagueText:
          "Describe the clue and why it matters for this second cause.",
        confirmChoiceText: "The evidence-gathering action that confirms this cause.",
        badChoices: [
          {
            text: "A tempting but wrong shortcut.",
            feedbackText:
              "Explain why that shortcut is unsafe, incorrect, or incomplete.",
          },
        ],
      },
      confirmed: {
        location: "labs",
        scadaText:
          "RESULT LINE: value\nRESULT LINE: value\nRESULT LINE: value",
        colleagueText:
          "Describe what was confirmed and what the operator now needs to do.",
        resolutionChoiceText: "The correct corrective action button text.",
      },
      ruledOut: {
        location: "labs",
        scadaText:
          "RULED OUT LINE: value\nRULED OUT LINE: value\nRULED OUT LINE: value",
        colleagueText:
          "Describe what was observed when this cause was checked and ruled out.",
        jumpToCauseId: "replaceMeCauseOne",
      },
      resolution: {
        location: "control_room",
        colleagueText:
          "Explain what the operator did correctly and state the learning point.",
      },
    },
  ],
});

window.WTPSim.registerScenarioModule(exampleScenarioModule);
