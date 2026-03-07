window.WTPSim.registerScenarioModule(
  window.WTPSim.createPlaceholderModule({
    id: "finishedWaterQualityStability",
    title: "Finished Water Quality Stability",
    causes: [
      "clearwellShortCircuiting",
      "postFilterContamination",
      "residualDecay",
      "reservoirTurnover",
      "samplingError",
    ],
  })
);
