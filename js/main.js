// WTP Operator Simulator - main.js
// Core UI flow and scenario engine.

const views = {
  control_room: document.getElementById("view-control-room"),
  scenario: document.getElementById("view-scenario"),
  lab: document.getElementById("view-lab"),
};
const alarmListEl = document.getElementById("alarm-list");
const timeDisplayEl = document.querySelector(".header-time");
const sopModal = document.getElementById("modal-sop");
const btnSop = document.getElementById("btn-sop");
const btnLabs = document.getElementById("btn-labs");
const btnCloseSop = document.getElementById("btn-close-sop");
const endShiftModal = document.getElementById("modal-end-shift");
const endShiftSummaryEl = document.getElementById("end-shift-summary");
const colleagueAvatarEl = document.getElementById("colleague-avatar");
const colleagueSpeechBubbleEl = document.getElementById(
  "colleague-speech-bubble"
);
const scenarioTitleEl = document.getElementById("scenario-title");
const scenarioLocationEl = document.getElementById("scenario-location");
const scenarioScadaPanelEl = document.getElementById("scenario-scada-panel");
const scenarioChoicesEl = document.getElementById("scenario-choices");
const labTitleEl = document.getElementById("lab-title");
const labSubtitleEl = document.getElementById("lab-subtitle");
const labBriefEl = document.getElementById("lab-brief");
const labControlsEl = document.getElementById("lab-controls");
const labOutputEl = document.getElementById("lab-output");
const labFeedbackEl = document.getElementById("lab-feedback");
const labListEl = document.getElementById("lab-list");
const btnReturnControlRoom = document.getElementById("btn-return-control-room");

const LOCATION_LABELS = {
  control_room: "Control Room",
  filter_gallery: "Filter Gallery",
  "filter-gallery": "Filter Gallery",
  "chemical-storage-area": "Chemical Storage",
  labs: "Process Lab",
};

const LOCATION_BACKGROUNDS = {
  control_room: "control_room",
  filter_gallery: "filter-gallery",
  "filter-gallery": "filter-gallery",
  "chemical-storage-area": "control_room",
  labs: "control_room",
};

const gameState = {
  shiftTime: 8.0,
  alarms: [],
  currentScenario: {
    problemId: null,
    trueCause: null,
    currentSceneId: null,
  },
  currentLab: {
    labId: null,
    controlState: {},
  },
};

const ALL_PROBLEMS = {};
const SCENARIOS = {};
const SCENARIO_META = {};
const ALL_LABS = {};

function aggregateScenarioData() {
  const modules = window.WTPSim?.getScenarioModules?.() || [];
  const labModules = window.WTPSim?.getLabModules?.() || [];

  modules.forEach((module) => {
    if (!module?.problem?.id) {
      return;
    }

    const startSceneId = `${module.problem.id}_start`;
    ALL_PROBLEMS[module.problem.id] = {
      ...module.problem,
      playable: false,
      startSceneId,
    };
    SCENARIO_META[module.problem.id] = module.meta || {};

    if (module.scenes) {
      Object.assign(SCENARIOS, module.scenes);
    }
  });

  Object.entries(ALL_PROBLEMS).forEach(([problemId, problem]) => {
    const startScene = SCENARIOS[problem.startSceneId];
    problem.playable = Boolean(
      startScene && !startScene.isPlaceholder && problem.causes?.length
    );

    const meta = SCENARIO_META[problemId];
    if (meta?.validationErrors?.length) {
      console.warn(
        `Scenario "${problemId}" registered with validation errors:`,
        meta.validationErrors
      );
    }
  });

  labModules.forEach((module) => {
    if (!module?.lab?.id) {
      return;
    }
    ALL_LABS[module.lab.id] = module;
  });
}

function resolveBackground(location) {
  return LOCATION_BACKGROUNDS[location] || "control_room";
}

function formatLocationLabel(location, fallbackLabel = "Scenario View") {
  return LOCATION_LABELS[location] || fallbackLabel;
}

function getProblem(problemId) {
  return ALL_PROBLEMS[problemId] || null;
}

function getPlayableAlarms() {
  return gameState.alarms.filter((alarm) => alarm.playable);
}

function getLab(labId) {
  return ALL_LABS[labId] || null;
}

function switchView(viewName, location = "control_room") {
  Object.values(views).forEach((view) => view.classList.remove("active"));
  const activeView = views[viewName];
  if (!activeView) {
    return;
  }

  activeView.style.backgroundImage = `url('img/backgrounds/${resolveBackground(
    location
  )}.png')`;
  activeView.classList.add("active");
}

function renderAlarms() {
  alarmListEl.innerHTML = "";

  gameState.alarms.forEach((alarm) => {
    const alarmItem = document.createElement("li");
    const statusClass = alarm.solved
      ? "solved"
      : alarm.playable
      ? ""
      : "unavailable";
    alarmItem.className = `alarm-item ${statusClass}`.trim();
    alarmItem.textContent = alarm.playable
      ? `> ${alarm.title}`
      : `> ${alarm.title} [SOON]`;

    if (alarm.playable && !alarm.solved) {
      alarmItem.addEventListener("click", () => startScenario(alarm.id));
    }

    alarmListEl.appendChild(alarmItem);
  });
}

function updateTimeDisplay() {
  const hours = Math.floor(gameState.shiftTime);
  const minutes = Math.round((gameState.shiftTime % 1) * 60);
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
  timeDisplayEl.textContent = `SHIFT TIME: ${formattedTime}`;
}

function createChoiceButton(label, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className = "menu-button";
  btn.onclick = onClick;
  return btn;
}

function formatLabValue(value, unit) {
  return `${Number(value).toFixed(unit === "%" ? 0 : 2)} ${unit}`;
}

function renderLabList(activeLabId = null) {
  if (!labListEl) {
    return;
  }

  labListEl.innerHTML = "";
  Object.values(ALL_LABS).forEach((module) => {
    const button = createChoiceButton(module.lab.title, () => startLab(module.lab.id));
    if (module.lab.id === activeLabId) {
      button.disabled = true;
    }
    labListEl.appendChild(button);
  });
}

function updateLabOutput() {
  const module = getLab(gameState.currentLab.labId);
  if (!module || typeof module.compute !== "function") {
    return;
  }

  const result = module.compute(gameState.currentLab.controlState);
  labOutputEl.textContent = (result.outputLines || []).join("\n");
  labFeedbackEl.innerHTML = `<strong>${result.feedbackTitle || "Operator Status"}</strong>${result.feedbackBody || ""}`;
}

function renderLabControls(module) {
  labControlsEl.innerHTML = "";

  module.controls.forEach((control) => {
    const wrapper = document.createElement("div");
    wrapper.className = "lab-control";

    const label = document.createElement("label");
    label.textContent = control.label;

    const value = document.createElement("div");
    value.className = "lab-control-value";

    const input = document.createElement("input");
    input.type = "range";
    input.min = control.min;
    input.max = control.max;
    input.step = control.step;
    input.value = gameState.currentLab.controlState[control.key];
    value.textContent = formatLabValue(input.value, control.unit || "");

    input.addEventListener("input", () => {
      gameState.currentLab.controlState[control.key] = Number(input.value);
      value.textContent = formatLabValue(input.value, control.unit || "");
      updateLabOutput();
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(value);
    labControlsEl.appendChild(wrapper);
  });
}

function startLab(labId) {
  const module = getLab(labId);
  if (!module) {
    return;
  }

  gameState.currentScenario.problemId = null;
  gameState.currentScenario.trueCause = null;
  gameState.currentScenario.currentSceneId = null;
  gameState.currentLab.labId = labId;
  gameState.currentLab.controlState = { ...module.defaults };
  switchView("lab", "control_room");
  labTitleEl.textContent = module.lab.title;
  labSubtitleEl.textContent = "Modeling Lab";
  labBriefEl.textContent = [module.lab.summary, ...(module.instructions || [])].join(" ");
  renderLabControls(module);
  renderLabList(labId);
  updateLabOutput();
}

function startScenario(problemId, forcedCause = null) {
  const problem = getProblem(problemId);
  if (!problem || !problem.causes?.length) {
    return;
  }

  gameState.currentLab.labId = null;
  gameState.currentLab.controlState = {};
  gameState.currentScenario.problemId = problemId;
  gameState.currentScenario.trueCause =
    forcedCause && problem.causes.includes(forcedCause)
      ? forcedCause
      : problem.causes[Math.floor(Math.random() * problem.causes.length)];

  renderScene(problem.startSceneId, SCENARIOS[problem.startSceneId]);
}

function renderPlaceholderScene(problemTitle) {
  switchView("scenario", "control_room");
  scenarioTitleEl.textContent = problemTitle;
  scenarioLocationEl.textContent = "Module Status: Coming Soon";
  colleagueAvatarEl.src = "img/characters/operator-neutral.png";
  colleagueSpeechBubbleEl.textContent =
    "This training module is still under development. Return to the control room and pick the live drill.";
  scenarioScadaPanelEl.style.display = "none";
  scenarioChoicesEl.innerHTML = "";
  scenarioChoicesEl.appendChild(
    createChoiceButton("Return to Control Room", () => endScenario(false))
  );
}

function renderScene(sceneId, scene) {
  gameState.currentScenario.currentSceneId = sceneId;
  if (!scene) {
    scene = { isPlaceholder: true };
  }

  const currentProblem = getProblem(gameState.currentScenario.problemId);
  const problemTitle = currentProblem?.title || "Under Development";

  if (scene.isPlaceholder) {
    renderPlaceholderScene(problemTitle);
    return;
  }

  switchView("scenario", scene.location || "control_room");
  scenarioTitleEl.textContent = problemTitle;
  scenarioLocationEl.textContent = formatLocationLabel(
    scene.location,
    scene.locationLabel || "Scenario View"
  );
  colleagueAvatarEl.src =
    scene.avatar || "img/characters/operator-neutral.png";
  colleagueSpeechBubbleEl.textContent = scene.colleagueText || "";

  scenarioScadaPanelEl.style.display = scene.scadaText ? "block" : "none";
  scenarioScadaPanelEl.textContent = scene.scadaText || "";

  scenarioChoicesEl.innerHTML = "";
  if (scene.isSolution) {
    scenarioChoicesEl.appendChild(
      createChoiceButton("Log Resolution and Return", () => endScenario(true))
    );
  } else if (scene.choices?.length) {
    scene.choices.forEach((choice) => {
      scenarioChoicesEl.appendChild(
        createChoiceButton(choice.text, () => {
          const nextSceneId = choice.action(gameState);
          if (typeof nextSceneId === "string") {
            renderScene(nextSceneId, SCENARIOS[nextSceneId]);
          }
        })
      );
    });
  }
}

function handleIncorrectChoice(feedbackText, returnSceneId) {
  colleagueAvatarEl.src = "img/characters/operator-concerned.png";
  colleagueSpeechBubbleEl.textContent = feedbackText;
  scenarioChoicesEl.innerHTML = "";
  scenarioChoicesEl.appendChild(
    createChoiceButton("Okay, let me try again.", () =>
      renderScene(returnSceneId, SCENARIOS[returnSceneId])
    )
  );
  return null;
}

function showEndShiftModal() {
  if (!endShiftModal) {
    return;
  }

  const playableAlarms = getPlayableAlarms();
  const solvedCount = playableAlarms.filter((alarm) => alarm.solved).length;
  if (endShiftSummaryEl) {
    endShiftSummaryEl.textContent = `You closed ${solvedCount} of ${playableAlarms.length} live training alarm(s) and ended the shift at ${timeDisplayEl.textContent.replace(
      "SHIFT TIME: ",
      ""
    )}.`;
  }

  endShiftModal.classList.remove("hidden");
}

function endScenario(wasSolved) {
  if (wasSolved) {
    const currentAlarm = gameState.alarms.find(
      (alarm) => alarm.id === gameState.currentScenario.problemId
    );
    if (currentAlarm) {
      currentAlarm.solved = true;
    }
    gameState.shiftTime += 1.5;
  }

  const playableAlarms = getPlayableAlarms();
  const allSolved =
    playableAlarms.length > 0 && playableAlarms.every((alarm) => alarm.solved);

  if (allSolved || gameState.shiftTime >= 16) {
    showEndShiftModal();
    return;
  }

  switchView("control_room");
  updateTimeDisplay();
  renderAlarms();
}

function startNewShift() {
  if (endShiftModal) {
    endShiftModal.classList.add("hidden");
  }

  gameState.shiftTime = 8.0;
  gameState.currentScenario.problemId = null;
  gameState.currentScenario.trueCause = null;
  gameState.currentScenario.currentSceneId = null;
  gameState.currentLab.labId = null;
  gameState.currentLab.controlState = {};
  gameState.alarms = Object.values(ALL_PROBLEMS).map((problem) => ({
    id: problem.id,
    title: problem.title,
    playable: problem.playable,
    solved: false,
  }));

  updateTimeDisplay();
  renderAlarms();
  switchView("control_room");
}

function renderGameToText() {
  const activeView = Object.entries(views).find(([, view]) =>
    view.classList.contains("active")
  )?.[0];
  const currentProblem = getProblem(gameState.currentScenario.problemId);
  const currentLab = getLab(gameState.currentLab.labId);
  const visibleChoices = Array.from(
    scenarioChoicesEl.querySelectorAll("button")
  ).map((button) => button.textContent.trim());

  return JSON.stringify({
    coordinateSystem: "DOM UI, top-left origin, no world coordinates",
    view: activeView || "unknown",
    shiftTime: timeDisplayEl?.textContent || null,
    alarms: gameState.alarms.map((alarm) => ({
      id: alarm.id,
      title: alarm.title,
      playable: alarm.playable,
      solved: alarm.solved,
    })),
    currentScenario: {
      problemId: gameState.currentScenario.problemId,
      problemTitle: currentProblem?.title || null,
      archetype: currentProblem?.archetype || null,
      trueCause: gameState.currentScenario.trueCause,
      currentSceneId: gameState.currentScenario.currentSceneId,
      location: scenarioLocationEl?.textContent || null,
      colleagueText: colleagueSpeechBubbleEl?.textContent || null,
      scadaText:
        scenarioScadaPanelEl?.style.display === "none"
          ? null
          : scenarioScadaPanelEl?.textContent || null,
      choices: visibleChoices,
    },
    currentLab: currentLab
      ? {
          labId: currentLab.lab.id,
          title: currentLab.lab.title,
          controls: gameState.currentLab.controlState,
          output: labOutputEl?.textContent || null,
          feedback: labFeedbackEl?.textContent || null,
        }
      : null,
  });
}

function applyDebugStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const scenarioId = params.get("scenario");
  const labId = params.get("lab");

  if (labId && ALL_LABS[labId]) {
    startLab(labId);
    return;
  }

  if (!scenarioId || !ALL_PROBLEMS[scenarioId]) {
    return;
  }

  const cause = params.get("cause");
  const requestedScene = params.get("scene");
  const targetSceneId = requestedScene || `${scenarioId}_start`;

  gameState.currentScenario.problemId = scenarioId;
  gameState.currentScenario.trueCause =
    cause && ALL_PROBLEMS[scenarioId].causes.includes(cause)
      ? cause
      : ALL_PROBLEMS[scenarioId].causes[0] || null;

  renderScene(targetSceneId, SCENARIOS[targetSceneId]);
}

function initializeGame() {
  aggregateScenarioData();

  if (btnSop && sopModal) {
    btnSop.addEventListener("click", () => sopModal.classList.remove("hidden"));
  }
  if (btnCloseSop && sopModal) {
    btnCloseSop.addEventListener("click", () =>
      sopModal.classList.add("hidden")
    );
  }

  if (btnLabs) {
    btnLabs.addEventListener("click", () => {
      const firstLab = Object.values(ALL_LABS)[0];
      if (firstLab) {
        startLab(firstLab.lab.id);
      }
    });
  }

  const restartBtn = document.getElementById("btn-restart-shift");
  if (restartBtn) {
    restartBtn.addEventListener("click", startNewShift);
  }
  if (btnReturnControlRoom) {
    btnReturnControlRoom.addEventListener("click", () => {
      gameState.currentLab.labId = null;
      gameState.currentLab.controlState = {};
      switchView("control_room");
      renderAlarms();
    });
  }

  window.render_game_to_text = renderGameToText;
  window.advanceTime = () => Promise.resolve();
  window.gameDebug = {
    startScenario,
    startLab,
    renderScene: (sceneId) => renderScene(sceneId, SCENARIOS[sceneId]),
    state: gameState,
    modules: () => window.WTPSim?.getScenarioModules?.() || [],
    labs: () => window.WTPSim?.getLabModules?.() || [],
  };

  window.handleIncorrectChoice = handleIncorrectChoice;

  startNewShift();
  applyDebugStateFromUrl();
}

document.addEventListener("DOMContentLoaded", initializeGame);
