const issue7Module = window.WTPSim.createInvestigationScenario({
  id: "weakChemicalStrength",
  title: "Weak Chemical Solution Strength in Storage",
  summary:
    "Investigate why chlorine residual is falling even as the feed controller keeps demanding more output.",
  start: {
    location: "control_room",
    scadaText:
      "FINISHED WATER RESIDUAL: 1.2 mg/L and falling\nFREE CHL FEED CMD: 78%\nFEED SKID FLOWPACED OUTPUT: +22% over normal\nOPERATOR NOTE: Day tank refilled 2 days ago",
    colleagueText:
      "Residual is drifting down while the controller keeps asking for more chlorine. Treat this like a diagnosis drill: gather evidence before you just crank the feed rate.",
  },
  rootCauses: [
    {
      id: "hypochloriteDecay",
      startChoiceText: "Check tank age and storage temperature.",
      investigation: {
        location: "chemical-storage-area",
        scadaText:
          "TANK AGE: 41 days\nTANK TEMP: 89 F\nOUTDOOR DAY TANK SHADE: Partial\nLAST TITRATION: 19 days ago",
        colleagueText:
          "This batch has been sitting hot for too long. Hypochlorite decays faster with age and temperature. Confirm with a benchtop titration before you change the controller.",
        confirmChoiceText: "Run benchtop titration on day-tank sample.",
        badChoices: [
          {
            text: "Skip testing and simply increase feed output.",
            feedbackText:
              "Do not chase a low residual blind. If the product strength changed, the controller assumption must be corrected or you will lose dose control again on the next shift.",
          },
        ],
      },
      confirmed: {
        location: "labs",
        scadaText:
          "TITRATION RESULT: 8.7% NaOCl\nCONTROLLER ASSUMPTION: 12.5%\nEXPECTED DAILY DECAY: Elevated",
        colleagueText:
          "Confirmed. The solution has decayed well below the configured strength. What is the correct operator response?",
        resolutionChoiceText:
          "Update the controller strength assumption and schedule turnover of the degraded batch.",
        badChoices: [
          {
            text: "Leave the controller alone and tell operations to manually compensate each hour.",
            feedbackText:
              "Manual compensation hides the root cause and guarantees unstable dosing. Fix the assumption in the system and deal with the degraded batch.",
          },
        ],
      },
      ruledOut: {
        scadaText:
          "TITRATION RESULT: 12.2% NaOCl\nAGE/TEMP RISK: Elevated but not causal today",
        jumpToCauseId: "mixStrengthMismatch",
      },
      resolution: {
        location: "control_room",
        colleagueText:
          "Correct. You matched the controller to the actual solution strength and started turnover of degraded hypochlorite. Learning point: age and heat reduce strength, so storage conditions matter as much as feed rate.",
      },
    },
    {
      id: "weakDelivery",
      startChoiceText: "Review the delivery paperwork and sample the batch.",
      investigation: {
        location: "control_room",
        scadaText:
          "LAST DELIVERY: Yesterday\nSUPPLIER CERT: 12.5% NaOCl\nRECEIVING LOG: No exceptions noted\nDAY TANK REFILL: From fresh shipment",
        colleagueText:
          "A fresh batch should not be weak already, but the paperwork is only a claim until the lab confirms it. Sample the batch.",
        confirmChoiceText: "Run benchtop titration against the delivered batch.",
        badChoices: [
          {
            text: "Accept the certificate and move on without testing.",
            feedbackText:
              "Certificates support receiving, but they do not replace verification when the process data says otherwise. Verify the chemical before ruling it out.",
          },
        ],
      },
      confirmed: {
        location: "labs",
        scadaText:
          "TITRATION RESULT: 9.0% NaOCl\nCERTIFIED DELIVERY: 12.5% NaOCl\nVARIANCE: Out of spec",
        colleagueText:
          "The supplier delivered product below spec. This is both an operating issue and a quality issue. What is the right next step?",
        resolutionChoiceText:
          "Reject the batch, document non-conformance, and isolate it from normal feed use.",
        badChoices: [
          {
            text: "Keep using it silently and just enter a lower strength value.",
            feedbackText:
              "That keeps the plant running today, but it accepts bad product and loses the quality trail. Off-spec chemical needs a documented supplier response.",
          },
        ],
      },
      ruledOut: {
        scadaText:
          "TITRATION RESULT: 12.4% NaOCl\nDELIVERY QUALITY: Acceptable",
        jumpToCauseId: "rainwaterIntrusion",
      },
      resolution: {
        location: "control_room",
        colleagueText:
          "Correct. You isolated off-spec product and documented the supplier non-conformance. Learning point: a delivery certificate is not the final word when plant performance says otherwise.",
      },
    },
    {
      id: "rainwaterIntrusion",
      startChoiceText:
        "Investigate unexplained tank level gain after weather or washdown.",
      investigation: {
        location: "chemical-storage-area",
        scadaText:
          "DAY TANK LEVEL TREND: +320 gallons overnight with no refill command\nWEATHER LOG: Heavy rain\nHATCH GASKET INSPECTION: Damp residue present",
        colleagueText:
          "Unexpected volume gain is a strong dilution clue. If rain or wash water is getting into the tank, strength drops even when the original product was good.",
        confirmChoiceText:
          "Inspect the hatch and vent, then sample upper and lower tank layers.",
        badChoices: [
          {
            text: "Ignore the level trend because the analyzer alarm matters more.",
            feedbackText:
              "The analyzer alarm is the symptom. Unexpected tank level change is physical evidence and needs to be investigated before the dilution worsens.",
          },
        ],
      },
      confirmed: {
        location: "chemical-storage-area",
        scadaText:
          "HATCH GASKET: Failed seal\nVENT CAP: Missing screen\nTOP SAMPLE: 7.9% NaOCl\nBOTTOM SAMPLE: 9.1% NaOCl",
        colleagueText:
          "The tank took on water. The failed hatch seal and stratified samples confirm rainwater intrusion. What is the correct correction package?",
        resolutionChoiceText:
          "Isolate the tank, repair the seal, and replace or reblend the diluted solution under procedure.",
        badChoices: [
          {
            text: "Keep feeding from the tank until it is empty, then fix the seal later.",
            feedbackText:
              "That leaves the plant on an unstable, contaminated source and invites another loss of residual. Stop the intrusion and restore a known-strength batch.",
          },
        ],
      },
      ruledOut: {
        scadaText:
          "HATCH/VENT INSPECTION: Dry and intact\nTOP SAMPLE: 12.3% NaOCl\nBOTTOM SAMPLE: 12.2% NaOCl",
        jumpToCauseId: "crossConnectionDilution",
      },
      resolution: {
        location: "control_room",
        colleagueText:
          "Correct. You stopped the intrusion path, repaired the failed seal, and took the diluted batch out of normal use. Learning point: unexplained tank level rise is often your first clue that chemistry was diluted by water.",
      },
    },
    {
      id: "mixStrengthMismatch",
      startChoiceText:
        "Verify the day-tank make-down recipe versus controller assumption.",
      investigation: {
        location: "control_room",
        scadaText:
          "DAY TANK TARGET: 10.0% NaOCl\nPLC CONFIG: 12.5% NaOCl\nLAST MAKE-DOWN WORKSHEET: Operator mixed to 10.0% as directed",
        colleagueText:
          "This is a classic assumptions mismatch. The batch may be exactly what the operator prepared, while the controller still thinks it is feeding full-strength product.",
        confirmChoiceText:
          "Verify the worksheet, operator notes, and controller configuration together.",
        badChoices: [
          {
            text: "Blame the operator before comparing the recipe to PLC settings.",
            feedbackText:
              "Do not turn a systems problem into a people problem without evidence. First compare the approved recipe, the batch log, and the controller configuration.",
          },
        ],
      },
      confirmed: {
        location: "control_room",
        scadaText:
          "WORKSHEET: Batch intentionally diluted to 10.0% NaOCl\nPLC CONFIG: Still using 12.5% NaOCl\nDOSING ERROR: Controller underestimates required volume by 20%",
        colleagueText:
          "Found it. The batch was mixed correctly, but the controller configuration never changed to match the approved day-tank recipe. What closes the loop?",
        resolutionChoiceText:
          "Update the configured strength, standardize the recipe note in shift turnover, and brief operations.",
        badChoices: [
          {
            text: "Tell each shift to remember the mismatch without changing the PLC.",
            feedbackText:
              "If the fix lives only in memory, it will fail on nights, weekends, or turnover. Put the correct strength into the control system and the paperwork.",
          },
        ],
      },
      ruledOut: {
        scadaText:
          "WORKSHEET: 12.5% target\nPLC CONFIG: 12.5%\nBATCH NOTES: No mismatch found",
        jumpToCauseId: "weakDelivery",
      },
      resolution: {
        location: "control_room",
        colleagueText:
          "Correct. You reconciled the approved recipe with the PLC configuration and turnover notes. Learning point: even a good batch feeds badly when the controller is calculating dose from the wrong concentration.",
      },
    },
    {
      id: "crossConnectionDilution",
      startChoiceText:
        "Inspect fill and service-water valves for cross-connection dilution.",
      investigation: {
        location: "chemical-storage-area",
        scadaText:
          "SERVICE WATER TO DAY TANK: Isolation valve seeping\nBACKFLOW DEVICE: Due for test\nDAY TANK LEVEL: Slow rise during line flushes",
        colleagueText:
          "A leaking valve or failed backflow assembly can slowly dilute the tank whenever service water pressure exceeds tank pressure. Check the valve lineup and sample upstream versus in-tank strength.",
        confirmChoiceText:
          "Isolate the water line, verify backflow integrity, and compare tote sample to day-tank sample.",
        badChoices: [
          {
            text: "Leave the water line open because it might be helping keep the pump primed.",
            feedbackText:
              "Service water should not be the hidden answer to a chemical feed problem. If it is diluting product, you are losing control of the dose and risking contamination.",
          },
        ],
      },
      confirmed: {
        location: "chemical-storage-area",
        scadaText:
          "TOTE SAMPLE: 12.4% NaOCl\nDAY TANK SAMPLE: 9.5% NaOCl\nSERVICE WATER VALVE: Passing\nBACKFLOW TEST: Failed check valve",
        colleagueText:
          "The stock tote is fine, but the day tank is diluted by a passing service-water valve and failed backflow check. What is the right operator response?",
        resolutionChoiceText:
          "Isolate and lock out the water path, repair the backflow device, and restore a known-strength batch before returning to service.",
        badChoices: [
          {
            text: "Throttle the chemical pump higher and leave the valve issue for maintenance next month.",
            feedbackText:
              "Running around a failed cross-connection is not acceptable. Isolate the dilution path and restore a verified batch before normal operation resumes.",
          },
        ],
      },
      ruledOut: {
        scadaText:
          "VALVE LINEUP: Tight\nBACKFLOW TEST: Pass\nTOTE SAMPLE: 12.4% NaOCl\nDAY TANK SAMPLE: 12.3% NaOCl",
        jumpToCauseId: "hypochloriteDecay",
      },
      resolution: {
        location: "control_room",
        colleagueText:
          "Correct. You isolated the cross-connection, repaired the backflow failure, and restored a verified batch. Learning point: hidden dilution paths are process-control problems and contamination risks at the same time.",
      },
    },
  ],
});

window.WTPSim.registerScenarioModule(issue7Module);
