WTP Simulator: Scenario Development Brief
1. Project Context (For AI Assistant)
Project: Water Treatment Plant Operator Simulator
Technology Stack: HTML, CSS, JavaScript (in separate files: index.html, css/style.css, js/main.js, etc.)
Visual Style: 16-bit SNES-style pixel art (using external PNG assets).
Core Engine: The application has a central main.js file that handles view switching and game state. All scenario-specific logic, text, and choices should be added to a master SCENARIOS object within the js/main.js file (or a separate js/scenarios.js file). The engine will read from this object to render scenes.

2. Scenario To Be Developed
Problem Title: [User to fill in: e.g., "High Headloss on a Filter"]

Problem ID: [User to fill in: e.g., "highHeadloss"]

List of 5 Root Causes:

[User to fill in]

[User to fill in]

[User to fill in]

[User to fill in]

[User to fill in]

3. Core Logic & Decision Tree (User Task)
Instructions: Please provide the step-by-step decision tree for each of the 5 root causes listed above. Follow the "Golden Path" for each, describing what the operator sees and what choices they have. You can add "incorrect" choices as well.

Root Cause 1: [Name of Cause]

Scene 1: [Describe the initial SCADA readings and the Colleague's dialogue]

Choice A: [Text for the choice] -> Next Scene: [Name of next scene]

Choice B (Incorrect): [Text for the choice] -> Feedback: [Explain why this is wrong]

Scene 2: [Describe the next step, new SCADA info, or physical observation]

Choice A: [Text for the choice] -> Next Scene: [Solution Scene Name]

Solution Scene: [Describe how the problem is solved and the Colleague's concluding dialogue]

(Repeat this structure for all 5 root causes)

4. Art & Asset Requirements (User Task)
Instructions: List any new PNG assets required for this scenario that don't already exist. Describe what they should look like.

Asset 1:

Filename: img/ui/new-icon.png

Description: [e.g., "A 16-bit icon of a clogged filter, showing brown muck on top of a gray filter bed."]

Asset 2:

Filename: img/backgrounds/new-location.png

Description: [e.g., "A 16-bit pixel art background of the filter gallery, showing the tops of large concrete filter boxes."]

5. AI Implementation Task (My Task)
Instructions for AI: Based on the decision trees and asset list provided above, please generate the necessary JavaScript code to add this entire scenario to the SCENARIOS object. Ensure all new scenes are created, choices are linked correctly, and placeholders are included for any new art assets.

6. Pertinent Questions for the User (For AI Assistant)
Instructions for AI: If the user's information is incomplete, ask these clarifying questions before generating code.

On Choices & Consequences: "For this incorrect choice, what should our 'Friendly Colleague' say to the player to explain why it's not the right move? What are the potential real-world consequences?"

On SCADA Information: "For this scene, what specific parameters and values should be displayed on the SCADA panel? (e.g., Flow rate, Pressure, Runtime, etc.)"

On Logic Flow: "If the player makes this choice, should they be returned to the previous step, or should it lead to a new, different problem?"

On Assets: "Is there a specific color or detail that should be included in this new art asset to make it clearer?"