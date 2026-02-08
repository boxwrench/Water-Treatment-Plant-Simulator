// WTP Operator Simulator - main.js
// CORE GAME ENGINE (Version 2 - More Robust)

// --- DOM ELEMENT REFERENCES ---
const views = {
  control_room: document.getElementById("view-control-room"),
  scenario: document.getElementById("view-scenario"),
};
const alarmListEl = document.getElementById("alarm-list");
const timeDisplayEl = document.querySelector(".header-time");
const sopModal = document.getElementById("modal-sop");
const labsModal = document.getElementById("modal-labs");
const btnSop = document.getElementById("btn-sop");
const btnLabs = document.getElementById("btn-labs");
const btnCloseSop = document.getElementById("btn-close-sop");
const btnCloseLabs = document.getElementById("btn-close-labs");
const colleagueAvatarEl = document.getElementById("colleague-avatar");
const colleagueSpeechBubbleEl = document.getElementById(
  "colleague-speech-bubble"
);
const scenarioTitleEl = document.getElementById("scenario-title");
const scenarioScadaPanelEl = document.getElementById("scenario-scada-panel");
const scenarioChoicesEl = document.getElementById("scenario-choices");

// --- GAME STATE ---
const gameState = {
  shiftTime: 8.0,
  alarms: [],
  currentScenario: {
    problemId: null,
    trueCause: null,
    currentSceneId: null,
  },
};

// --- DATA AGGREGATION ---
const ALL_PROBLEMS = {};
const SCENARIOS = {};

function aggregateScenarioData() {
  const issue_data_sources = [
    typeof issue1_data !== "undefined" ? issue1_data : null,
    typeof issue4_data !== "undefined" ? issue4_data : null,
    typeof issue7_data !== "undefined" ? issue7_data : null,
    typeof issue8_data !== "undefined" ? issue8_data : null,
    typeof issue10_data !== "undefined" ? issue10_data : null,
  ];

  const scene_data_sources = [
    typeof issue1_scenes !== "undefined" ? issue1_scenes : null,
    typeof issue4_scenes !== "undefined" ? issue4_scenes : null,
    typeof issue7_scenes !== "undefined" ? issue7_scenes : null,
    typeof issue8_scenes !== "undefined" ? issue8_scenes : null,
    typeof issue10_scenes !== "undefined" ? issue10_scenes : null,
  ];

  issue_data_sources.forEach((issue) => {
    if (issue) ALL_PROBLEMS[issue.id] = issue;
  });

  scene_data_sources.forEach((scene_collection) => {
    if (scene_collection) Object.assign(SCENARIOS, scene_collection);
  });
}

// --- GAME ENGINE FUNCTIONS ---
function switchView(viewName, location = "control_room") {
  Object.values(views).forEach((view) => view.classList.remove("active"));
  const activeView = views[viewName];
  if (activeView) {
    // Correct path relative to index.html
    activeView.style.backgroundImage = `url('img/backgrounds/${location}.png')`;
    activeView.classList.add("active");
  }
}

function renderAlarms() {
  alarmListEl.innerHTML = "";
  gameState.alarms.forEach((alarm) => {
    const alarmItem = document.createElement("li");
    alarmItem.className = alarm.solved ? "alarm-item solved" : "alarm-item";
    alarmItem.textContent = `> ${alarm.title}`;
    if (!alarm.solved) {
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

function startScenario(problemId) {
  const problem = ALL_PROBLEMS[problemId];
  // This will now gracefully handle any placeholder that was missed
  if (!problem || !problem.causes || problem.causes.length === 0) {
    renderScene(`${problemId}_start`, { isPlaceholder: true });
    return;
  }

  gameState.currentScenario.problemId = problemId;
  gameState.currentScenario.trueCause =
    problem.causes[Math.floor(Math.random() * problem.causes.length)];
  renderScene(`${problemId}_start`, SCENARIOS[`${problemId}_start`]);
}

function renderScene(sceneId, scene) {
  gameState.currentScenario.currentSceneId = sceneId;
  if (!scene) {
    // Failsafe if a scene is missing from the data files
    scene = { isPlaceholder: true };
  }

  if (scene.isPlaceholder) {
    const problemTitle =
      ALL_PROBLEMS[gameState.currentScenario.problemId]?.title ||
      "Under Development";
    switchView("scenario", "control_room");
    scenarioTitleEl.textContent = problemTitle;
    colleagueSpeechBubbleEl.textContent =
      "This scenario is still under development. Please select another alarm.";
    scenarioScadaPanelEl.style.display = "none";
    scenarioChoicesEl.innerHTML = "";
    const btn = document.createElement("button");
    btn.textContent = "Return to Control Room";
    btn.className = "menu-button";
    btn.onclick = () => endScenario(false); // End without solving
    scenarioChoicesEl.appendChild(btn);
    return;
  }

  // --- Render a normal scene ---
  switchView("scenario", scene.location || "control_room");
  scenarioTitleEl.textContent =
    ALL_PROBLEMS[gameState.currentScenario.problemId].title;
  colleagueAvatarEl.src = "img/characters/operator-neutral.png";
  colleagueSpeechBubbleEl.textContent = scene.colleagueText || "";

  scenarioScadaPanelEl.style.display = scene.scadaText ? "block" : "none";
  if (scene.scadaText) {
    scenarioScadaPanelEl.textContent = scene.scadaText;
  }

  scenarioChoicesEl.innerHTML = "";
  if (scene.isSolution) {
    const btn = document.createElement("button");
    btn.textContent = "Problem Solved!";
    btn.className = "menu-button";
    btn.onclick = () => endScenario(true); // End with solving
    scenarioChoicesEl.appendChild(btn);
  } else if (scene.choices) {
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.className = "menu-button";
      btn.onclick = () => {
        const nextSceneId = choice.action(gameState);
        if (typeof nextSceneId === "string") {
          renderScene(nextSceneId, SCENARIOS[nextSceneId]);
        }
      };
      scenarioChoicesEl.appendChild(btn);
    });
  }
}

function handleIncorrectChoice(feedbackText, returnSceneId) {
  colleagueAvatarEl.src = "img/characters/operator-concerned.png";
  colleagueSpeechBubbleEl.textContent = feedbackText;

  const btn = document.createElement("button");
  btn.textContent = "Okay, let me try again.";
  btn.className = "menu-button";
  btn.onclick = () => renderScene(returnSceneId, SCENARIOS[returnSceneId]);
  scenarioChoicesEl.innerHTML = "";
  scenarioChoicesEl.appendChild(btn);
  return null; // Return null to prevent the engine from trying to render a scene
}

function endScenario(wasSolved) {
  if (wasSolved) {
    const currentAlarm = gameState.alarms.find(
      (a) => a.id === gameState.currentScenario.problemId
    );
    if (currentAlarm) currentAlarm.solved = true;
    gameState.shiftTime += 1.5; // Advance time only on successful solve
  }

  const allSolved = gameState.alarms.every((a) => a.solved);
  if (allSolved || gameState.shiftTime >= 16) {
    const endShiftModal = document.getElementById("modal-end-shift");
    if (endShiftModal) endShiftModal.classList.remove("hidden");
  } else {
    switchView("control_room");
    updateTimeDisplay();
    renderAlarms();
  }
}

function startNewShift() {
  const endShiftModal = document.getElementById("modal-end-shift");
  if (endShiftModal) endShiftModal.classList.add("hidden");

  gameState.shiftTime = 8.0;
  // Create a fresh copy of the problems for the new shift
  gameState.alarms = Object.values(ALL_PROBLEMS).map((p) => ({
    id: p.id,
    title: p.title,
    solved: false,
  }));
  updateTimeDisplay();
  renderAlarms();
  switchView("control_room");
}

function initializeGame() {
  // First, aggregate the data from our separate files
  aggregateScenarioData();

  // Then, set up the game as before
  if (btnSop)
    btnSop.addEventListener("click", () => sopModal.classList.remove("hidden"));
  if (btnCloseSop)
    btnCloseSop.addEventListener("click", () =>
      sopModal.classList.add("hidden")
    );

  if (btnLabs)
    btnLabs.addEventListener("click", () =>
      labsModal.classList.remove("hidden")
    );
  if (btnCloseLabs)
    btnCloseLabs.addEventListener("click", () =>
      labsModal.classList.add("hidden")
    );

  const restartBtn = document.getElementById("btn-restart-shift");
  if (restartBtn) restartBtn.addEventListener("click", startNewShift);

  startNewShift();
}

// Start the game once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeGame);
