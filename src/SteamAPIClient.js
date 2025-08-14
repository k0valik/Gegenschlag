/**
 * @file SteamAPIClient.js
 * @description A client for interacting with the Steam Web API.
 * This client is responsible for fetching player summaries and ban data.
 */

export class SteamAPIClient {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Steam API key is required.');
        }
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.steampowered.com';
    }

    /**
     * Fetches player summaries for a list of Steam IDs.
     * @param {Array<string>} steamIds - An array of 64-bit Steam IDs.
     * @returns {Promise<Object>} A promise that resolves with the player summaries.
     */
    async getPlayerSummaries(steamIds) {
        const steamIdsString = steamIds.join(',');
        const url = `${this.baseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamIdsString}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Steam API request failed with status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching player summaries:', error);
            throw error;
        }
    }

    /**
     * Fetches player ban information for a list of Steam IDs.
     * @param {Array<string>} steamIds - An array of 64-bit Steam IDs.
     * @returns {Promise<Object>} A promise that resolves with the player ban data.
     */
    async getPlayerBans(steamIds) {
        const steamIdsString = steamIds.join(',');
        const url = `${this.baseUrl}/ISteamUser/GetPlayerBans/v1/?key=${this.apiKey}&steamids=${steamIdsString}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Steam API request failed with status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching player bans:', error);
            throw error;
        }
    }
}
