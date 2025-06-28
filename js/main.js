// WTP Operator Simulator - main.js
// Phase 1: Foundation & Core Systems
// Milestone 1.3: Core Game Engine

// --- DOM ELEMENT REFERENCES ---
// Getting references to all the HTML elements we'll need to interact with.
const alarmListEl = document.getElementById("alarm-list");
const timeDisplayEl = document.querySelector(".header-time");

// --- GAME DATA ---
// A constant object holding the definitions for all our problems.
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
// A central object to hold all dynamic information about the game.
const gameState = {
  shiftTime: 8.0, // Using a decimal for easier time management
  score: 0,
  currentView: "control-room",
  alarms: [], // This will be an array of active alarm objects
};

// --- GAME LOGIC FUNCTIONS ---

/**
 * Renders the list of active alarms into the SCADA panel.
 */
function renderAlarms() {
  // Clear any existing alarms first
  alarmListEl.innerHTML = "";

  // Loop through the alarms in our game state
  gameState.alarms.forEach((alarm) => {
    const alarmItem = document.createElement("li");

    // Add a CSS class to style the list item
    alarmItem.classList.add("alarm-item");

    // Set the text content
    alarmItem.textContent = `> ${alarm.title}`;

    // Make the alarm clickable
    alarmItem.addEventListener("click", () => {
      handleAlarmClick(alarm.id);
    });

    // Add the new alarm item to the list in the HTML
    alarmListEl.appendChild(alarmItem);
  });
}

/**
 * Updates the shift time display in the header.
 */
function updateTimeDisplay() {
  // We'll format the time to look like HH:MM
  const hours = Math.floor(gameState.shiftTime);
  const minutes = Math.round((gameState.shiftTime % 1) * 60);
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;

  timeDisplayEl.textContent = `SHIFT TIME: ${formattedTime}`;
}

/**
 * Handles the logic when an alarm in the list is clicked.
 * @param {string} alarmId - The ID of the alarm that was clicked.
 */
function handleAlarmClick(alarmId) {
  // For now, we'll just log to the console to prove it works.
  // Later, this will switch the view to the scenario.
  console.log(`Alarm clicked: ${alarmId}`);
  alert(
    `You clicked the "${ALL_PROBLEMS[alarmId].title}" alarm! The scenario will launch from here.`
  );
}

/**
 * Sets up the game for a new shift.
 */
function startNewShift() {
  console.log("Starting a new shift!");

  // Reset game state
  gameState.shiftTime = 8.0;
  gameState.score = 0;

  // Create a fresh list of unsolved alarms from our master list
  gameState.alarms = Object.values(ALL_PROBLEMS).map((problem) => ({
    ...problem, // Copy id and title
    solved: false, // Add the 'solved' status
  }));

  // Update the UI
  updateTimeDisplay();
  renderAlarms();
}

// --- INITIALIZATION ---
// This line waits for the entire HTML page to load before running our initialization code.
document.addEventListener("DOMContentLoaded", startNewShift);
