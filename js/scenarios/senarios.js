<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WTP Operator Simulator</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <div id="game-container">
        <!-- The background is now applied directly to the active .view div -->

        <!-- VIEW: CONTROL ROOM (HUB) -->
        <div id="view-control-room" class="view active">
            <div id="control-room-ui">
                <div id="operator-panel">
                    <img src="img/characters/operator-neutral.png" alt="Operator">
                </div>
                <div id="scada-panel">
                    <div class="scada-header">
                        <h1>PLANT STATUS</h1>
                        <div class="header-time">SHIFT TIME: 08:00</div>
                    </div>
                    <div class="scada-alarms">
                        <h2>ACTIVE ALARMS</h2>
                        <ul id="alarm-list"></ul>
                    </div>
                </div>
                <div id="menu-panel">
                     <button id="btn-labs" class="menu-button">SIMULATOR LABS</button>
                     <button id="btn-sop" class="menu-button">DIGITAL SOP</button>
                </div>
            </div>
        </div>

        <!-- VIEW: SCENARIO -->
        <div id="view-scenario" class="view">
            <div class="scenario-ui">
                <div class="scenario-colleague">
                    <img id="colleague-avatar" src="img/characters/operator-neutral.png" alt="Operator colleague">
                    <div id="colleague-speech-bubble" class="speech-bubble"></div>
                </div>
                <div class="scenario-main">
                    <h1 id="scenario-title"></h1>
                    <div id="scenario-scada-panel" class="scada-panel"></div>
                    <div id="scenario-choices" class="choices-grid"></div>
                </div>
            </div>
        </div>

    </div>

    <!-- MODALS (Hidden by default) -->
    <div id="modal-sop" class="modal-overlay hidden">
        <div class="modal-content">
            <h1>S.O.P. MANUAL</h1>
            <div class="sop-content">
                <h3>VERIFYING ANALYZER READINGS</h3>
                <p>When a SCADA alarm occurs for an analyzer reading, the first step is to verify if the reading is legitimate. This is typically done by taking a manual "grab sample" and testing it on a separate benchtop unit.</p>
                <h3>BASIC PUMP TROUBLESHOOTING</h3>
                <p>If a pump is suspected to be faulty, check SCADA for its status (Running/Stopped/Fault). If stopped, check the fault type. If running but ineffective, investigate physically. Always follow LOTO procedures before physical maintenance.</p>
            </div>
            <button id="btn-close-sop" class="menu-button">CLOSE</button>
        </div>
    </div>
    <div id="modal-end-shift" class="modal-overlay hidden">
        <div class="modal-content">
            <h1>SHIFT COMPLETE!</h1>
            <button id="btn-restart-shift" class="menu-button">START NEW SHIFT</button>
        </div>
    </div>

    <!-- SCRIPT LOADING ORDER IS IMPORTANT -->
    <!-- Load DATA first -->
    <script src="js/scenarios.js"></script>
    <!-- Load ENGINE second -->
    <script src="js/main.js"></script>
</body>
</html>
