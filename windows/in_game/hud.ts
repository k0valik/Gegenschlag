// --- UI Element References ---
const economyChip = {
    lossBonus: document.getElementById('loss-bonus'),
    teamAvgMoney: document.getElementById('team-avg-money'),
    buyPrediction: document.getElementById('buy-prediction'),
};

const riskMeter = {
    bar: document.getElementById('risk-bar'),
};

const playerCards = [
    { avatar: document.getElementById('p1-avatar') as HTMLImageElement, name: document.getElementById('p1-name'), money: document.getElementById('p1-money'), buyLikelihood: document.getElementById('p1-buy-likelihood') },
    { avatar: document.getElementById('p2-avatar') as HTMLImageElement, name: document.getElementById('p2-name'), money: document.getElementById('p2-money'), buyLikelihood: document.getElementById('p2-buy-likelihood') },
    { avatar: document.getElementById('p3-avatar') as HTMLImageElement, name: document.getElementById('p3-name'), money: document.getElementById('p3-money'), buyLikelihood: document.getElementById('p3-buy-likelihood') },
    { avatar: document.getElementById('p4-avatar') as HTMLImageElement, name: document.getElementById('p4-name'), money: document.getElementById('p4-money'), buyLikelihood: document.getElementById('p4-buy-likelihood') },
    { avatar: document.getElementById('p5-avatar') as HTMLImageElement, name: document.getElementById('p5-name'), money: document.getElementById('p5-money'), buyLikelihood: document.getElementById('p5-buy-likelihood') },
];

// --- UI Update Functions ---
function updateEconomyChip(teamState: any) {
    if (!teamState) return;
    // Basic prediction logic, would be more complex
    const avgMoney = teamState.players.reduce((sum: number, p: any) => sum + p.money, 0) / teamState.players.length;
    let prediction = "ECO";
    if (avgMoney > 3700) prediction = "FULL BUY";
    else if (avgMoney > 2000) prediction = "FORCE";

    if (economyChip.lossBonus) economyChip.lossBonus.textContent = `+${teamState.teamLossStreak * 500 + (teamState.teamLossStreak > 0 ? 1400 : 0)}`;
    if (economyChip.teamAvgMoney) economyChip.teamAvgMoney.textContent = `$${Math.round(avgMoney)}`;
    if (economyChip.buyPrediction) economyChip.buyPrediction.textContent = prediction;
}

function updatePlayerCards(players: any[]) {
    for (let i = 0; i < players.length; i++) {
        const card = playerCards[i];
        const data = players[i];
        if (card.name) card.name.textContent = data.name;
        if (card.money) card.money.textContent = `$${data.money}`;
        if (card.buyLikelihood) {
            // This would need its own prediction logic
            let likelihood = "eco";
            if (data.money > 3700) likelihood = "full";
            else if (data.money > 2000) likelihood = "force";
            card.buyLikelihood.textContent = likelihood.toUpperCase();
            card.buyLikelihood.className = `buy-pill ${likelihood}`;
        }
    }
}

// --- Main Update Function ---
function updateUI(data: any) {
    // For now, let's assume we are tracking the Terrorist team
    const enemyTeamState = data.T;
    if (enemyTeamState) {
        updateEconomyChip(enemyTeamState);
        updatePlayerCards(enemyTeamState.players);
    }
}

// --- Event Listener for Real Data ---
overwolf.windows.onMessageReceived.addListener((message) => {
    if (message.id === 'economy_update') {
        console.log("Economy update received:", message.content);
        updateUI(message.content);
    }
});

// --- Hotkey Toggle Logic ---
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
