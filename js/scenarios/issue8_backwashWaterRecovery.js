window.WTPSim.registerScenarioModule(
  window.WTPSim.createPlaceholderModule({
    id: "backwashWaterRecoveryIssues",
    title: "Backwash Water Recovery Issues",
    causes: [
      "settlingBasinOverflow",
      "thickenerUnderperformance",
      "recyclePumpFailure",
      "dewateringBottleneck",
      "highSolidsUpset",
    ],
  })
);
