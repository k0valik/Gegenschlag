/**
 * @file AppController.js
 * @description The central controller for the CS2 Enemy Intelligence application.
 * This class initializes and coordinates all other components (Agents 1, 2, and 3).
 */

import { EconomyTracker } from './EconomyTracker.js';
import { DataManager } from './DataManager.js';
import { OverlayUI } from './OverlayUI.js';
// API clients would be managed by the DataManager
// import { SteamAPIClient } from './SteamAPIClient.js';
// ... other clients

export class AppController {
    constructor() {
        this.economyTracker = new EconomyTracker();
        this.dataManager = new DataManager();
        this.overlayUI = new OverlayUI();
    }

    /**
     * Starts the application and initializes all necessary components.
     */
    start() {
        console.log('CS2 Enemy Intelligence App Started.');
        this.registerGameEventListeners();
        this.overlayUI.show();
    }

    /**
     * Registers listeners for Overwolf game events.
     */
    registerGameEventListeners() {
        // Example of listening for a kill event
        overwolf.games.events.onNewEvents.addListener((event) => {
            if (event.events) {
                event.events.forEach(e => {
                    if (e.name === 'kill_feed') {
                        this.handleKillEvent(e.data);
                    }
                    if (e.name === 'match_info') {
                        // Handle roster updates, etc.
                    }
                });
            }
        });

        // Start listening to the required game events
        overwolf.games.events.setRequiredFeatures(['kill_feed', 'match_info'], (info) => {
            if (info.status === 'success') {
                console.log('Successfully registered for game events.');
            } else {
                console.error('Failed to register for game events:', info.reason);
            }
        });
    }

    /**
     * Handles a kill event from the game.
     * @param {Object} killData - The data associated with the kill event.
     */
    async handleKillEvent(killData) {
        // 1. Update economy based on the kill
        this.economyTracker.trackKill(/* ... */);

        // 2. Fetch updated player data if necessary
        const killerSteamId = this.getSteamIdForPlayer(killData.killer);
        const playerData = await this.dataManager.getPlayerData(killerSteamId);

        // 3. Update the UI with new information
        this.overlayUI.updatePlayerCard(killerSteamId, playerData);
    }

    /**
     * A helper to get a Steam ID for a given in-game player name.
     * This would need to be implemented based on roster data.
     * @param {string} playerName - The in-game name of the player.
     * @returns {string} The player's 64-bit Steam ID.
     */
    getSteamIdForPlayer(playerName) {
        // Placeholder implementation
        return '...';
    }
}

// Entry point for the app
window.onload = () => {
    const app = new AppController();
    app.start();
};
