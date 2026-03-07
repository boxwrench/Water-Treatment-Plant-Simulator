const chemicalFeedDosingLab = window.WTPSim.createModelingLab({
  id: "chemicalFeedDosing",
  title: "Chemical Feed Pump Dosing Lab",
  summary: "Model chlorine dose versus flow, strength, and pump settings.",
  brief:
    "Use the controls to hit the target dose without guessing. This lab models what operators actually balance every day: plant flow, available chemical strength, and pump delivery.",
  instructions: [
    "Start by matching the actual dose to the target dose.",
    "Watch how lowering strength forces higher pump output.",
    "Use the output panel like a quick bench calculator, not a cartoon score screen.",
  ],
  defaults: {
    plantFlowMgd: 7.2,
    targetDoseMgL: 2.4,
    chemicalStrengthPercent: 10.0,
    pumpCapacityGph: 12.0,
    strokePercent: 80,
    speedPercent: 75,
  },
  controls: [
    {
      key: "plantFlowMgd",
      label: "Plant Flow (MGD)",
      min: 1,
      max: 20,
      step: 0.1,
      unit: "MGD",
    },
    {
      key: "targetDoseMgL",
      label: "Target Dose (mg/L as Cl2)",
      min: 0.5,
      max: 5,
      step: 0.1,
      unit: "mg/L",
    },
    {
      key: "chemicalStrengthPercent",
      label: "Available Strength (%)",
      min: 5,
      max: 15,
      step: 0.1,
      unit: "%",
    },
    {
      key: "pumpCapacityGph",
      label: "Pump Capacity at 100/100 (gph)",
      min: 2,
      max: 30,
      step: 0.5,
      unit: "gph",
    },
    {
      key: "strokePercent",
      label: "Pump Stroke (%)",
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
    {
      key: "speedPercent",
      label: "Pump Speed (%)",
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
    },
  ],
  compute: (state) => {
    const actualFeedGph =
      state.pumpCapacityGph *
      (state.strokePercent / 100) *
      (state.speedPercent / 100);
    const litersPerDay = state.plantFlowMgd * 3785411.784;
    const gallonsPerDay = actualFeedGph * 24;
    const litersChemicalPerDay = gallonsPerDay * 3.78541;
    const availableMgPerL = state.chemicalStrengthPercent * 10000;
    const deliveredMgPerDay = litersChemicalPerDay * availableMgPerL;
    const actualDoseMgL = litersPerDay > 0 ? deliveredMgPerDay / litersPerDay : 0;
    const requiredFeedGph =
      ((state.targetDoseMgL * litersPerDay) / availableMgPerL / 3.78541) / 24;
    const doseErrorMgL = actualDoseMgL - state.targetDoseMgL;
    const doseErrorPercent =
      state.targetDoseMgL > 0 ? (doseErrorMgL / state.targetDoseMgL) * 100 : 0;

    let praise = "Adequate Operator Energy";
    let points = 420;
    if (Math.abs(doseErrorPercent) <= 2) {
      praise = "Hydraulic Royalty";
      points = 987654;
    } else if (Math.abs(doseErrorPercent) <= 5) {
      praise = "Chlorine Wizard Supreme";
      points = 125000;
    } else if (Math.abs(doseErrorPercent) <= 10) {
      praise = "Respectable Feed Goblin";
      points = 12000;
    }

    return {
      outputLines: [
        `TARGET DOSE: ${state.targetDoseMgL.toFixed(2)} mg/L`,
        `ACTUAL DOSE: ${actualDoseMgL.toFixed(2)} mg/L`,
        `DOSE ERROR: ${doseErrorMgL >= 0 ? "+" : ""}${doseErrorMgL.toFixed(2)} mg/L (${doseErrorPercent >= 0 ? "+" : ""}${doseErrorPercent.toFixed(1)}%)`,
        `ACTUAL FEED: ${actualFeedGph.toFixed(2)} gph`,
        `REQUIRED FEED: ${requiredFeedGph.toFixed(2)} gph`,
        `AVAILABLE STRENGTH: ${state.chemicalStrengthPercent.toFixed(1)}%`,
      ],
      feedbackTitle: `${praise} | ${points.toLocaleString()} points`,
      feedbackBody:
        Math.abs(doseErrorPercent) <= 5
          ? "You are near target. Notice how the required feed changes immediately when strength or plant flow shifts."
          : doseErrorPercent > 5
          ? "You are overdosing. Back down stroke, speed, or capacity before your residual starts drifting high."
          : "You are underdosing. Increase pump delivery or restore stronger chemical before residual falls out of range.",
      metrics: {
        targetDoseMgL: state.targetDoseMgL,
        actualDoseMgL,
        actualFeedGph,
        requiredFeedGph,
        doseErrorPercent,
        scorePoints: points,
        scoreLabel: praise,
      },
    };
  },
});

window.WTPSim.registerLabModule(chemicalFeedDosingLab);
