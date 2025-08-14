/**
 * @file FaceitClient.js
 * @description A client for interacting with the Faceit API.
 * This is used to fetch competitive statistics and ELO for players.
 */

export class FaceitClient {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Faceit API key is required.');
        }
        this.apiKey = apiKey;
        this.baseUrl = 'https://open.faceit.com/data/v4';
    }

    /**
     * Fetches player details from Faceit by player ID.
     * @param {string} playerId - The player's unique Faceit ID.
     * @returns {Promise<Object>} A promise that resolves with the player's details.
     */
    async getPlayerDetails(playerId) {
        const url = `${this.baseUrl}/players/${playerId}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Faceit API request failed with status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching Faceit player details for ID ${playerId}:`, error);
            throw error;
        }
    }

    /**
     * Fetches player statistics for CS2.
     * @param {string} playerId - The player's unique Faceit ID.
     * @returns {Promise<Object>} A promise that resolves with the player's CS2 stats.
     */
    async getPlayerStats(playerId) {
        const url = `${this.baseUrl}/players/${playerId}/stats/cs2`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Faceit API request failed with status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching Faceit stats for player ID ${playerId}:`, error);
            throw error;
        }
    }
}
