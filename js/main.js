// WTP Operator Simulator - main.js
// Milestone 1.4: Modals & Supporting UI

// --- DOM ELEMENT REFERENCES ---
const views = {
  controlRoom: document.getElementById("view-control-room"),
  scenario: document.getElementById("view-scenario"),
};
const alarmListEl = document.getElementById("alarm-list");
const timeDisplayEl = document.querySelector(".header-time");
const sopModal = document.getElementById("modal-sop");
const btnSop = document.getElementById("btn-sop");
const btnCloseSop = document.getElementById("btn-close-sop");

// --- GAME DATA ---
const ALL_PROBLEMS = {
  highHeadloss: { id: "highHeadloss", title: "High Headloss on Filter" },
  lowClearwellCl2: {
    id: "lowClearwellCl2",
    title: "Low Chlorine in Clearwell",
  },
  lowReservoirCl2: {
    id: "lowReservoirCl2",
    title: "Low Total Cl2 in Reservoir",
  },
  shortFilterRuns: { id: "shortFilterRuns", title: "Short Filter Run Times" },
  highTurbidity: { id: "highTurbidity", title: "High Settled Water Turbidity" },
};

// --- GAME STATE ---
const gameState = {
  shiftTime: 8.0,
  score: 0,
  currentView: "control-room",
  alarms: [],
};

// --- GAME LOGIC FUNCTIONS ---

/**
 * Hides all views and shows the one specified by viewName.
 * @param {string} viewName - The key of the view to show (e.g., 'controlRoom').
 */
function switchView(viewName) {
  // Hide all views first
  for (const view of Object.values(views)) {
    view.classList.remove("active");
  }
  // Show the requested view
  if (views[viewName]) {
    views[viewName].classList.add("active");
    gameState.currentView = viewName;
    console.log(`Switched to view: ${viewName}`);
  } else {
    console.error(`Error: View "${viewName}" not found.`);
  }
}

function renderAlarms() {
  alarmListEl.innerHTML = "";
  gameState.alarms.forEach((alarm) => {
    const alarmItem = document.createElement("li");
    alarmItem.classList.add("alarm-item");
    alarmItem.textContent = `> ${alarm.title}`;
    alarmItem.addEventListener("click", () => handleAlarmClick(alarm.id));
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

/**
 * Handles the logic when an alarm is clicked. This will now switch to the scenario view.
 * @param {string} alarmId - The ID of the alarm that was clicked.
 */
function handleAlarmClick(alarmId) {
  console.log(`Starting scenario for alarm: ${alarmId}`);
  // In the future, this function will set up the specific scenario.
  // For now, it just switches to the generic scenario view.
  switchView("scenario");
}

/**
 * Sets up the game for a new shift.
 */
function startNewShift() {
  console.log("Starting a new shift!");
  gameState.shiftTime = 8.0;
  gameState.score = 0;
  gameState.alarms = Object.values(ALL_PROBLEMS).map((problem) => ({
    ...problem,
    solved: false,
  }));

  updateTimeDisplay();
  renderAlarms();
  switchView("controlRoom"); // Ensure we always start in the control room
}

// --- INITIALIZATION & EVENT LISTENERS ---
function initializeGame() {
  // Set up event listeners for the SOP modal
  btnSop.addEventListener("click", () => {
    sopModal.classList.remove("hidden");
  });
  btnCloseSop.addEventListener("click", () => {
    sopModal.classList.add("hidden");
  });

  // Start the first shift
  startNewShift();
}

document.addEventListener("DOMContentLoaded", initializeGame);
