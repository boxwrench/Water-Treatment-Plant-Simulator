// WTP Operator Simulator - scenarios.js
// This file contains all the DATA for the problems and scenarios.
// The game engine in main.js will read from this file.

// --- GAME DATA ---
const ALL_PROBLEMS = {
  // Using the problem from your detailed PDF
  filterEffluentTurbidity: {
    id: "filterEffluentTurbidity",
    title: "Increased Turbidity in Filter Effluent",
    causes: [
      "inadequateBackwash",
      "polymerIssue",
      "ripeningIssue",
      "poorFloc",
      "overloaded",
    ],
  },
  // Placeholders for other scenarios
  lowClearwellCl2: {
    id: "lowClearwellCl2",
    title: "Low Chlorine in Clearwell",
    causes: [],
  },
  lowReservoirCl2: {
    id: "lowReservoirCl2",
    title: "Low Total Cl2 in Reservoir",
    causes: [],
  },
  shortFilterRuns: {
    id: "shortFilterRuns",
    title: "Short Filter Run Times",
    causes: [],
  },
  highTurbidity: {
    id: "highTurbidity",
    title: "High Settled Water Turbidity",
    causes: [],
  },
};

// --- SCENARIO CONTENT ---
const SCENARIOS = {
  // == Increased Turbidity in Filter Effluent ==
  filterEffluentTurbidity_start: {
    location: "control_room",
    colleagueText:
      "Operator, we just brought Filter #3 back online after its scheduled backwash, but the effluent turbidity is still high. It should be much lower, especially right after a backwash. Something's not right.",
    choices: [
      {
        text: "Check SCADA logs for recent backwash",
        action: (gs) => `filterEffluentTurbidity_checkBackwash`,
      },
      {
        text: "Increase coagulant dosage",
        action: (gs) =>
          handleIncorrectChoice(
            "That's not the right approach. Increasing coagulant won't fix a problem originating from an ineffective backwash. It could lead to over-coagulation and waste chemicals.",
            "filterEffluentTurbidity_start"
          ),
      },
    ],
  },
  filterEffluentTurbidity_checkBackwash: {
    location: "control_room",
    getScada: (gs) =>
      `FILTER #3 LAST BACKWASH:\nFlow Rate: 10 gpm/sq ft (SOP: 15 gpm/sq ft)\nDuration: 5 minutes (SOP: 10 minutes)`,
    colleagueText:
      "Okay, the logs show the last backwash ran at a lower flow rate and for a shorter duration than our SOP. That's probably why we're seeing this turbidity issue.",
    getChoices: (gs) => {
      if (gs.currentScenario.trueCause === "inadequateBackwash") {
        return [
          {
            text: "Initiate immediate manual backwash",
            action: () => "filterEffluentTurbidity_solution_manualBackwash",
          },
        ];
      }
      // Add logic for other causes later
      return [
        {
          text: "This must be the wrong path...",
          action: () =>
            handleIncorrectChoice(
              "This doesn't seem to be the root cause. Let's reconsider.",
              "filterEffluentTurbidity_start"
            ),
        },
      ];
    },
  },
  filterEffluentTurbidity_solution_manualBackwash: {
    isSolution: true,
    location: "filter_gallery",
    colleagueText:
      "Great job! That manual backwash at the correct settings did the trick. Filter #3's effluent turbidity is now stable and well within our targets. The plant is running smoothly again.",
  },
};
