// SCENARIO 7: Weak Chemical Solution Strength in Storage
// This file defines the problem and all associated scene logic.

const issue7_data = {
  id: "weakChemicalStrength",
  title: "Weak Chemical Solution Strength in Storage",
  causes: ["hypochloriteDecay", "weakDelivery"],
};

const issue7_scenes = {
  // --- START SCENE ---
  weakChemicalStrength_start: {
    isPlaceholder: false,
    location: "control_room",
    colleagueText:
      "Operator, our finished water chlorine residual is dropping, but the feed pump controller says it's increasing the dose to compensate. It's working harder than it should have to. This suggests the chemical itself might be the problem.",
    choices: [
      {
        text: "Check the age of the hypochlorite in the tank.",
        action: (gs) => "weakChemicalStrength_checkAge",
      },
      {
        text: "Check the most recent delivery bill of lading.",
        action: (gs) => "weakChemicalStrength_checkDelivery",
      },
    ],
  },

  // --- ROOT CAUSE 1: Hypochlorite Decay ---
  weakChemicalStrength_checkAge: {
    isPlaceholder: false,
    location: "chemical-storage-area",
    scadaText: "SODIUM HYPOCHLORITE TANK #1\nAGE: 42 Days\nTEMP: 88°F",
    colleagueText:
      "42 days old, and it's been hot. Hypochlorite can lose significant strength after just 30 days, especially in the heat. Let's run a titration test to confirm its actual strength.",
    choices: [
      {
        text: "Perform benchtop titration.",
        action: (gs) => {
          // If this is the true cause, the titration reveals the problem.
          return gs.currentScenario.trueCause === "hypochloriteDecay"
            ? "weakChemicalStrength_titration_revealsDecay"
            : "weakChemicalStrength_titration_revealsGood";
        },
      },
    ],
  },
  weakChemicalStrength_titration_revealsDecay: {
    isPlaceholder: false,
    location: "labs",
    scadaText:
      "TITRATION RESULT: 8.8% Strength\nCONTROLLER ASSUMPTION: 12.5% Strength",
    colleagueText:
      "Just as we suspected. The solution has decayed to under 9% strength, but the feed controller still thinks it's dosing with 12.5% solution. What's the right move?",
    choices: [
      {
        text: "Update controller with new strength & plan to use or dump tank.",
        action: (gs) => "weakChemicalStrength_solution_decay",
      },
      {
        text: "Just increase the dose without telling the controller why.",
        action: (gs) =>
          handleIncorrectChoice(
            "That's a bad practice. The controller needs the correct chemical strength to dose accurately. Always update the system with the right information.",
            "weakChemicalStrength_titration_revealsDecay"
          ),
      },
    ],
  },

  // --- ROOT CAUSE 2: Weak Delivery ---
  weakChemicalStrength_checkDelivery: {
    isPlaceholder: false,
    location: "control_room",
    scadaText:
      "LAST DELIVERY: Yesterday\nSUPPLIER: Acme Chemicals\nBOL: 12.5% Sodium Hypochlorite",
    colleagueText:
      "Okay, we just got this batch yesterday, so it shouldn't have decayed. But let's verify what the supplier actually gave us. Let's run a titration test on a sample from the tank.",
    choices: [
      {
        text: "Perform benchtop titration.",
        action: (gs) => {
          return gs.currentScenario.trueCause === "weakDelivery"
            ? "weakChemicalStrength_titration_revealsWeakDelivery"
            : "weakChemicalStrength_titration_revealsGood";
        },
      },
    ],
  },
  weakChemicalStrength_titration_revealsWeakDelivery: {
    isPlaceholder: false,
    location: "labs",
    scadaText:
      "TITRATION RESULT: 8.9% Strength\nBILL OF LADING: 12.5% Strength",
    colleagueText:
      "Wow. The supplier delivered a weak batch. The bill of lading says 12.5%, but it's not even 9%. We are paying for something we didn't get. What's the protocol here?",
    choices: [
      {
        text: "Reject the delivery and file a non-conformance report.",
        action: (gs) => "weakChemicalStrength_solution_delivery",
      },
      {
        text: "Accept it but tell the controller it's weaker.",
        action: (gs) =>
          handleIncorrectChoice(
            "We shouldn't accept a shipment that doesn't meet spec. That sets a bad precedent and costs us money. The correct procedure is to reject it.",
            "weakChemicalStrength_titration_revealsWeakDelivery"
          ),
      },
    ],
  },

  // --- FALSE PATH SCENE ---
  weakChemicalStrength_titration_revealsGood: {
    isPlaceholder: false,
    location: "labs",
    colleagueText:
      "Well, the titration shows the chemical strength is fine. This isn't the problem. Let's go back and reconsider the other possibilities.",
    choices: [
      {
        text: "Return to initial assessment.",
        action: (gs) => "weakChemicalStrength_start",
      },
    ],
  },

  // --- SOLUTION SCENES ---
  weakChemicalStrength_solution_decay: {
    isSolution: true,
    location: "control_room",
    colleagueText:
      "Good call. You've updated the controller with the actual chemical strength so it can dose properly. We'll need to schedule a drain and clean of that tank soon. Problem managed.",
  },
  weakChemicalStrength_solution_delivery: {
    isSolution: true,
    location: "control_room",
    colleagueText:
      "Perfect. You've followed procedure, documented the non-conformance, and contacted the supplier to arrange for them to pump out the bad batch and deliver what we paid for. Excellent work.",
  },
};
