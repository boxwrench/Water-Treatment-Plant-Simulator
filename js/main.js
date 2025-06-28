// WTP Operator Simulator - main.js
// COMBINED & FIXED VERSION: This file now contains both the game engine and scenario data.

// ==================================================================================
// --- SECTION 1: SCENARIO DATA (Moved from scenarios.js) ---
// ==================================================================================

const ALL_PROBLEMS = {
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

const SCENARIOS = {
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

// ==================================================================================
// --- SECTION 2: CORE GAME ENGINE ---
// ==================================================================================

// --- DOM ELEMENT REFERENCES ---
const views = {
  controlRoom: document.getElementById("view-control-room"),
  scenario: document.getElementById("view-scenario"),
};
const backgroundLayer = document.getElementById("background-layer");
const alarmListEl = document.getElementById("alarm-list");
const timeDisplayEl = document.querySelector(".header-time");
const sopModal = document.getElementById("modal-sop");
const btnSop = document.getElementById("btn-sop");
const btnCloseSop = document.getElementById("btn-close-sop");
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
  score: 0,
  alarms: [],
  currentScenario: {
    problemId: null,
    trueCause: null,
    currentSceneId: null,
  },
};

// --- GAME ENGINE FUNCTIONS ---
function switchView(viewName, location = "control_room") {
  for (const view of Object.values(views)) {
    view.classList.remove("active");
  }
  if (views[viewName]) {
    views[viewName].classList.add("active");
  }
  // FIX: Removed the faulty if-statement that was forcing the wrong filename.
  // This now correctly uses the location string provided by the scene data.
  backgroundLayer.style.backgroundImage = `url(img/backgrounds/${location}.png)`;
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
  if (!problem || !problem.causes || problem.causes.length === 0) {
    alert(
      "This scenario is still in development. Please select another alarm."
    );
    return;
  }
  gameState.currentScenario.problemId = problemId;
  gameState.currentScenario.trueCause =
    problem.causes[Math.floor(Math.random() * problem.causes.length)];

  // FOR DEMO: Force the one cause we've built for this scenario
  if (problemId === "filterEffluentTurbidity") {
    gameState.currentScenario.trueCause = "inadequateBackwash";
  }

  renderScene(`${problemId}_start`);
}

function renderScene(sceneId) {
  gameState.currentScenario.currentSceneId = sceneId;
  const scene = SCENARIOS[sceneId];
  if (!scene) {
    return;
  }

  // FIX: Removed the faulty if-statement that was second-guessing the location name.
  // We now directly pass the location from the scene data to the switchView function.
  switchView("scenario", scene.location);

  scenarioTitleEl.textContent =
    ALL_PROBLEMS[gameState.currentScenario.problemId].title;
  colleagueAvatarEl.src = "img/characters/operator-neutral.png";
  colleagueSpeechBubbleEl.classList.remove("hidden");
  const colleagueText = scene.getColleagueText
    ? scene.getColleagueText(gameState)
    : scene.colleagueText;
  colleagueSpeechBubbleEl.textContent = colleagueText;

  scenarioScadaPanelEl.style.display = scene.getScada ? "block" : "none";
  if (scene.getScada) {
    scenarioScadaPanelEl.textContent = scene.getScada(gameState);
  }

  scenarioChoicesEl.innerHTML = "";
  const choices = scene.getChoices
    ? scene.getChoices(gameState)
    : scene.choices;

  if (scene.isSolution) {
    const btn = document.createElement("button");
    btn.textContent = "Problem Solved!";
    btn.className = "menu-button";
    btn.onclick = () => endScenario();
    scenarioChoicesEl.appendChild(btn);
  } else if (choices) {
    choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.className = "menu-button";
      btn.onclick = () => {
        const nextSceneId = choice.action(gameState);
        if (typeof nextSceneId === "string") {
          renderScene(nextSceneId);
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
  btn.onclick = () => renderScene(returnSceneId);
  scenarioChoicesEl.innerHTML = "";
  scenarioChoicesEl.appendChild(btn);
  return null;
}

function endScenario() {
  const currentAlarm = gameState.alarms.find(
    (a) => a.id === gameState.currentScenario.problemId
  );
  if (currentAlarm) currentAlarm.solved = true;
  gameState.shiftTime += 1.5;
  const allSolved = gameState.alarms.every((a) => a.solved);
  if (allSolved || gameState.shiftTime >= 16) {
    alert("Shift Complete!");
    startNewShift();
  } else {
    switchView("control_room");
    updateTimeDisplay();
    renderAlarms();
  }
}

function startNewShift() {
  gameState.shiftTime = 8.0;
  gameState.score = 0;
  gameState.alarms = Object.values(ALL_PROBLEMS).map((p) => ({
    ...p,
    solved: false,
  }));
  updateTimeDisplay();
  renderAlarms();
  switchView("control_room");
}

function initializeGame() {
  btnSop.addEventListener("click", () => sopModal.classList.remove("hidden"));
  btnCloseSop.addEventListener("click", () => sopModal.classList.add("hidden"));
  startNewShift();
}

document.addEventListener("DOMContentLoaded", initializeGame);
