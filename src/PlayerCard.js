/**
 * @file PlayerCard.js
 * @description A UI component for displaying information about a single enemy player.
 */

export class PlayerCard {
    constructor(playerData) {
        this.playerData = playerData;
        this.element = this.createElement();
        this.update(playerData);
    }

    /**
     * Creates the DOM element for the player card.
     * @returns {HTMLElement} The root element of the player card.
     */
    createElement() {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.style.marginBottom = '10px';
        card.style.padding = '5px';
        card.style.border = '1px solid #555';

        card.innerHTML = `
            <h3 class="player-name" style="margin: 0; padding: 0; font-size: 16px;"></h3>
            <div class="player-stats">
                <span class="vac-status"></span> |
                <span class="faceit-elo"></span>
            </div>
            <div class="cheat-probability" style="font-weight: bold;"></div>
        `;
        return card;
    }

    /**
     * Updates the player card with new data.
     * @param {Object} playerData - The new data for the player.
     */
    update(playerData) {
        this.playerData = playerData;

        this.element.querySelector('.player-name').textContent = this.playerData.personaname || 'Unknown Player';

        const vacStatus = this.playerData.VACBanned ? 'VAC Banned' : 'No VAC Bans';
        this.element.querySelector('.vac-status').textContent = vacStatus;

        const faceitElo = this.playerData.faceit_elo || 'N/A';
        this.element.querySelector('.faceit-elo').textContent = `ELO: ${faceitElo}`;

        // This would be updated after Perplexity analysis
        const cheatProb = this.playerData.cheat_probability || 0;
        this.element.querySelector('.cheat-probability').textContent = `Cheat Probability: ${cheatProb}%`;
    }

    /**
     * Returns the root DOM element for this component.
     * @returns {HTMLElement}
     */
    getElement() {
        return this.element;
    }
}
