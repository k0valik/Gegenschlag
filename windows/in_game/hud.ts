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
    {
        avatar: document.getElementById('p1-avatar') as HTMLImageElement,
        name: document.getElementById('p1-name'),
        money: document.getElementById('p1-money'),
        buyLikelihood: document.getElementById('p1-buy-likelihood'),
    },
    {
        avatar: document.getElementById('p2-avatar') as HTMLImageElement,
        name: document.getElementById('p2-name'),
        money: document.getElementById('p2-money'),
        buyLikelihood: document.getElementById('p2-buy-likelihood'),
    },
    {
        avatar: document.getElementById('p3-avatar') as HTMLImageElement,
        name: document.getElementById('p3-name'),
        money: document.getElementById('p3-money'),
        buyLikelihood: document.getElementById('p3-buy-likelihood'),
    },
    {
        avatar: document.getElementById('p4-avatar') as HTMLImageElement,
        name: document.getElementById('p4-name'),
        money: document.getElementById('p4-money'),
        buyLikelihood: document.getElementById('p4-buy-likelihood'),
    },
    {
        avatar: document.getElementById('p5-avatar') as HTMLImageElement,
        name: document.getElementById('p5-name'),
        money: document.getElementById('p5-money'),
        buyLikelihood: document.getElementById('p5-buy-likelihood'),
    },
];

const toastsContainer = document.getElementById('event-toasts');

// --- Placeholder Data ---
const placeholderData = {
    economy: {
        lossBonus: 2,
        teamAvgMoney: 3450,
        buyPrediction: "FORCE",
    },
    players: [
        { name: "Player 1", money: 4500, buyLikelihood: "full", avatarUrl: "" },
        { name: "Player 2", money: 3200, buyLikelihood: "force", avatarUrl: "" },
        { name: "Player 3", money: 5100, buyLikelihood: "full", avatarUrl: "" },
        { name: "Player 4", money: 800, buyLikelihood: "eco", avatarUrl: "" },
        { name: "Player 5", money: 6000, buyLikelihood: "full", avatarUrl: "" },
    ],
    // --- Template for features without a data source ---
    // risk: {
    //     level: 'warn', // ok, warn, crit
    // },
    // eventToast: {
    //     message: "Bomb planted +$800",
    // }
};

// --- UI Update Functions ---
function updateEconomyChip(data: any) {
    if (economyChip.lossBonus) economyChip.lossBonus.textContent = `+${data.lossBonus * 500 + 1400}`;
    if (economyChip.teamAvgMoney) economyChip.teamAvgMoney.textContent = `$${data.teamAvgMoney}`;
    if (economyChip.buyPrediction) economyChip.buyPrediction.textContent = data.buyPrediction;
}

function updatePlayerCards(players: any[]) {
    for (let i = 0; i < players.length; i++) {
        const card = playerCards[i];
        const data = players[i];
        if (card.name) card.name.textContent = data.name;
        if (card.money) card.money.textContent = `$${data.money}`;
        if (card.buyLikelihood) {
            card.buyLikelihood.textContent = data.buyLikelihood.toUpperCase();
            card.buyLikelihood.className = `buy-pill ${data.buyLikelihood}`;
        }
        if (card.avatar && data.avatarUrl) card.avatar.src = data.avatarUrl;
    }
}

/*
// --- Template function for Risk Meter ---
function updateRiskMeter(risk: any) {
    if (riskMeter.bar) {
        riskMeter.bar.className = `risk-bar ${risk.level}`;
    }
}
*/

/*
// --- Template function for Event Toasts ---
function showEventToast(toast: any) {
    if (toastsContainer) {
        const toastEl = document.createElement('div');
        toastEl.className = 'toast';
        toastEl.textContent = toast.message;
        toastsContainer.appendChild(toastEl);
        setTimeout(() => {
            toastEl.remove();
        }, 4000);
    }
}
*/

// --- Main Update Function ---
function updateUI(data: any) {
    updateEconomyChip(data.economy);
    updatePlayerCards(data.players);
    // updateRiskMeter(data.risk); // Call would be here
    // showEventToast(data.eventToast); // Call would be here
}


// --- Initial UI population ---
window.addEventListener('load', () => {
    updateUI(placeholderData);
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
