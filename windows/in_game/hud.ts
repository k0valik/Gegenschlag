// Get references to the UI elements
const teamBuyConfidenceEl = document.getElementById('team-buy-confidence');
const playerEcoEls = [
    document.getElementById('player-1-eco'),
    document.getElementById('player-2-eco'),
    document.getElementById('player-3-eco'),
    document.getElementById('player-4-eco'),
    document.getElementById('player-5-eco'),
];

// Function to update the UI with new data
function updateUI(data: any) {
    if (teamBuyConfidenceEl) {
        teamBuyConfidenceEl.textContent = data.teamBuyPrediction;
    }

    for (let i = 0; i < playerEcoEls.length; i++) {
        const el = playerEcoEls[i];
        if (el) {
            el.textContent = data.playerEconomies[i];
        }
    }
}

// --- Placeholder Data ---
// In a real scenario, this data would come from the background script
// which gets it from GEP, GSI, or other services.
const placeholderData = {
    teamBuyPrediction: "CONFIDENCE: LIKELY FULL BUY",
    playerEconomies: [
        "$4500",
        "$3200",
        "$5100",
        "$800",
        "$6000"
    ]
};

// --- Initial UI population ---
// Populate the UI with placeholder data on load
window.addEventListener('load', () => {
    updateUI(placeholderData);
});

// --- Event Listener for Real Data ---
// This is where we would listen for messages from the background script
// overwolf.windows.onMessageReceived.addListener((message) => {
//     if (message.id === 'economy_update') {
//         updateUI(message.data);
//     }
// });

// --- Hotkey Toggle Logic ---
// This remains from the original boilerplate to show/hide the window
function toggle() {
    overwolf.windows.getCurrentWindow(win => {
        if (win.window.isVisible) {
            overwolf.windows.hide(win.window.id);
        } else {
            overwolf.windows.restore(win.window.id);
        }
    });
}

overwolf.settings.hotkeys.onPressed.addListener(hk => {
    if (hk.name === 'toggle_overlay') {
        toggle();
    }
});
