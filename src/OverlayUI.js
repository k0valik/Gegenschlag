/**
 * @file OverlayUI.js
 * @description Manages the in-game overlay interface and user interactions.
 * This class is responsible for creating and updating the HTML elements of the overlay.
 */

import { PlayerCard } from './PlayerCard.js';

export class OverlayUI {
    constructor() {
        this.container = null;
        this.playerCards = new Map(); // Map of steamId64 to PlayerCard instance
    }

    /**
     * Creates the main container for the overlay and appends it to the document body.
     */
    show() {
        if (this.container) {
            this.container.style.display = 'block';
            return;
        }

        this.container = document.createElement('div');
        this.container.id = 'cs2-intel-overlay';
        // Add some basic styling
        this.container.style.position = 'fixed';
        this.container.style.top = '10%';
        this.container.style.left = '10px';
        this.container.style.width = '300px';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.container.style.border = '1px solid #333';
        this.container.style.padding = '10px';

        document.body.appendChild(this.container);
        console.log('OverlayUI shown.');
    }

    /**
     * Hides the overlay from view.
     */
    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * Creates or updates a player card with new data.
     * @param {string} steamId64 - The player's Steam ID.
     * @param {Object} playerData - The aggregated data for the player.
     */
    updatePlayerCard(steamId64, playerData) {
        let card = this.playerCards.get(steamId64);

        if (!card) {
            card = new PlayerCard(playerData);
            this.playerCards.set(steamId64, card);
            this.container.appendChild(card.getElement());
        } else {
            card.update(playerData);
        }
    }
}
