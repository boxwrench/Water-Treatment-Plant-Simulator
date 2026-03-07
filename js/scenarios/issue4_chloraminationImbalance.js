window.WTPSim.registerScenarioModule(
  window.WTPSim.createPlaceholderModule({
    id: "chloraminationImbalance",
    title: "Chloramination Ratio Imbalance",
    causes: [
      "excessChlorine",
      "excessAmmonia",
      "improperSequencing",
      "phOutOfRange",
      "analyzerMalfunction",
    ],
  })
);
